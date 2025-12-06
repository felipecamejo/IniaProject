"""
Módulo común para utilidades de normalización de strings.
Centraliza funciones compartidas entre ImportExcel y ContrastDatabase.
"""
import re
import unicodedata
from typing import List


def normalize_header_names(headers: List[str]) -> List[str]:
    """
    Normaliza los nombres de los encabezados.
    Convierte a minúsculas, reemplaza espacios/guiones con guiones bajos,
    y remueve caracteres especiales.
    
    Usado por ImportExcel.py y ContrastDatabase.py.
    
    Args:
        headers: Lista de nombres de encabezados a normalizar
    
    Returns:
        Lista de encabezados normalizados
    """
    normalized = []
    for header in headers:
        if header:
            # Normalizar unicode
            header = unicodedata.normalize('NFKD', str(header))
            # Convertir a minúsculas y reemplazar espacios/guiones con guiones bajos
            header = header.lower().strip()
            header = re.sub(r'[\s\-]+', '_', header)
            # Remover caracteres especiales
            header = re.sub(r'[^a-z0-9_]', '', header)
            # Remover guiones bajos múltiples
            header = re.sub(r'_+', '_', header)
            # Remover guiones bajos al inicio y final
            header = header.strip('_')
            if not header:
                header = f"columna_{len(normalized)+1}"
        else:
            header = f"columna_{len(normalized)+1}"
        normalized.append(header)
    return normalized

