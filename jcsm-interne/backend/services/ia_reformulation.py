"""Service IA — Reformulation des rapports via Claude API."""

import json
import httpx

from config import ANTHROPIC_API_KEY

SYSTEM_PROMPT = """Tu es un assistant spécialisé dans la rédaction de rapports d'intervention IRVE (Infrastructure de Recharge pour Véhicules Électriques).

Tu reçois les notes brutes d'un technicien terrain et tu dois les reformuler en rapport d'intervention professionnel.

RÈGLES :
1. Garde TOUS les faits techniques (codes erreur, modèles, actions effectuées)
2. N'invente RIEN qui n'est pas dans le message du technicien
3. Reformule en français professionnel, clair et structuré
4. Sépare en 4 sections :
   - Description : constat à l'arrivée
   - Commentaires : actions réalisées
   - Prochaines étapes : ce qu'il reste à faire (ou "Aucune")
   - Risques : risques identifiés (ou "Aucun")
5. Ton professionnel mais accessible
6. Si succès → le confirmer clairement
7. Si échec/problème restant → le mettre en avant

CONTEXTE :
- Client : {client}
- Site : {nom_site}
- Équipement : {marque} {charger_id}
- Problème signalé : {probleme}

NOTES DU TECHNICIEN :
{texte_brut}

Réponds en JSON : {{"description":"...","commentaires":"...","prochaines_etapes":"...","risques":"..."}}"""


async def reformuler_texte(
    texte_brut: str,
    client: str = "",
    nom_site: str = "",
    marque: str = "",
    charger_id: str = "",
    probleme: str = "",
) -> dict:
    """Appelle Claude API pour reformuler le texte brut en rapport structuré."""
    if not ANTHROPIC_API_KEY:
        # Mode dégradé sans API key — retourner le texte brut
        return {
            "description": texte_brut,
            "commentaires": "Reformulation IA non disponible (clé API manquante)",
            "prochaines_etapes": "Aucune",
            "risques": "Aucun",
        }

    prompt = SYSTEM_PROMPT.format(
        client=client,
        nom_site=nom_site,
        marque=marque,
        charger_id=charger_id,
        probleme=probleme,
        texte_brut=texte_brut,
    )

    async with httpx.AsyncClient(timeout=30) as client_http:
        response = await client_http.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-5-20250929",
                "max_tokens": 1024,
                "system": "Réponds uniquement en JSON valide, sans markdown ni backticks.",
                "messages": [{"role": "user", "content": prompt}],
            },
        )

    if response.status_code != 200:
        return {
            "description": texte_brut,
            "commentaires": f"Erreur IA (HTTP {response.status_code})",
            "prochaines_etapes": "Aucune",
            "risques": "Aucun",
        }

    data = response.json()
    text = data.get("content", [{}])[0].get("text", "")

    try:
        result = json.loads(text)
        return {
            "description": result.get("description", ""),
            "commentaires": result.get("commentaires", ""),
            "prochaines_etapes": result.get("prochaines_etapes", "Aucune"),
            "risques": result.get("risques", "Aucun"),
        }
    except json.JSONDecodeError:
        return {
            "description": text,
            "commentaires": "",
            "prochaines_etapes": "Aucune",
            "risques": "Aucun",
        }
