import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import connect_to_mongo, close_mongo_connection, ensure_indexes
from app.routers import expenses, balances, settlements, dashboard, auth

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    await ensure_indexes()
    yield
    close_mongo_connection()


app = FastAPI(
    title="SplitPay — Expense Sharing API",
    description="Backend for the SplitPay payments & expense-sharing app.",
    version="1.0.0",
    lifespan=lifespan,
)

default_origins = "http://localhost:5173,http://127.0.0.1:5173"
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", default_origins).split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(balances.router)
app.include_router(settlements.router)
app.include_router(dashboard.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "splitpay-api"}
