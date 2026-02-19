"""Authentification — Sessions + cookies."""

from datetime import datetime, timedelta
from typing import Optional
import secrets

from fastapi import Request, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Technicien
from config import ADMIN_PASSWORD, SECRET_KEY, SESSION_EXPIRE_HOURS
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory session store (pour MVP — migrer vers Redis en prod si besoin)
sessions: dict[str, dict] = {}


def create_session(role: str, prenom: str, technicien_id: Optional[int] = None) -> str:
    """Crée une session et retourne le token."""
    token = secrets.token_urlsafe(32)
    sessions[token] = {
        "role": role,
        "prenom": prenom,
        "technicien_id": technicien_id,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(hours=SESSION_EXPIRE_HOURS),
    }
    return token


def get_session(token: str) -> Optional[dict]:
    """Récupère une session valide."""
    session = sessions.get(token)
    if not session:
        return None
    if datetime.utcnow() > session["expires_at"]:
        del sessions[token]
        return None
    return session


def delete_session(token: str):
    """Supprime une session."""
    sessions.pop(token, None)


def get_current_user(request: Request) -> dict:
    """Dépendance FastAPI — utilisateur connecté via cookie."""
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    session = get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Session expirée")
    return session


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Dépendance — admin requis."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Accès admin requis")
    return user


def require_technicien(user: dict = Depends(get_current_user)) -> dict:
    """Dépendance — technicien requis."""
    if user["role"] != "technicien":
        raise HTTPException(status_code=403, detail="Accès technicien requis")
    return user


def authenticate(password: str, db: Session) -> Optional[dict]:
    """Authentifie un utilisateur par mot de passe.

    - JCSMADMIN → admin
    - prénom en minuscule → technicien
    """
    # Admin
    if password == ADMIN_PASSWORD:
        return {"role": "admin", "prenom": "Auxence", "technicien_id": None}

    # Technicien — le prénom en minuscule sert de mot de passe
    prenom_lower = password.lower().strip()
    tech = db.query(Technicien).filter(
        Technicien.prenom.ilike(prenom_lower),
        Technicien.actif == True,
    ).first()
    if tech:
        return {"role": "technicien", "prenom": tech.prenom, "technicien_id": tech.id}

    return None
