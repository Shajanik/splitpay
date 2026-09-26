from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends

from app.database import get_db, USERS_COLLECTION
from app.models import SignupRequest, LoginRequest, TokenResponse, UserOut
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(payload: SignupRequest):
    database = get_db()
    username_key = payload.username.strip().lower()

    existing = await database[USERS_COLLECTION].find_one({"username_key": username_key})
    if existing:
        raise HTTPException(status_code=409, detail="That username is already taken.")

    display_name = (payload.display_name or payload.username).strip()
    doc = {
        "username_key": username_key,
        "username": payload.username.strip(),
        "display_name": display_name,
        "password_hash": hash_password(payload.password),
        "created_at": datetime.utcnow().isoformat(),
    }
    await database[USERS_COLLECTION].insert_one(doc)

    token = create_access_token({"sub": doc["username"]})
    return TokenResponse(access_token=token, username=doc["username"], display_name=display_name)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    database = get_db()
    username_key = payload.username.strip().lower()

    user = await database[USERS_COLLECTION].find_one({"username_key": username_key})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password.")

    token = create_access_token({"sub": user["username"]})
    return TokenResponse(access_token=token, username=user["username"], display_name=user["display_name"])


@router.get("/me", response_model=UserOut)
async def me(current_user: str = Depends(get_current_user)):
    database = get_db()
    user = await database[USERS_COLLECTION].find_one({"username_key": current_user.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(username=user["username"], display_name=user["display_name"])


@router.post("/logout")
async def logout(current_user: str = Depends(get_current_user)):
    # JWTs are stateless here, so there's nothing to invalidate server-side —
    # the frontend simply discards the token. This endpoint exists so the
    # client has a clear, auth-checked action to call on logout.
    return {"message": f"Logged out {current_user}. Discard your token client-side."}
