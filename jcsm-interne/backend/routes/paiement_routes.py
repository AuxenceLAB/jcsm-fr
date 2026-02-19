"""Routes paiements — Admin."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from auth import require_admin
from models import PaiementTechnicien, Technicien, Intervention
from schemas import PaiementOut, PaiementPayer, PaiementBulk, SynthesePaiement

router = APIRouter()


@router.get("/", response_model=list[PaiementOut])
async def list_paiements(
    technicien_id: Optional[int] = None,
    statut: Optional[str] = None,
    mois: Optional[str] = None,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(PaiementTechnicien)
    if technicien_id:
        q = q.filter(PaiementTechnicien.technicien_id == technicien_id)
    if statut:
        q = q.filter(PaiementTechnicien.statut == statut)
    if mois:
        try:
            year, month = mois.split("-")
            q = q.filter(
                func.extract("year", PaiementTechnicien.created_at) == int(year),
                func.extract("month", PaiementTechnicien.created_at) == int(month),
            )
        except ValueError:
            pass

    paiements = q.order_by(PaiementTechnicien.created_at.desc()).all()
    result = []
    for p in paiements:
        tech = db.query(Technicien).filter(Technicien.id == p.technicien_id).first()
        interv = db.query(Intervention).filter(Intervention.id == p.intervention_id).first() if p.intervention_id else None
        result.append(PaiementOut(
            id=p.id,
            technicien_id=p.technicien_id,
            intervention_id=p.intervention_id,
            montant=p.montant,
            type_paiement=p.type_paiement,
            statut=p.statut,
            date_paiement=p.date_paiement,
            mode_paiement=p.mode_paiement,
            reference=p.reference,
            created_at=p.created_at,
            technicien_prenom=tech.prenom if tech else None,
            intervention_numero=interv.numero_intervention if interv else None,
        ))
    return result


@router.get("/synthese", response_model=list[SynthesePaiement])
async def synthese_paiements(
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    techs = db.query(Technicien).filter(Technicien.actif == True).all()
    result = []
    for tech in techs:
        paiements = db.query(PaiementTechnicien).filter(
            PaiementTechnicien.technicien_id == tech.id
        ).all()
        total_a_payer = sum(p.montant for p in paiements if p.statut == "a_payer")
        total_paye = sum(p.montant for p in paiements if p.statut == "paye")
        nb = len(paiements)
        result.append(SynthesePaiement(
            technicien_id=tech.id,
            technicien_prenom=tech.prenom,
            technicien_nom=tech.nom,
            total_a_payer=total_a_payer,
            total_paye=total_paye,
            nb_interventions=nb,
        ))
    return result


@router.put("/{paiement_id}/payer", response_model=PaiementOut)
async def marquer_paye(
    paiement_id: int,
    data: PaiementPayer,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    p = db.query(PaiementTechnicien).filter(PaiementTechnicien.id == paiement_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")

    p.statut = "paye"
    p.date_paiement = date.today()
    if data.mode_paiement:
        p.mode_paiement = data.mode_paiement
    if data.reference:
        p.reference = data.reference
    db.commit()
    db.refresh(p)

    # Mettre à jour l'intervention
    if p.intervention_id:
        interv = db.query(Intervention).filter(Intervention.id == p.intervention_id).first()
        if interv:
            interv.technicien_paye = True
            interv.date_paiement_technicien = date.today()
            db.commit()

    tech = db.query(Technicien).filter(Technicien.id == p.technicien_id).first()
    interv = db.query(Intervention).filter(Intervention.id == p.intervention_id).first() if p.intervention_id else None
    return PaiementOut(
        id=p.id,
        technicien_id=p.technicien_id,
        intervention_id=p.intervention_id,
        montant=p.montant,
        type_paiement=p.type_paiement,
        statut=p.statut,
        date_paiement=p.date_paiement,
        mode_paiement=p.mode_paiement,
        reference=p.reference,
        created_at=p.created_at,
        technicien_prenom=tech.prenom if tech else None,
        intervention_numero=interv.numero_intervention if interv else None,
    )


@router.post("/bulk-payer")
async def bulk_payer(
    data: PaiementBulk,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    count = 0
    for pid in data.paiement_ids:
        p = db.query(PaiementTechnicien).filter(PaiementTechnicien.id == pid).first()
        if p and p.statut == "a_payer":
            p.statut = "paye"
            p.date_paiement = date.today()
            if data.mode_paiement:
                p.mode_paiement = data.mode_paiement
            if data.reference:
                p.reference = data.reference
            if p.intervention_id:
                interv = db.query(Intervention).filter(Intervention.id == p.intervention_id).first()
                if interv:
                    interv.technicien_paye = True
                    interv.date_paiement_technicien = date.today()
            count += 1
    db.commit()
    return {"message": f"{count} paiements marqués payés"}
