"""
Endpoint de análisis de archivos Excel.
"""
import logging
from fastapi import Request, APIRouter, Query, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from app.services.analyze_service import analizar_archivo_excel

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analizar", tags=["Análisis"], summary="Analizar archivo Excel",
          description="Analiza un archivo Excel y genera un mapeo de datos")
async def analizar(
    request: Request,
    file: UploadFile = File(..., description="Archivo Excel (.xlsx o .xls) a analizar"),
    formato: str = Query(default="json", pattern="^(texto|json)$", description="Formato de salida"),
    contrastar_bd: bool = Query(default=True, description="Si es True, contrasta el mapeo con la base de datos"),
    umbral_coincidencia: float = Query(default=30.0, description="Porcentaje mínimo de coincidencia requerido")
):
    """
    Analiza un archivo Excel y genera un mapeo de datos contrastado con la base de datos.
    """
    request_id = getattr(request.state, "request_id", "unknown")
    try:
        respuesta = await analizar_archivo_excel(
            file=file,
            formato=formato,
            contrastar_bd=contrastar_bd,
            umbral_coincidencia=umbral_coincidencia,
            request_id=request_id
        )
        return JSONResponse(content=respuesta, status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Error inesperado durante análisis: {e}", exc_info=True)
        raise

