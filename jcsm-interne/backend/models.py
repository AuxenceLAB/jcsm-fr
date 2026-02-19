"""SQLAlchemy models — Toutes les tables de la BDD."""

from datetime import datetime, date, time
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, Time, Numeric,
    ForeignKey, TIMESTAMP, ARRAY, JSON, func
)
from sqlalchemy.orm import relationship
from database import Base


class Technicien(Base):
    __tablename__ = "techniciens"

    id = Column(Integer, primary_key=True, index=True)
    prenom = Column(String(100), nullable=False, unique=True)
    nom = Column(String(100), nullable=False)
    telephone = Column(String(20), nullable=False)
    email = Column(String(200))
    zone_principale = Column(String(100))
    departements_couverts = Column(ARRAY(Integer))
    rayon_km = Column(Integer, default=100)
    taux_standard = Column(Numeric(10, 2), default=70.00)
    taux_urgence = Column(Numeric(10, 2), default=100.00)
    notif_whatsapp = Column(Boolean, default=True)
    notif_sms = Column(Boolean, default=False)
    notif_email = Column(Boolean, default=False)
    actif = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    interventions = relationship("Intervention", back_populates="technicien")
    rapports = relationship("Rapport", back_populates="technicien")
    paiements = relationship("PaiementTechnicien", back_populates="technicien")
    whatsapp_sessions = relationship("WhatsappSession", back_populates="technicien")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    numero_intervention = Column(String(20), unique=True)

    # Source Powerdot
    numero_job = Column(String(20))
    location_id = Column(String(20))

    # Site
    departement = Column(Integer)
    nom_site = Column(String(300), nullable=False)
    adresse = Column(Text, nullable=False)

    # Demande
    demandeur = Column(String(100))
    client = Column(String(100), default="Powerdot")
    date_demande = Column(Date, nullable=False)
    date_proposee = Column(Date)
    date_intervention = Column(Date)
    sla_jours = Column(Integer)

    # Équipement
    marque = Column(String(100))
    charger_id = Column(String(100))
    numero_serie = Column(String(100))

    # Problème
    probleme = Column(Text, nullable=False)
    type_intervention = Column(String(50), default="Maintenance")
    test_ve = Column(Boolean, default=False)

    # Statut workflow
    statut = Column(String(30), default="a_planifier")

    # Assignation
    technicien_id = Column(Integer, ForeignKey("techniciens.id"))
    date_assignation = Column(TIMESTAMP)
    notification_envoyee = Column(Boolean, default=False)
    canal_notification = Column(String(20))

    # Résultat
    fait = Column(Boolean, default=False)
    reussi = Column(Boolean)

    # Financier client
    deplacement_ht = Column(Numeric(10, 2))
    taux_horaire = Column(Numeric(10, 2), default=80.00)
    heures_facturees = Column(Numeric(5, 2))
    remise_deplacement = Column(Numeric(10, 2), default=0)
    total_ht = Column(Numeric(10, 2))

    # Financier technicien
    paiement_technicien = Column(Numeric(10, 2))
    technicien_paye = Column(Boolean, default=False)
    date_paiement_technicien = Column(Date)

    # Rapport
    rapport_id = Column(Integer)
    rapport_genere = Column(Boolean, default=False)

    # Sync Google Sheets
    gsheet_row_index = Column(Integer)
    derniere_sync = Column(TIMESTAMP)

    # Soft delete
    supprime = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    technicien = relationship("Technicien", back_populates="interventions")
    rapports = relationship("Rapport", back_populates="intervention")
    paiements = relationship("PaiementTechnicien", back_populates="intervention")
    whatsapp_sessions = relationship("WhatsappSession", back_populates="intervention")


class Rapport(Base):
    __tablename__ = "rapports"

    id = Column(Integer, primary_key=True, index=True)
    intervention_id = Column(Integer, ForeignKey("interventions.id"), nullable=False)
    technicien_id = Column(Integer, ForeignKey("techniciens.id"), nullable=False)

    date_intervention = Column(Date, nullable=False)
    heure_debut = Column(Time)
    heure_fin = Column(Time)
    duree_minutes = Column(Integer)

    # Infos site (pré-remplies)
    client = Column(String(100))
    nom_site = Column(String(300))
    adresse = Column(Text)
    ticket = Column(String(50))

    # Contenu brut
    texte_brut_technicien = Column(Text)

    # Contenu reformulé IA
    description = Column(Text)
    commentaires = Column(Text)
    prochaines_etapes = Column(Text)
    risques = Column(Text)

    # Photos
    photos = Column(JSON, default=[])

    # PDF
    pdf_path = Column(String(500))
    google_drive_url = Column(String(500))
    google_drive_file_id = Column(String(100))

    # Méta
    source = Column(String(20), default="web")
    statut_rapport = Column(String(20), default="brouillon")

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    intervention = relationship("Intervention", back_populates="rapports")
    technicien = relationship("Technicien", back_populates="rapports")


class WhatsappSession(Base):
    __tablename__ = "whatsapp_sessions"

    id = Column(Integer, primary_key=True, index=True)
    technicien_id = Column(Integer, ForeignKey("techniciens.id"), nullable=False)
    intervention_id = Column(Integer, ForeignKey("interventions.id"), nullable=False)
    telephone = Column(String(20), nullable=False)

    etape = Column(String(30), default="attente_texte")
    texte_brut = Column(Text)
    photos = Column(JSON, default=[])
    rapport_id = Column(Integer, ForeignKey("rapports.id"))

    expires_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    technicien = relationship("Technicien", back_populates="whatsapp_sessions")
    intervention = relationship("Intervention", back_populates="whatsapp_sessions")


class PaiementTechnicien(Base):
    __tablename__ = "paiements_techniciens"

    id = Column(Integer, primary_key=True, index=True)
    technicien_id = Column(Integer, ForeignKey("techniciens.id"), nullable=False)
    intervention_id = Column(Integer, ForeignKey("interventions.id"))
    montant = Column(Numeric(10, 2), nullable=False)
    type_paiement = Column(String(30))
    statut = Column(String(20), default="a_payer")
    date_paiement = Column(Date)
    mode_paiement = Column(String(30))
    reference = Column(String(100))
    created_at = Column(TIMESTAMP, server_default=func.now())

    technicien = relationship("Technicien", back_populates="paiements")
    intervention = relationship("Intervention", back_populates="paiements")
