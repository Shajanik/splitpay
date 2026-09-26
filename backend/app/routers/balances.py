from fastapi import APIRouter, Depends
from app.database import get_db, DEBTS_COLLECTION
from app.models import BalanceOut, DebtOut
from app.helpers import compute_net_balances, serialize_debt
from app.auth import get_current_user

router = APIRouter(prefix="/api/balances", tags=["balances"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[BalanceOut])
async def get_balances(person: str | None = None):
    """Net pending balances between people (who owes whom, netted)."""
    return await compute_net_balances(person)


@router.get("/settled", response_model=list[DebtOut])
async def get_settled_history(limit: int = 100):
    """Individual settled debt records, most recently settled first."""
    database = get_db()
    cursor = (
        database[DEBTS_COLLECTION]
        .find({"status": "settled"})
        .sort("settled_at", -1)
        .limit(limit)
    )
    return [serialize_debt(d) async for d in cursor]
