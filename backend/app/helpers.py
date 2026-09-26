"""
Shared helper functions: serialization and balance/debt aggregation logic.
"""
from datetime import datetime, date
from bson import ObjectId
from app.database import get_db, EXPENSES_COLLECTION, DEBTS_COLLECTION


def oid_str(doc_id) -> str:
    return str(doc_id)


def serialize_expense(doc: dict, pending_count: int = 0) -> dict:
    return {
        "id": oid_str(doc["_id"]),
        "description": doc["description"],
        "amount": doc["amount"],
        "paid_by": doc["paid_by"],
        "participants": doc["participants"],
        "split_amount": doc["split_amount"],
        "expense_date": doc["expense_date"],
        "created_at": doc["created_at"],
        "settlement_status": "settled" if pending_count == 0 else "pending",
        "pending_count": pending_count,
    }


def serialize_debt(doc: dict) -> dict:
    return {
        "id": oid_str(doc["_id"]),
        "expense_id": doc["expense_id"],
        "description": doc["description"],
        "from_person": doc["from_person"],
        "to_person": doc["to_person"],
        "amount": doc["amount"],
        "status": doc["status"],
        "created_at": doc["created_at"],
        "settled_at": doc.get("settled_at"),
    }


async def pending_count_for_expense(expense_id: str) -> int:
    database = get_db()
    return await database[DEBTS_COLLECTION].count_documents(
        {"expense_id": expense_id, "status": "pending"}
    )


async def compute_net_balances(person: str | None = None) -> list[dict]:
    """
    Aggregate all *pending* debts into net balances per unordered pair of people.
    If `person` is given, only pairs involving that person are returned.
    Pairs that net out to (near) zero are auto-settled in the background.
    """
    database = get_db()
    cursor = database[DEBTS_COLLECTION].find({"status": "pending"})
    pair_totals: dict[frozenset, dict[str, float]] = {}

    async for debt in cursor:
        a, b = debt["from_person"], debt["to_person"]
        key = frozenset([a, b])
        if key not in pair_totals:
            pair_totals[key] = {}
        pair_totals[key][a] = pair_totals[key].get(a, 0.0) + debt["amount"]

    results = []
    auto_settle_pairs = []

    for key, totals in pair_totals.items():
        people = list(key)
        if len(people) == 1:
            # from == to shouldn't normally happen, skip
            continue
        p1, p2 = people[0], people[1]
        amt_p1_to_p2 = totals.get(p1, 0.0)
        amt_p2_to_p1 = totals.get(p2, 0.0)
        net = amt_p1_to_p2 - amt_p2_to_p1

        if abs(net) < 0.01:
            auto_settle_pairs.append((p1, p2))
            continue

        if net > 0:
            entry = {"from_person": p1, "to_person": p2, "amount": round(net, 2)}
        else:
            entry = {"from_person": p2, "to_person": p1, "amount": round(-net, 2)}

        if person is None or person in (entry["from_person"], entry["to_person"]):
            results.append(entry)

    # Clean up fully-netted pairs so history stays tidy
    for p1, p2 in auto_settle_pairs:
        await database[DEBTS_COLLECTION].update_many(
            {
                "status": "pending",
                "$or": [
                    {"from_person": p1, "to_person": p2},
                    {"from_person": p2, "to_person": p1},
                ],
            },
            {"$set": {"status": "settled", "settled_at": datetime.utcnow().isoformat()}},
        )

    results.sort(key=lambda e: e["amount"], reverse=True)
    return results
