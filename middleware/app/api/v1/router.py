"""
Router principal de la API v1.
Incluye todos los endpoints de la versión 1.
"""
from fastapi import APIRouter
from app.api.v1 import health, insert, export, analyze
import importlib

# Importar el módulo 'import' usando importlib porque 'import' es palabra reservada
import_module = importlib.import_module('app.api.v1.import')

api_router = APIRouter()

# Incluir todos los routers de endpoints
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(insert.router, tags=["Inserción"])
api_router.include_router(export.router, tags=["Exportación"])
api_router.include_router(import_module.router, tags=["Importación"])
api_router.include_router(analyze.router, tags=["Análisis"])

