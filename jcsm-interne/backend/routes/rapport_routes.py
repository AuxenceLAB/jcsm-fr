"""Routes rapports — Création, reformulation IA, PDF."""

import os
import shutil
from datetime import datetime, time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user, require_admin
from models import Rapport, Intervention
from schemas import (
    RapportCreate, RapportUpdate, RapportOut,
    ReformulationRequest, ReformulationResponse,
)
from services.ia_reformulation import reformuler_texte
from services.pdf_generator import generer_pdf_rapport
from config import UPLOAD_DIR

router = APIRouter()


def _parse_time(t: Optional[str]) -> Optional[time]:
    if not t:
        return None
    try:
        parts = t.split(":")
        return time(int(parts[0]), int(parts[1]))
    except (ValueError, IndexError):
        return None


def _calc_duree(debut: Optional[time], fin: Optional[time]) -> Optional[int]:
    if not debut or not fin:
        return None
    d = datetime.combine(datetime.today(), fin) - datetime.combine(datetime.today(), debut)
    return int(d.total_seconds() / 60)


@router.get("/", response_model=list[RapportOut])
async def list_rapports(
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(Rapport).order_by(Rapport.created_at.desc()).all()


@router.get("/{rapport_id}", response_model=RapportOut)
async def get_rapport(
    rapport_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = db.query(Rapport).filter(Rapport.id == rapport_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")
    return r


@router.get("/{rapport_id}/pdf")
async def download_pdf(
    rapport_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = db.query(Rapport).filter(Rapport.id == rapport_id).first()
    if not r or not r.pdf_path:
        raise HTTPException(status_code=404, detail="PDF non trouvé")
    if not os.path.exists(r.pdf_path):
        raise HTTPException(status_code=404, detail="Fichier PDF introuvable")
    return FileResponse(r.pdf_path, media_type="application/pdf", filename=os.path.basename(r.pdf_path))


@router.get("/{rapport_id}/photos")
async def get_photos(
    rapport_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = db.query(Rapport).filter(Rapport.id == rapport_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")
    return r.photos or []


@router.post("/", response_model=RapportOut)
async def create_rapport(
    data: RapportCreate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Vérifier intervention
    intervention = db.query(Intervention).filter(Intervention.id == data.intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention non trouvée")

    heure_debut = _parse_time(data.heure_debut)
    heure_fin = _parse_time(data.heure_fin)

    rapport = Rapport(
        intervention_id=data.intervention_id,
        technicien_id=data.technicien_id,
        date_intervention=data.date_intervention,
        heure_debut=heure_debut,
        heure_fin=heure_fin,
        duree_minutes=_calc_duree(heure_debut, heure_fin),
        client=intervention.client,
        nom_site=intervention.nom_site,
        adresse=intervention.adresse,
        ticket=intervention.numero_job,
        texte_brut_technicien=data.texte_brut_technicien,
        description=data.description,
        commentaires=data.commentaires,
        prochaines_etapes=data.prochaines_etapes,
        risques=data.risques,
        photos=data.photos or [],
        source=data.source,
        statut_rapport="brouillon",
    )
    db.add(rapport)
    db.commit()
    db.refresh(rapport)

    # Mettre à jour intervention
    intervention.rapport_id = rapport.id
    intervention.rapport_genere = True
    if intervention.statut == "terminee":
        intervention.statut = "rapport_fait"
    db.commit()

    return rapport


@router.put("/{rapport_id}", response_model=RapportOut)
async def update_rapport(
    rapport_id: int,
    data: RapportUpdate,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = db.query(Rapport).filter(Rapport.id == rapport_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")

    update_data = data.model_dump(exclude_unset=True)

    if "heure_debut" in update_data:
        r.heure_debut = _parse_time(update_data.pop("heure_debut"))
    if "heure_fin" in update_data:
        r.heure_fin = _parse_time(update_data.pop("heure_fin"))

    for key, value in update_data.items():
        setattr(r, key, value)

    r.duree_minutes = _calc_duree(r.heure_debut, r.heure_fin)
    r.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(r)
    return r


@router.post("/reformuler", response_model=ReformulationResponse)
async def reformuler(
    data: ReformulationRequest,
    user: dict = Depends(get_current_user),
):
    result = await reformuler_texte(
        texte_brut=data.texte_brut,
        client=data.client,
        nom_site=data.nom_site,
        marque=data.marque,
        charger_id=data.charger_id,
        probleme=data.probleme,
    )
    return ReformulationResponse(**result)


@router.post("/{rapport_id}/generer-pdf")
async def generer_pdf(
    rapport_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = db.query(Rapport).filter(Rapport.id == rapport_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")

    pdf_path = generer_pdf_rapport(r)
    r.pdf_path = pdf_path
    r.statut_rapport = "complet"
    r.updated_at = datetime.utcnow()
    db.commit()
    return {"pdf_path": pdf_path, "message": "PDF généré"}


@router.post("/upload-photos")
async def upload_photos(
    files: list[UploadFile] = File(...),
    user: dict = Depends(get_current_user),
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    uploaded = []
    for f in files:
        # Vérifier MIME type
        if not f.content_type or not f.content_type.startswith("image/"):
            continue
        # Vérifier taille (10 Mo max)
        content = await f.read()
        if len(content) > 10 * 1024 * 1024:
            continue

        filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{f.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as out:
            out.write(content)
        uploaded.append({
            "url": f"/uploads/{filename}",
            "filename": filename,
            "timestamp": datetime.utcnow().isoformat(),
        })
    return {"photos": uploaded, "count": len(uploaded)}
