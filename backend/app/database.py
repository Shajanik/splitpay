"""
MongoDB connection setup using Motor (async driver).
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "splitpay_expenses")

client: AsyncIOMotorClient | None = None
db = None


def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB]
    return db


def close_mongo_connection():
    global client
    if client:
        client.close()


def get_db():
    """Dependency-style accessor for the database instance."""
    global db
    if db is None:
        db = connect_to_mongo()
    return db


# Collection name constants
EXPENSES_COLLECTION = "expenses"
DEBTS_COLLECTION = "debts"
USERS_COLLECTION = "users"


async def ensure_indexes():
    """Create helpful indexes. Safe to call repeatedly."""
    database = get_db()
    await database[EXPENSES_COLLECTION].create_index("created_at")
    await database[DEBTS_COLLECTION].create_index("status")
    await database[DEBTS_COLLECTION].create_index([("from_person", 1), ("to_person", 1)])
    await database[DEBTS_COLLECTION].create_index("expense_id")
    await database[USERS_COLLECTION].create_index("username_key", unique=True)
