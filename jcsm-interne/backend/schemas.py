"""Pydantic schemas — Validation des données API."""

from datetime import date, time, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


# ── Auth ──

class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    role: str
    prenom: str
    technicien_id: Optional[int] = None


class UserInfo(BaseModel):
    role: str
    prenom: str
    technicien_id: Optional[int] = None


# ── Technicien ──

class TechnicienBase(BaseModel):
    prenom: str
    nom: str
    telephone: str
    email: Optional[str] = None
    zone_principale: Optional[str] = None
    departements_couverts: Optional[list[int]] = None
    rayon_km: int = 100
    taux_standard: Decimal = Decimal("70.00")
    taux_urgence: Decimal = Decimal("100.00")
    notif_whatsapp: bool = True
    notif_sms: bool = False
    notif_email: bool = False


class TechnicienCreate(TechnicienBase):
    pass


class TechnicienUpdate(BaseModel):
    prenom: Optional[str] = None
    nom: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    zone_principale: Optional[str] = None
    departements_couverts: Optional[list[int]] = None
    rayon_km: Optional[int] = None
    taux_standard: Optional[Decimal] = None
    taux_urgence: Optional[Decimal] = None
    notif_whatsapp: Optional[bool] = None
    notif_sms: Optional[bool] = None
    notif_email: Optional[bool] = None
    actif: Optional[bool] = None


class TechnicienOut(TechnicienBase):
    id: int
    actif: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Intervention ──

class InterventionBase(BaseModel):
    numero_job: Optional[str] = None
    location_id: Optional[str] = None
    departement: Optional[int] = None
    nom_site: str
    adresse: str
    demandeur: Optional[str] = None
    client: str = "Powerdot"
    date_demande: date
    date_proposee: Optional[date] = None
    date_intervention: Optional[date] = None
    sla_jours: Optional[int] = None
    marque: Optional[str] = None
    charger_id: Optional[str] = None
    numero_serie: Optional[str] = None
    probleme: str
    type_intervention: str = "Maintenance"
    test_ve: bool = False


class InterventionCreate(InterventionBase):
    pass


class InterventionUpdate(BaseModel):
    numero_job: Optional[str] = None
    location_id: Optional[str] = None
    departement: Optional[int] = None
    nom_site: Optional[str] = None
    adresse: Optional[str] = None
    demandeur: Optional[str] = None
    client: Optional[str] = None
    date_demande: Optional[date] = None
    date_proposee: Optional[date] = None
    date_intervention: Optional[date] = None
    sla_jours: Optional[int] = None
    marque: Optional[str] = None
    charger_id: Optional[str] = None
    numero_serie: Optional[str] = None
    probleme: Optional[str] = None
    type_intervention: Optional[str] = None
    test_ve: Optional[bool] = None
    statut: Optional[str] = None
    fait: Optional[bool] = None
    reussi: Optional[bool] = None
    deplacement_ht: Optional[Decimal] = None
    taux_horaire: Optional[Decimal] = None
    heures_facturees: Optional[Decimal] = None
    remise_deplacement: Optional[Decimal] = None
    total_ht: Optional[Decimal] = None
    paiement_technicien: Optional[Decimal] = None
    technicien_paye: Optional[bool] = None
    date_paiement_technicien: Optional[date] = None


class InterventionAssign(BaseModel):
    technicien_id: int


class InterventionStatut(BaseModel):
    statut: str
    reussi: Optional[bool] = None


class InterventionOut(InterventionBase):
    id: int
    numero_intervention: Optional[str] = None
    statut: str
    technicien_id: Optional[int] = None
    date_assignation: Optional[datetime] = None
    notification_envoyee: bool = False
    canal_notification: Optional[str] = None
    fait: bool = False
    reussi: Optional[bool] = None
    deplacement_ht: Optional[Decimal] = None
    taux_horaire: Optional[Decimal] = None
    heures_facturees: Optional[Decimal] = None
    remise_deplacement: Optional[Decimal] = None
    total_ht: Optional[Decimal] = None
    paiement_technicien: Optional[Decimal] = None
    technicien_paye: bool = False
    date_paiement_technicien: Optional[date] = None
    rapport_genere: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    technicien_prenom: Optional[str] = None

    class Config:
        from_attributes = True


class InterventionStats(BaseModel):
    total: int
    a_planifier: int
    en_cours: int
    terminees: int
    ca_ht: Decimal
    marge_nette: Decimal
    taux_reussite: float


# ── Rapport ──

class RapportCreate(BaseModel):
    intervention_id: int
    technicien_id: int
    date_intervention: date
    heure_debut: Optional[str] = None
    heure_fin: Optional[str] = None
    texte_brut_technicien: Optional[str] = None
    description: Optional[str] = None
    commentaires: Optional[str] = None
    prochaines_etapes: Optional[str] = None
    risques: Optional[str] = None
    photos: Optional[list] = None
    source: str = "web"


class RapportUpdate(BaseModel):
    heure_debut: Optional[str] = None
    heure_fin: Optional[str] = None
    texte_brut_technicien: Optional[str] = None
    description: Optional[str] = None
    commentaires: Optional[str] = None
    prochaines_etapes: Optional[str] = None
    risques: Optional[str] = None
    photos: Optional[list] = None
    statut_rapport: Optional[str] = None


class RapportOut(BaseModel):
    id: int
    intervention_id: int
    technicien_id: int
    date_intervention: date
    heure_debut: Optional[time] = None
    heure_fin: Optional[time] = None
    duree_minutes: Optional[int] = None
    client: Optional[str] = None
    nom_site: Optional[str] = None
    adresse: Optional[str] = None
    ticket: Optional[str] = None
    texte_brut_technicien: Optional[str] = None
    description: Optional[str] = None
    commentaires: Optional[str] = None
    prochaines_etapes: Optional[str] = None
    risques: Optional[str] = None
    photos: Optional[list] = None
    pdf_path: Optional[str] = None
    google_drive_url: Optional[str] = None
    source: str
    statut_rapport: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReformulationRequest(BaseModel):
    texte_brut: str
    client: str = "Powerdot"
    nom_site: str = ""
    marque: str = ""
    charger_id: str = ""
    probleme: str = ""


class ReformulationResponse(BaseModel):
    description: str
    commentaires: str
    prochaines_etapes: str
    risques: str


# ── Paiement ──

class PaiementOut(BaseModel):
    id: int
    technicien_id: int
    intervention_id: Optional[int] = None
    montant: Decimal
    type_paiement: Optional[str] = None
    statut: str
    date_paiement: Optional[date] = None
    mode_paiement: Optional[str] = None
    reference: Optional[str] = None
    created_at: Optional[datetime] = None
    technicien_prenom: Optional[str] = None
    intervention_numero: Optional[str] = None

    class Config:
        from_attributes = True


class PaiementPayer(BaseModel):
    mode_paiement: Optional[str] = None
    reference: Optional[str] = None


class PaiementBulk(BaseModel):
    paiement_ids: list[int]
    mode_paiement: Optional[str] = None
    reference: Optional[str] = None


class SynthesePaiement(BaseModel):
    technicien_id: int
    technicien_prenom: str
    technicien_nom: str
    total_a_payer: Decimal
    total_paye: Decimal
    nb_interventions: int


# ── Webhook ──

class WebhookStatutChange(BaseModel):
    intervention_id: int
    ancien_statut: str
    nouveau_statut: str


class WebhookNouveauRapport(BaseModel):
    rapport_id: int
    intervention_id: int
