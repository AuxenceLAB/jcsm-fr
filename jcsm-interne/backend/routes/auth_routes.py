"""Routes d'authentification."""

from datetime import datetime
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session

from database import get_db
from auth import authenticate, create_session, delete_session, get_current_user
from schemas import LoginRequest, LoginResponse, UserInfo

router = APIRouter()

# Rate limiting simple : {ip: [timestamps]}
_login_attempts: dict[str, list[datetime]] = defaultdict(list)
RATE_LIMIT = 5  # tentatives
RATE_WINDOW = 60  # secondes


def _check_rate_limit(ip: str):
    now = datetime.utcnow()
    # Nettoyer les anciennes tentatives
    _login_attempts[ip] = [
        t for t in _login_attempts[ip]
        if (now - t).total_seconds() < RATE_WINDOW
    ]
    if len(_login_attempts[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Trop de tentatives. Réessayez dans 1 minute.")
    _login_attempts[ip].append(now)


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    result = authenticate(req.password, db)
    if not result:
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")

    token = create_session(result["role"], result["prenom"], result.get("technicien_id"))
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=86400,
    )
    return LoginResponse(**result)


@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        delete_session(token)
    response.delete_cookie("session_token")
    return {"message": "Déconnexion réussie"}


@router.get("/me", response_model=UserInfo)
async def me(user: dict = Depends(get_current_user)):
    return UserInfo(
        role=user["role"],
        prenom=user["prenom"],
        technicien_id=user.get("technicien_id"),
    )
