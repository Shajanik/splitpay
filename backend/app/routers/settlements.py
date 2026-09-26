from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db, DEBTS_COLLECTION
from app.models import SettleRequest, SettleResult
from app.auth import get_current_user

router = APIRouter(prefix="/api/settlements", tags=["settlements"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=SettleResult)
async def settle_balance(payload: SettleRequest):
    """
    Mark all pending debts between two people (in either direction) as settled.
    This clears the balance between them, matching what the Balances page showed.
    """
    database = get_db()
    from_person, to_person = payload.from_person.strip(), payload.to_person.strip()

    query = {
        "status": "pending",
        "$or": [
            {"from_person": from_person, "to_person": to_person},
            {"from_person": to_person, "to_person": from_person},
        ],
    }

    pending_docs = await database[DEBTS_COLLECTION].find(query).to_list(length=None)
    if not pending_docs:
        raise HTTPException(status_code=404, detail="No pending balance found between these people")

    total = sum(
        d["amount"] if d["from_person"] == from_person else -d["amount"]
        for d in pending_docs
    )

    settled_at = datetime.utcnow().isoformat()
    result = await database[DEBTS_COLLECTION].update_many(
        query, {"$set": {"status": "settled", "settled_at": settled_at}}
    )

    return SettleResult(
        from_person=from_person if total >= 0 else to_person,
        to_person=to_person if total >= 0 else from_person,
        settled_amount=round(abs(total), 2),
        debts_settled=result.modified_count,
    )
