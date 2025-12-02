"""
Esquemas Pydantic para validación de parámetros de entrada.
"""
from pydantic import BaseModel, Field
from typing import Optional


class InsertRequest(BaseModel):
    """Modelo para solicitud de inserción masiva."""
    pass


class ExportParams(BaseModel):
    """Parámetros para exportación de tablas."""
    tablas: str = Field(default="", description="Lista separada por comas de tablas a exportar")
    formato: str = Field(default="xlsx", pattern="^(xlsx|csv)$", description="Formato de exportación")
    incluir_sin_pk: bool = Field(default=True, description="Incluir tablas sin Primary Key")
    analisis_ids: Optional[str] = Field(
        default=None,
        description="IDs de análisis a exportar. Formato: 'tipo:id1,id2;tipo2:id3,id4'"
    )
    fecha_desde: Optional[str] = Field(
        default=None,
        description="Fecha de inicio del rango (formato: YYYY-MM-DD)"
    )
    fecha_hasta: Optional[str] = Field(
        default=None,
        description="Fecha de fin del rango (formato: YYYY-MM-DD)"
    )
    campo_fecha: Optional[str] = Field(
        default="auto",
        description="Campo de fecha a usar para filtrado"
    )


class ImportParams(BaseModel):
    """Parámetros para importación de archivos."""
    table: Optional[str] = Field(default=None, description="Tabla destino (opcional, se detecta automáticamente)")
    upsert: bool = Field(default=False, description="Usar upsert en lugar de insert")
    keep_ids: bool = Field(default=False, description="Mantener IDs del archivo")


class AnalyzeParams(BaseModel):
    """Parámetros para análisis de archivos Excel."""
    formato: str = Field(default="json", pattern="^(texto|json)$", description="Formato de salida")
    contrastar_bd: bool = Field(default=True, description="Si es True, contrasta el mapeo con la base de datos")
    umbral_coincidencia: float = Field(default=30.0, description="Porcentaje mínimo de coincidencia requerido")

