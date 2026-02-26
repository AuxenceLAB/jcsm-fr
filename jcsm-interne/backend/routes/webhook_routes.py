"""Routes webhooks — Pour n8n."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import WebhookStatutChange, WebhookNouveauRapport

router = APIRouter()


@router.post("/statut-change")
async def on_statut_change(
    data: WebhookStatutChange,
    db: Session = Depends(get_db),
):
    """n8n écoute les changements de statut pour synchroniser GSheets."""
    # Ce endpoint est appelé après chaque changement de statut.
    # n8n consomme ce webhook pour mettre à jour Google Sheets.
    return {
        "received": True,
        "intervention_id": data.intervention_id,
        "ancien_statut": data.ancien_statut,
        "nouveau_statut": data.nouveau_statut,
    }


@router.post("/nouveau-rapport")
async def on_nouveau_rapport(
    data: WebhookNouveauRapport,
    db: Session = Depends(get_db),
):
    """n8n écoute la création de rapports pour upload Drive + sync GSheets."""
    return {
        "received": True,
        "rapport_id": data.rapport_id,
        "intervention_id": data.intervention_id,
    }
