from fastapi import APIRouter, Depends
from app.database import get_db, EXPENSES_COLLECTION, DEBTS_COLLECTION
from app.models import DashboardOut
from app.helpers import serialize_expense, compute_net_balances, pending_count_for_expense
from app.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=DashboardOut)
async def get_dashboard(person: str = "You"):
    database = get_db()

    # Total spent across the whole group (all expenses, all time)
    total = 0.0
    async for doc in database[EXPENSES_COLLECTION].find({}, {"amount": 1}):
        total += doc["amount"]

    # Owed to me / I owe, from pending debts directly involving `person`
    owed_to_me = 0.0
    async for d in database[DEBTS_COLLECTION].find(
        {"status": "pending", "to_person": person}
    ):
        owed_to_me += d["amount"]

    i_owe = 0.0
    async for d in database[DEBTS_COLLECTION].find(
        {"status": "pending", "from_person": person}
    ):
        i_owe += d["amount"]

    net_balances = await compute_net_balances(person)

    recent_docs = (
        database[EXPENSES_COLLECTION].find().sort("created_at", -1).limit(5)
    )
    recent = []
    async for doc in recent_docs:
        pending = await pending_count_for_expense(str(doc["_id"]))
        recent.append(serialize_expense(doc, pending_count=pending))

    return DashboardOut(
        person=person,
        total_group_expenses=round(total, 2),
        owed_to_me=round(owed_to_me, 2),
        i_owe=round(i_owe, 2),
        pending_settlements=len(net_balances),
        recent_expenses=recent,
    )
