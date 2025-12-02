"""
Modelos de respuesta estructurada.
Define la estructura estándar de respuestas del API.
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class RespuestaBase(BaseModel):
    """Modelo base para respuestas estructuradas."""
    exitoso: bool
    mensaje: str
    codigo: int


class RespuestaExito(RespuestaBase):
    """Modelo para respuestas exitosas."""
    exitoso: bool = True
    codigo: int = 200
    datos: Optional[Dict[str, Any]] = None


class RespuestaError(RespuestaBase):
    """Modelo para respuestas de error."""
    exitoso: bool = False
    detalles: Optional[str] = None


class ResultadoImportacion(BaseModel):
    """Modelo para resultado de importación de un archivo."""
    exito: bool
    tabla: Optional[str] = None
    archivo: str
    formato: Optional[str] = None
    insertados: int = 0
    actualizados: int = 0
    error: Optional[str] = None


class ResumenPorTabla(BaseModel):
    """Modelo para resumen de importación por tabla."""
    archivos: int = 0
    filas_insertadas: int = 0
    filas_actualizadas: int = 0


class RespuestaImportacionMasiva(RespuestaExito):
    """Modelo para respuesta de importación masiva."""
    datos: Dict[str, Any] = {
        "total_archivos": int,
        "archivos_procesados": int,
        "archivos_exitosos": int,
        "archivos_con_errores": int,
        "total_filas_insertadas": int,
        "total_filas_actualizadas": int,
        "resumen_por_tabla": Dict[str, ResumenPorTabla],
        "errores": Optional[List[Dict[str, str]]] = None
    }

