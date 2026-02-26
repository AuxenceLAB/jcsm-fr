"""Initial schema — toutes les tables JCSM Interne.

Revision ID: 001
Revises: None
Create Date: 2025-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "techniciens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("prenom", sa.String(100), nullable=False, unique=True),
        sa.Column("nom", sa.String(100), nullable=False),
        sa.Column("telephone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(200)),
        sa.Column("zone_principale", sa.String(100)),
        sa.Column("departements_couverts", postgresql.ARRAY(sa.Integer())),
        sa.Column("rayon_km", sa.Integer(), server_default="100"),
        sa.Column("taux_standard", sa.Numeric(10, 2), server_default="70.00"),
        sa.Column("taux_urgence", sa.Numeric(10, 2), server_default="100.00"),
        sa.Column("notif_whatsapp", sa.Boolean(), server_default="true"),
        sa.Column("notif_sms", sa.Boolean(), server_default="false"),
        sa.Column("notif_email", sa.Boolean(), server_default="false"),
        sa.Column("actif", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.func.now()),
    )

    op.create_table(
        "interventions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("numero_intervention", sa.String(20), unique=True),
        sa.Column("numero_job", sa.String(20)),
        sa.Column("location_id", sa.String(20)),
        sa.Column("departement", sa.Integer()),
        sa.Column("nom_site", sa.String(300), nullable=False),
        sa.Column("adresse", sa.Text(), nullable=False),
        sa.Column("demandeur", sa.String(100)),
        sa.Column("client", sa.String(100), server_default="Powerdot"),
        sa.Column("date_demande", sa.Date(), nullable=False),
        sa.Column("date_proposee", sa.Date()),
        sa.Column("date_intervention", sa.Date()),
        sa.Column("sla_jours", sa.Integer()),
        sa.Column("marque", sa.String(100)),
        sa.Column("charger_id", sa.String(100)),
        sa.Column("numero_serie", sa.String(100)),
        sa.Column("probleme", sa.Text(), nullable=False),
        sa.Column("type_intervention", sa.String(50), server_default="Maintenance"),
        sa.Column("test_ve", sa.Boolean(), server_default="false"),
        sa.Column("statut", sa.String(30), server_default="a_planifier"),
        sa.Column("technicien_id", sa.Integer(), sa.ForeignKey("techniciens.id")),
        sa.Column("date_assignation", sa.TIMESTAMP()),
        sa.Column("notification_envoyee", sa.Boolean(), server_default="false"),
        sa.Column("canal_notification", sa.String(20)),
        sa.Column("fait", sa.Boolean(), server_default="false"),
        sa.Column("reussi", sa.Boolean()),
        sa.Column("deplacement_ht", sa.Numeric(10, 2)),
        sa.Column("taux_horaire", sa.Numeric(10, 2), server_default="80.00"),
        sa.Column("heures_facturees", sa.Numeric(5, 2)),
        sa.Column("remise_deplacement", sa.Numeric(10, 2), server_default="0"),
        sa.Column("total_ht", sa.Numeric(10, 2)),
        sa.Column("paiement_technicien", sa.Numeric(10, 2)),
        sa.Column("technicien_paye", sa.Boolean(), server_default="false"),
        sa.Column("date_paiement_technicien", sa.Date()),
        sa.Column("rapport_id", sa.Integer()),
        sa.Column("rapport_genere", sa.Boolean(), server_default="false"),
        sa.Column("gsheet_row_index", sa.Integer()),
        sa.Column("derniere_sync", sa.TIMESTAMP()),
        sa.Column("supprime", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.func.now()),
    )

    op.create_table(
        "rapports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("intervention_id", sa.Integer(), sa.ForeignKey("interventions.id"), nullable=False),
        sa.Column("technicien_id", sa.Integer(), sa.ForeignKey("techniciens.id"), nullable=False),
        sa.Column("date_intervention", sa.Date(), nullable=False),
        sa.Column("heure_debut", sa.Time()),
        sa.Column("heure_fin", sa.Time()),
        sa.Column("duree_minutes", sa.Integer()),
        sa.Column("client", sa.String(100)),
        sa.Column("nom_site", sa.String(300)),
        sa.Column("adresse", sa.Text()),
        sa.Column("ticket", sa.String(50)),
        sa.Column("texte_brut_technicien", sa.Text()),
        sa.Column("description", sa.Text()),
        sa.Column("commentaires", sa.Text()),
        sa.Column("prochaines_etapes", sa.Text()),
        sa.Column("risques", sa.Text()),
        sa.Column("photos", postgresql.JSON(), server_default="[]"),
        sa.Column("pdf_path", sa.String(500)),
        sa.Column("google_drive_url", sa.String(500)),
        sa.Column("google_drive_file_id", sa.String(100)),
        sa.Column("source", sa.String(20), server_default="web"),
        sa.Column("statut_rapport", sa.String(20), server_default="brouillon"),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.func.now()),
    )

    op.create_table(
        "whatsapp_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("technicien_id", sa.Integer(), sa.ForeignKey("techniciens.id"), nullable=False),
        sa.Column("intervention_id", sa.Integer(), sa.ForeignKey("interventions.id"), nullable=False),
        sa.Column("telephone", sa.String(20), nullable=False),
        sa.Column("etape", sa.String(30), server_default="attente_texte"),
        sa.Column("texte_brut", sa.Text()),
        sa.Column("photos", postgresql.JSON(), server_default="[]"),
        sa.Column("rapport_id", sa.Integer(), sa.ForeignKey("rapports.id")),
        sa.Column("expires_at", sa.TIMESTAMP()),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.func.now()),
    )

    op.create_table(
        "paiements_techniciens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("technicien_id", sa.Integer(), sa.ForeignKey("techniciens.id"), nullable=False),
        sa.Column("intervention_id", sa.Integer(), sa.ForeignKey("interventions.id")),
        sa.Column("montant", sa.Numeric(10, 2), nullable=False),
        sa.Column("type_paiement", sa.String(30)),
        sa.Column("statut", sa.String(20), server_default="a_payer"),
        sa.Column("date_paiement", sa.Date()),
        sa.Column("mode_paiement", sa.String(30)),
        sa.Column("reference", sa.String(100)),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("paiements_techniciens")
    op.drop_table("whatsapp_sessions")
    op.drop_table("rapports")
    op.drop_table("interventions")
    op.drop_table("techniciens")
