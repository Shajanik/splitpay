"""
Pydantic request/response models for the SplitPay expense-sharing API.
"""
from datetime import datetime, date
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator


def now_iso() -> str:
    return datetime.utcnow().isoformat()


class ExpenseCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    paid_by: str = Field(..., min_length=1, max_length=60)
    participants: List[str] = Field(..., min_length=1)
    expense_date: Optional[str] = None  # ISO date string; defaults to today

    @field_validator("participants")
    @classmethod
    def clean_participants(cls, v: List[str]) -> List[str]:
        cleaned = []
        seen = set()
        for p in v:
            name = p.strip()
            if not name:
                continue
            key = name.lower()
            if key not in seen:
                seen.add(key)
                cleaned.append(name)
        if len(cleaned) < 2:
            raise ValueError("An expense needs at least 2 participants to split.")
        return cleaned

    @field_validator("paid_by")
    @classmethod
    def clean_paid_by(cls, v: str) -> str:
        return v.strip()

    @field_validator("description")
    @classmethod
    def clean_description(cls, v: str) -> str:
        return v.strip()


class DebtOut(BaseModel):
    id: str
    expense_id: str
    description: str
    from_person: str
    to_person: str
    amount: float
    status: Literal["pending", "settled"]
    created_at: str
    settled_at: Optional[str] = None


class ExpenseOut(BaseModel):
    id: str
    description: str
    amount: float
    paid_by: str
    participants: List[str]
    split_amount: float
    expense_date: str
    created_at: str
    settlement_status: Literal["pending", "settled"]
    pending_count: int
    debts: Optional[List[DebtOut]] = None


class BalanceOut(BaseModel):
    from_person: str
    to_person: str
    amount: float


class SettleRequest(BaseModel):
    from_person: str = Field(..., min_length=1)
    to_person: str = Field(..., min_length=1)


class SettleResult(BaseModel):
    from_person: str
    to_person: str
    settled_amount: float
    debts_settled: int


class DashboardOut(BaseModel):
    person: str
    total_group_expenses: float
    owed_to_me: float
    i_owe: float
    pending_settlements: int
    recent_expenses: List[ExpenseOut]


# --- Auth ---

class SignupRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=40)
    password: str = Field(..., min_length=6, max_length=100)
    display_name: Optional[str] = Field(None, max_length=60)

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str) -> str:
        v = v.strip()
        if not v.replace("_", "").replace(".", "").replace("-", "").isalnum():
            raise ValueError("Usernames can only contain letters, numbers, '.', '_' and '-'.")
        return v


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    display_name: str


class UserOut(BaseModel):
    username: str
    display_name: str

