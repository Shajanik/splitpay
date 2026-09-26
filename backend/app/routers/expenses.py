from datetime import datetime, date
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from bson.errors import InvalidId

from app.database import get_db, EXPENSES_COLLECTION, DEBTS_COLLECTION
from app.models import ExpenseCreate, ExpenseOut, DebtOut
from app.helpers import serialize_expense, serialize_debt, pending_count_for_expense
from app.auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["expenses"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=ExpenseOut, status_code=201)
async def create_expense(payload: ExpenseCreate):
    database = get_db()

    participants = payload.participants
    paid_by = payload.paid_by

    # The payer must be part of the split (they consumed a share too, by default)
    if paid_by not in participants:
        participants = [paid_by] + participants

    split_amount = round(payload.amount / len(participants), 2)
    expense_date = payload.expense_date or date.today().isoformat()
    created_at = datetime.utcnow().isoformat()

    expense_doc = {
        "description": payload.description,
        "amount": payload.amount,
        "paid_by": paid_by,
        "participants": participants,
        "split_amount": split_amount,
        "expense_date": expense_date,
        "created_at": created_at,
    }
    result = await database[EXPENSES_COLLECTION].insert_one(expense_doc)
    expense_id = str(result.inserted_id)

    # Create one debt record per participant who isn't the payer
    debt_docs = []
    for person in participants:
        if person == paid_by:
            continue
        debt_docs.append(
            {
                "expense_id": expense_id,
                "description": payload.description,
                "from_person": person,
                "to_person": paid_by,
                "amount": split_amount,
                "status": "pending",
                "created_at": created_at,
                "settled_at": None,
            }
        )
    if debt_docs:
        await database[DEBTS_COLLECTION].insert_many(debt_docs)

    expense_doc["_id"] = result.inserted_id
    return serialize_expense(expense_doc, pending_count=len(debt_docs))


@router.get("", response_model=list[ExpenseOut])
async def list_expenses(limit: int = 200):
    database = get_db()
    cursor = database[EXPENSES_COLLECTION].find().sort("created_at", -1).limit(limit)
    expenses = []
    async for doc in cursor:
        pending = await pending_count_for_expense(str(doc["_id"]))
        expenses.append(serialize_expense(doc, pending_count=pending))
    return expenses


@router.get("/people", response_model=list[str])
async def list_people():
    """Distinct set of people who have ever paid or participated — for autocomplete."""
    database = get_db()
    names = set()
    async for doc in database[EXPENSES_COLLECTION].find({}, {"paid_by": 1, "participants": 1}):
        names.add(doc["paid_by"])
        for p in doc.get("participants", []):
            names.add(p)
    return sorted(names)


@router.get("/{expense_id}", response_model=ExpenseOut)
async def get_expense(expense_id: str):
    database = get_db()
    try:
        oid = ObjectId(expense_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid expense id")

    doc = await database[EXPENSES_COLLECTION].find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Expense not found")

    debts = []
    async for d in database[DEBTS_COLLECTION].find({"expense_id": expense_id}):
        debts.append(serialize_debt(d))

    pending = sum(1 for d in debts if d["status"] == "pending")
    out = serialize_expense(doc, pending_count=pending)
    out["debts"] = debts
    return out


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(expense_id: str):
    database = get_db()
    try:
        oid = ObjectId(expense_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid expense id")

    result = await database[EXPENSES_COLLECTION].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    await database[DEBTS_COLLECTION].delete_many({"expense_id": expense_id})
    return None
