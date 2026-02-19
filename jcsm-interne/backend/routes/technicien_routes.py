"""Routes techniciens — Admin."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from auth import require_admin
from models import Technicien
from schemas import TechnicienCreate, TechnicienUpdate, TechnicienOut

router = APIRouter()


@router.get("/", response_model=list[TechnicienOut])
async def list_techniciens(
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(Technicien).filter(Technicien.actif == True).order_by(Technicien.prenom).all()


@router.get("/all", response_model=list[TechnicienOut])
async def list_all_techniciens(
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Liste tous les techniciens, y compris inactifs."""
    return db.query(Technicien).order_by(Technicien.prenom).all()


@router.get("/{technicien_id}", response_model=TechnicienOut)
async def get_technicien(
    technicien_id: int,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    tech = db.query(Technicien).filter(Technicien.id == technicien_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technicien non trouvé")
    return tech


@router.post("/", response_model=TechnicienOut)
async def create_technicien(
    data: TechnicienCreate,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    # Vérifier unicité du prénom
    existing = db.query(Technicien).filter(Technicien.prenom.ilike(data.prenom)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un technicien avec ce prénom existe déjà")

    tech = Technicien(**data.model_dump())
    tech.prenom = tech.prenom.lower()
    db.add(tech)
    db.commit()
    db.refresh(tech)
    return tech


@router.put("/{technicien_id}", response_model=TechnicienOut)
async def update_technicien(
    technicien_id: int,
    data: TechnicienUpdate,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    tech = db.query(Technicien).filter(Technicien.id == technicien_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technicien non trouvé")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tech, key, value)
    tech.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tech)
    return tech


@router.put("/{technicien_id}/reactiver", response_model=TechnicienOut)
async def reactiver_technicien(
    technicien_id: int,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    tech = db.query(Technicien).filter(Technicien.id == technicien_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technicien non trouvé")
    tech.actif = True
    tech.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tech)
    return tech


@router.delete("/{technicien_id}")
async def desactiver_technicien(
    technicien_id: int,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    tech = db.query(Technicien).filter(Technicien.id == technicien_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technicien non trouvé")
    tech.actif = False
    tech.updated_at = datetime.utcnow()
    db.commit()
    return {"message": f"Technicien {tech.prenom} désactivé"}
