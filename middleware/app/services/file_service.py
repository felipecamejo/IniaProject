"""
Servicio de manejo de archivos temporales.
Proporciona funciones para validar y gestionar archivos.
"""
import os
import time
import logging
from app.config import MAX_FILE_SIZE, MAX_IMPORT_FILES

logger = logging.getLogger(__name__)


def safe_remove_file(file_path: str, max_retries: int = 3, delay: float = 0.1) -> bool:
    """Intenta eliminar un archivo de forma segura, manejando el caso donde está bloqueado."""
    if not file_path or not os.path.exists(file_path):
        return True
    
    for attempt in range(max_retries):
        try:
            os.remove(file_path)
            return True
        except PermissionError:
            if attempt < max_retries - 1:
                time.sleep(delay * (attempt + 1))  # Esperar progresivamente más tiempo
            else:
                logger.warning(f"No se pudo eliminar archivo temporal después de {max_retries} intentos: {file_path}")
                return False
        except Exception as e:
            logger.warning(f"Error eliminando archivo temporal {file_path}: {e}")
            return False
    return False


def validar_tamaño_archivo(content: bytes, max_size: int = MAX_FILE_SIZE) -> bool:
    """Valida que el tamaño del archivo no exceda el límite."""
    if len(content) > max_size:
        raise ValueError(f"El archivo excede el tamaño máximo permitido de {max_size / (1024*1024):.1f} MB")
    return True


def validar_cantidad_archivos(cantidad: int, max_files: int = MAX_IMPORT_FILES) -> bool:
    """Valida que la cantidad de archivos no exceda el límite."""
    if cantidad > max_files:
        raise ValueError(f"La cantidad de archivos ({cantidad}) excede el límite máximo de {max_files}")
    return True

