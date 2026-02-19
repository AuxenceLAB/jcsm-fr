"""Routes interventions — Admin + Technicien."""

import csv
import io
from datetime import datetime
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, case, or_
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user, require_admin
from models import Intervention, Technicien, PaiementTechnicien
from schemas import (
    InterventionCreate, InterventionUpdate, InterventionOut,
    InterventionAssign, InterventionStatut, InterventionStats,
)

router = APIRouter()

STATUTS_VALIDES = [
    "a_planifier", "assignee", "notifiee", "en_route",
    "sur_site", "terminee", "rapport_fait", "facturee", "payee",
]


def _next_numero(db: Session) -> str:
    """Génère le prochain numéro d'intervention JCSM-XXXX."""
    last = db.query(func.max(Intervention.id)).scalar() or 0
    return f"JCSM-{last + 1:04d}"


def _intervention_to_out(i: Intervention) -> dict:
    """Convertit une intervention en dict pour la réponse."""
    data = {c.name: getattr(i, c.name) for c in i.__table__.columns}
    data["technicien_prenom"] = i.technicien.prenom if i.technicien else None
    return data


# ── Admin routes ──

@router.get("/interventions", response_model=list[InterventionOut])
async def list_interventions(
    statut: Optional[str] = None,
    technicien_id: Optional[int] = None,
    client: Optional[str] = None,
    departement: Optional[int] = None,
    mois: Optional[str] = None,
    search: Optional[str] = None,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Intervention).filter(Intervention.supprime == False)
    if statut:
        q = q.filter(Intervention.statut == statut)
    if technicien_id:
        q = q.filter(Intervention.technicien_id == technicien_id)
    if client:
        q = q.filter(Intervention.client.ilike(f"%{client}%"))
    if departement:
        q = q.filter(Intervention.departement == departement)
    if mois:
        # Format: "2025-08"
        try:
            year, month = mois.split("-")
            q = q.filter(
                func.extract("year", Intervention.date_demande) == int(year),
                func.extract("month", Intervention.date_demande) == int(month),
            )
        except ValueError:
            pass
    if search:
        q = q.filter(or_(
            Intervention.nom_site.ilike(f"%{search}%"),
            Intervention.numero_intervention.ilike(f"%{search}%"),
            Intervention.numero_job.ilike(f"%{search}%"),
            Intervention.probleme.ilike(f"%{search}%"),
        ))
    interventions = q.order_by(Intervention.date_demande.desc()).all()
    return [InterventionOut(**_intervention_to_out(i)) for i in interventions]


@router.get("/interventions/stats", response_model=InterventionStats)
async def intervention_stats(
    mois: Optional[str] = None,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Intervention).filter(Intervention.supprime == False)
    if mois:
        try:
            year, month = mois.split("-")
            q = q.filter(
                func.extract("year", Intervention.date_demande) == int(year),
                func.extract("month", Intervention.date_demande) == int(month),
            )
        except ValueError:
            pass

    total = q.count()
    a_planifier = q.filter(Intervention.statut == "a_planifier").count()
    en_cours = q.filter(Intervention.statut.in_(["assignee", "notifiee", "en_route", "sur_site"])).count()
    terminees = q.filter(Intervention.statut.in_(["terminee", "rapport_fait", "facturee", "payee"])).count()

    ca_ht = db.query(func.coalesce(func.sum(Intervention.total_ht), 0)).filter(
        Intervention.supprime == False,
        Intervention.total_ht.isnot(None),
    ).scalar()

    paiements_tech = db.query(func.coalesce(func.sum(PaiementTechnicien.montant), 0)).scalar()
    marge = ca_ht - paiements_tech

    # Taux réussite
    done = q.filter(Intervention.fait == True).count()
    reussi = q.filter(Intervention.reussi == True).count()
    taux = (reussi / done * 100) if done > 0 else 0

    return InterventionStats(
        total=total,
        a_planifier=a_planifier,
        en_cours=en_cours,
        terminees=terminees,
        ca_ht=Decimal(str(ca_ht)),
        marge_nette=Decimal(str(marge)),
        taux_reussite=round(taux, 1),
    )


