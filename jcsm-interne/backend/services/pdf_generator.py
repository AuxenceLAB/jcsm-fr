"""Service PDF — Génération des rapports d'intervention avec ReportLab."""

import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

from config import UPLOAD_DIR

# Couleurs JCSM
JCSM_BLUE = colors.HexColor("#1B365D")
JCSM_LIGHT = colors.HexColor("#F5F7FA")
JCSM_BORDER = colors.HexColor("#E5E7EB")

PDF_OUTPUT_DIR = os.path.join(UPLOAD_DIR, "rapports")


def _sanitize_filename(name: str) -> str:
    """Nettoie un nom pour l'utiliser comme nom de fichier."""
    return "".join(c if c.isalnum() or c in " -_" else "_" for c in name).strip().replace(" ", "_")


def generer_pdf_rapport(rapport) -> str:
    """Génère un PDF de rapport d'intervention et retourne le chemin."""
    os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)

    date_str = rapport.date_intervention.strftime("%d_%m_%Y") if rapport.date_intervention else "sans_date"
    site_clean = _sanitize_filename(rapport.nom_site or "site")
    filename = f"{date_str}_{site_clean}.pdf"
    filepath = os.path.join(PDF_OUTPUT_DIR, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    # Styles personnalisés
    title_style = ParagraphStyle(
        "JCSMTitle",
        parent=styles["Heading1"],
        textColor=JCSM_BLUE,
        fontSize=18,
        spaceAfter=6 * mm,
        alignment=TA_CENTER,
    )
    heading_style = ParagraphStyle(
        "JCSMHeading",
        parent=styles["Heading2"],
        textColor=JCSM_BLUE,
        fontSize=13,
        spaceBefore=4 * mm,
        spaceAfter=2 * mm,
    )
    body_style = ParagraphStyle(
        "JCSMBody",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=2 * mm,
    )

    elements = []

    # ── En-tête ──
    elements.append(Paragraph("JCSM", title_style))
    elements.append(Paragraph("Rapport d'intervention IRVE", ParagraphStyle(
        "Subtitle", parent=styles["Normal"], fontSize=12, alignment=TA_CENTER,
        textColor=colors.HexColor("#6B7280"), spaceAfter=8 * mm,
    )))

    # ── Tableau infos ──
    date_display = rapport.date_intervention.strftime("%d/%m/%Y") if rapport.date_intervention else "-"
    heure_debut = rapport.heure_debut.strftime("%H:%M") if rapport.heure_debut else "-"
    heure_fin = rapport.heure_fin.strftime("%H:%M") if rapport.heure_fin else "-"
    duree = f"{rapport.duree_minutes} min" if rapport.duree_minutes else "-"

    info_data = [
        ["Date", date_display, "Client", rapport.client or "-"],
        ["Heure début", heure_debut, "Site", rapport.nom_site or "-"],
        ["Heure fin", heure_fin, "Adresse", rapport.adresse or "-"],
        ["Durée", duree, "Ticket", rapport.ticket or "-"],
    ]

    info_table = Table(info_data, colWidths=[3 * cm, 4 * cm, 3 * cm, 7 * cm])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), JCSM_LIGHT),
        ("BACKGROUND", (2, 0), (2, -1), JCSM_LIGHT),
        ("TEXTCOLOR", (0, 0), (0, -1), JCSM_BLUE),
        ("TEXTCOLOR", (2, 0), (2, -1), JCSM_BLUE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, JCSM_BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 8 * mm))

    # ── Sections du rapport ──
    sections = [
        ("Description", rapport.description),
        ("Commentaires", rapport.commentaires),
        ("Prochaines étapes", rapport.prochaines_etapes),
        ("Risques", rapport.risques),
    ]

    for title, content in sections:
        elements.append(Paragraph(title, heading_style))
        text = content or "Non renseigné"
        # Convertir les retours à la ligne en <br/>
        text = text.replace("\n", "<br/>")
        elements.append(Paragraph(text, body_style))

    # ── Photos ──
    photos = rapport.photos or []
    if photos:
        elements.append(PageBreak())
        elements.append(Paragraph("Photos", heading_style))
        elements.append(Spacer(1, 4 * mm))

        for i, photo in enumerate(photos):
            photo_path = photo.get("url", "") if isinstance(photo, dict) else str(photo)
            # Résoudre le chemin
            if photo_path.startswith("/uploads/"):
                abs_path = os.path.join(UPLOAD_DIR, photo_path.lstrip("/uploads/"))
            else:
                abs_path = photo_path

            if os.path.exists(abs_path):
                try:
                    img = Image(abs_path, width=16 * cm, height=12 * cm)
                    img.hAlign = "CENTER"
                    elements.append(img)
                    desc = photo.get("description", f"Photo {i+1}") if isinstance(photo, dict) else f"Photo {i+1}"
                    elements.append(Paragraph(desc, ParagraphStyle(
                        "PhotoCaption", parent=styles["Normal"], fontSize=9,
                        alignment=TA_CENTER, textColor=colors.HexColor("#6B7280"),
                        spaceAfter=6 * mm,
                    )))
                except Exception:
                    pass

            # 2 photos par page
            if i % 2 == 1 and i < len(photos) - 1:
                elements.append(PageBreak())

    doc.build(elements)
    return filepath
