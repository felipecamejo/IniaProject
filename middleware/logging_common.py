"""
Módulo común para configuración de logging.
"""
import logging


def configurar_logging(nivel=logging.INFO, formato=None):
    """
    Configura el logging de forma estándar.
    
    Args:
        nivel: Nivel de logging (default: INFO)
        formato: Formato personalizado (default: formato estándar)
    
    Returns:
        Logger configurado
    """
    if formato is None:
        formato = '%(asctime)s - %(levelname)s - %(message)s'
    
    logging.basicConfig(level=nivel, format=formato)
    return logging.getLogger(__name__)


def log_ok(message: str, logger=None):
    """
    Log de éxito.
    
    Args:
        message: Mensaje a loguear
        logger: Logger a usar (si None, usa logger del módulo)
    """
    if logger is None:
        logger = logging.getLogger(__name__)
    logger.info(f"✓ {message}")


def log_fail(message: str, logger=None):
    """
    Log de error.
    
    Args:
        message: Mensaje a loguear
        logger: Logger a usar (si None, usa logger del módulo)
    """
    if logger is None:
        logger = logging.getLogger(__name__)
    logger.error(f"✗ {message}")


def log_step(message: str, logger=None):
    """
    Log de paso.
    
    Args:
        message: Mensaje a loguear
        logger: Logger a usar (si None, usa logger del módulo)
    """
    if logger is None:
        logger = logging.getLogger(__name__)
    logger.info(f"→ {message}")

