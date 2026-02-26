"""JCSM Interne — FastAPI application principale."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from routes.auth_routes import router as auth_router
from routes.intervention_routes import router as intervention_router
from routes.technicien_routes import router as technicien_router
from routes.rapport_routes import router as rapport_router
from routes.paiement_routes import router as paiement_router
from routes.webhook_routes import router as webhook_router

app = FastAPI(
    title="JCSM Interne",
    description="API de gestion des interventions IRVE",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://jcsm.fr", "https://www.jcsm.fr", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(intervention_router, prefix="/api", tags=["Interventions"])
app.include_router(technicien_router, prefix="/api/techniciens", tags=["Techniciens"])
app.include_router(rapport_router, prefix="/api/rapports", tags=["Rapports"])
app.include_router(paiement_router, prefix="/api/paiements", tags=["Paiements"])
app.include_router(webhook_router, prefix="/api/webhooks", tags=["Webhooks"])

# Serve frontend static files
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(os.path.join(frontend_dir, "static")):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_dir, "static")), name="static")


# ── Frontend routes ──

@app.get("/interne")
async def login_page():
    return FileResponse(os.path.join(frontend_dir, "index.html"))


@app.get("/interne/admin")
async def admin_page():
    return FileResponse(os.path.join(frontend_dir, "admin", "dashboard.html"))


@app.get("/interne/tech")
async def tech_page():
    return FileResponse(os.path.join(frontend_dir, "tech", "interventions.html"))


@app.get("/interne/tech/rapport/{intervention_id}")
async def tech_rapport_page(intervention_id: int):
    return FileResponse(os.path.join(frontend_dir, "tech", "rapport.html"))


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "jcsm-interne"}