@router.get("/interventions/export-csv")
async def export_csv(
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    interventions = db.query(Intervention).filter(Intervention.supprime == False).order_by(Intervention.id).all()
    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow([
        "N°", "Job", "Site", "Dept", "Adresse", "Client", "Demandeur",
        "Date demande", "Date proposée", "SLA", "Problème", "Statut",
        "Technicien", "Fait", "Réussi", "Total HT",
    ])
    for i in interventions:
        writer.writerow([
            i.numero_intervention, i.numero_job, i.nom_site, i.departement,
            i.adresse, i.client, i.demandeur, i.date_demande, i.date_proposee,
            i.sla_jours, i.probleme, i.statut,
            i.technicien.prenom if i.technicien else "",
            "Oui" if i.fait else "Non",
            "Oui" if i.reussi else ("Non" if i.reussi is False else ""),
            str(i.total_ht) if i.total_ht else "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=interventions_jcsm.csv"},
    )


@router.get("/interventions/{intervention_id}", response_model=InterventionOut)
async def get_intervention(
    intervention_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    i = db.query(Intervention).filter(
        Intervention.id == intervention_id,
        Intervention.supprime == False,
    ).first()
    if not i:
        raise HTTPException(status_code=404, detail="Intervention non trouvée")
    return InterventionOut(**_intervention_to_out(i))


@router.post("/interventions", response_model=InterventionOut)
async def create_intervention(
    data: InterventionCreate,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    intervention = Intervention(**data.model_dump())
    intervention.numero_intervention = _next_numero(db)
    db.add(intervention)
    db.commit()
    db.refresh(intervention)
    return InterventionOut(**_intervention_to_out(intervention))


@router.put("/interventions/{intervention_id}", response_model=InterventionOut)
async def update_intervention(
    intervention_id: int,
    data: InterventionUpdate,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    i = db.query(Intervention).filter(
        Intervention.id == intervention_id,
        Intervention.supprime == False,
    ).first()
    if not i:
        raise HTTPException(status_code=404, detail="Intervention non trouvée")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(i, key, value)
    i.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(i)
    return InterventionOut(**_intervention_to_out(i))


@router.put("/interventions/{intervention_id}/assigner", response_model=InterventionOut)
async def assign_intervention(
    intervention_id: int,
    data: InterventionAssign,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    i = db.query(Intervention).filter(
        Intervention.id == intervention_id,
        Intervention.supprime == False,
    ).first()
    if not i:
        raise HTTPException(status_code=404, detail="Intervention non trouvée")

    tech = db.query(Technicien).filter(Technicien.id == data.technicien_id, Technicien.actif == True).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technicien non trouvé")

    i.technicien_id = tech.id
    i.date_assignation = datetime.utcnow()
    i.statut = "assignee"
    i.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(i)

    # n8n sera notifié via le webhook (appelé côté frontend ou par un event)
    return InterventionOut(**_intervention_to_out(i))


@router.put("/interventions/{intervention_id}/statut", response_model=InterventionOut)
async def change_statut(
    intervention_id: int,
    data: InterventionStatut,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.statut not in STATUTS_VALIDES:
        raise HTTPException(status_code=400, detail=f"Statut invalide: {data.statut}")

    i = db.query(Intervention).filter(
        Intervention.id == intervention_id,
        Intervention.supprime == False,
    ).first()
    if not i:
        raise HTTPException(status_code=404, detail="Intervention non trouvée")

    ancien_statut = i.statut
    i.statut = data.statut

    # Auto-cochage
    if data.statut == "terminee":
        i.fait = True
    if data.reussi is not None:
        i.reussi = data.reussi

    i.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(i)
    return InterventionOut(**_intervention_to_out(i))


@router.delete("/interventions/{intervention_id}")
async def delete_intervention(
    intervention_id: int,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    i = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Intervention non trouvée")
    i.supprime = True
    i.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Intervention supprimée"}


# ── Technicien routes ──

@router.get("/tech/mes-interventions", response_model=list[InterventionOut])
async def mes_interventions(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user["role"] != "technicien" or not user.get("technicien_id"):
        raise HTTPException(status_code=403, detail="Accès technicien requis")

    interventions = db.query(Intervention).filter(
        Intervention.technicien_id == user["technicien_id"],
        Intervention.supprime == False,
    ).order_by(Intervention.date_demande.desc()).all()
    return [InterventionOut(**_intervention_to_out(i)) for i in interventions]


@router.put("/tech/interventions/{intervention_id}/statut", response_model=InterventionOut)
async def tech_change_statut(
    intervention_id: int,
    data: InterventionStatut,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user["role"] != "technicien" or not user.get("technicien_id"):
        raise HTTPException(status_code=403, detail="Accès technicien requis")

    i = db.query(Intervention).filter(
        Intervention.id == intervention_id,
        Intervention.technicien_id == user["technicien_id"],
        Intervention.supprime == False,
    ).first()
    if not i:
        raise HTTPException(status_code=404, detail="Intervention non trouvée")

    if data.statut not in STATUTS_VALIDES:
        raise HTTPException(status_code=400, detail=f"Statut invalide: {data.statut}")

    i.statut = data.statut
    if data.statut == "terminee":
        i.fait = True
    if data.reussi is not None:
        i.reussi = data.reussi
    i.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(i)
    return InterventionOut(**_intervention_to_out(i))
