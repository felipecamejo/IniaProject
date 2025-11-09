"""
Módulo para instalar dependencias automáticamente.
Puede ser importado por otros scripts para instalar dependencias faltantes.
"""
import subprocess
import sys
import os
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Mapeo de módulos a paquetes pip
MODULE_TO_PACKAGE = {
    'sqlalchemy': 'SQLAlchemy',
    'openpyxl': 'openpyxl',
    'psycopg2': 'psycopg2-binary',
    'fastapi': 'fastapi',
    'uvicorn': 'uvicorn',
    'pydantic': 'pydantic',
    'pytest': 'pytest',
    'httpx': 'httpx',
    'pandas': 'pandas',
    'numpy': 'numpy',
}

# Dependencias requeridas por módulo
REQUIRED_DEPENDENCIES = {
    'ExportExcel': ['sqlalchemy', 'openpyxl', 'psycopg2'],
    'ImportExcel': ['sqlalchemy', 'openpyxl', 'psycopg2'],
    'MassiveInsertFiles': ['sqlalchemy', 'psycopg2', 'pandas', 'numpy'],
    'http_server': ['sqlalchemy', 'psycopg2', 'fastapi', 'uvicorn', 'pydantic'],
    'test_setup': ['pytest', 'httpx', 'sqlalchemy', 'psycopg2', 'fastapi', 'uvicorn', 'openpyxl', 'pydantic'],
}


def instalar_paquete(nombre_paquete: str, silent: bool = True) -> bool:
    """
    Intenta instalar un paquete usando pip.
    
    Args:
        nombre_paquete: Nombre del paquete a instalar
        silent: Si es True, suprime la salida de pip
    
    Returns:
        True si la instalación fue exitosa, False en caso contrario
    """
    try:
        if not silent:
            logger.info(f"Instalando {nombre_paquete}...")
        
        # Preparar comando pip
        cmd = [sys.executable, "-m", "pip", "install", nombre_paquete]
        
        # Ejecutar instalación
        if silent:
            result = subprocess.run(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=False
            )
        else:
            result = subprocess.run(cmd, check=False)
        
        if result.returncode == 0:
            if not silent:
                logger.info(f"✓ {nombre_paquete} instalado correctamente")
            return True
        else:
            error_msg = result.stderr.decode('utf-8', errors='ignore') if silent else ""
            logger.error(f"✗ No se pudo instalar {nombre_paquete}: {error_msg}")
            return False
            
    except Exception as e:
        logger.error(f"✗ Error instalando {nombre_paquete}: {e}")
        return False


def instalar_dependencias_faltantes(module_name: str = None, silent: bool = True) -> bool:
    """
    Instala dependencias faltantes para un módulo específico o todas las dependencias.
    
    Args:
        module_name: Nombre del módulo (ej: 'ExportExcel'). Si es None, instala todas.
        silent: Si es True, suprime la salida de pip
    
    Returns:
        True si todas las dependencias se instalaron correctamente
    """
    if module_name and module_name in REQUIRED_DEPENDENCIES:
        dependencias = REQUIRED_DEPENDENCIES[module_name]
    else:
        # Instalar todas las dependencias únicas
        dependencias = set()
        for deps in REQUIRED_DEPENDENCIES.values():
            dependencias.update(deps)
        dependencias = list(dependencias)
    
    if not silent:
        logger.info(f"Verificando e instalando dependencias para {module_name or 'todos los módulos'}...")
    
    faltantes = []
    for modulo in dependencias:
        try:
            __import__(modulo)
        except ImportError:
            faltantes.append(modulo)
    
    if not faltantes:
        if not silent:
            logger.info("✓ Todas las dependencias están instaladas")
        return True
    
    if not silent:
        logger.info(f"Instalando {len(faltantes)} dependencias faltantes: {', '.join(faltantes)}")
    
    exitoso = True
    for modulo in faltantes:
        paquete = MODULE_TO_PACKAGE.get(modulo, modulo)
        if not instalar_paquete(paquete, silent=silent):
            exitoso = False
    
    return exitoso


def verificar_e_instalar(modulo: str, package_name: str = None, silent: bool = True) -> bool:
    """
    Verifica si un módulo está disponible, y si no, intenta instalarlo.
    
    Args:
        modulo: Nombre del módulo a verificar (ej: 'sqlalchemy')
        package_name: Nombre del paquete pip (si es diferente del módulo)
        silent: Si es True, suprime la salida de pip
    
    Returns:
        True si el módulo está disponible o se instaló correctamente
    """
    try:
        __import__(modulo)
        return True
    except ImportError:
        paquete = package_name or MODULE_TO_PACKAGE.get(modulo, modulo)
        if not silent:
            logger.warning(f"El módulo '{modulo}' no está disponible. Intentando instalar {paquete}...")
        return instalar_paquete(paquete, silent=silent)


def ensure_dependencies(*modules: str, silent: bool = True, raise_on_failure: bool = True) -> bool:
    """
    Función helper genérica para asegurar que los módulos estén instalados.
    Intenta importar cada módulo y si falla, lo instala automáticamente.
    
    Uso:
        # En cualquier script, al inicio:
        from InstallDependencies import ensure_dependencies
        
        # Asegurar que los módulos estén instalados
        ensure_dependencies('sqlalchemy', 'openpyxl', 'pandas')
        
        # Ahora puedes importar con seguridad
        from sqlalchemy import create_engine
        from openpyxl import Workbook
        import pandas as pd
    
    Args:
        *modules: Nombres de módulos a verificar/instalar (ej: 'sqlalchemy', 'openpyxl')
        silent: Si es True, suprime la salida de pip
        raise_on_failure: Si es True, lanza excepción si no se puede instalar
    
    Returns:
        True si todos los módulos están disponibles o se instalaron correctamente
    """
    if not modules:
        return True
    
    faltantes = []
    for modulo in modules:
        try:
            __import__(modulo)
        except ImportError:
            faltantes.append(modulo)
    
    if not faltantes:
        return True
    
    # Intentar instalar módulos faltantes
    if not silent:
        print(f"Instalando {len(faltantes)} dependencias faltantes: {', '.join(faltantes)}")
    
    exitoso = True
    for modulo in faltantes:
        paquete = MODULE_TO_PACKAGE.get(modulo, modulo)
        if not verificar_e_instalar(modulo, paquete, silent=silent):
            exitoso = False
            if raise_on_failure:
                raise ImportError(
                    f"No se pudo instalar el módulo '{modulo}'. "
                    f"Instálalo manualmente con: pip install {paquete}"
                )
    
    return exitoso


def ensure_dependencies_from_list(modules: list, silent: bool = True, raise_on_failure: bool = True) -> bool:
    """
    Versión alternativa de ensure_dependencies que acepta una lista.
    
    Args:
        modules: Lista de nombres de módulos a verificar/instalar
        silent: Si es True, suprime la salida de pip
        raise_on_failure: Si es True, lanza excepción si no se puede instalar
    
    Returns:
        True si todos los módulos están disponibles o se instalaron correctamente
    """
    return ensure_dependencies(*modules, silent=silent, raise_on_failure=raise_on_failure)


def instalar_desde_requirements(requirements_path: str = None, silent: bool = True) -> bool:
    """
    Instala dependencias desde un archivo requirements.txt.
    
    Args:
        requirements_path: Ruta al archivo requirements.txt. Si es None, busca en el directorio actual.
        silent: Si es True, suprime la salida de pip
    
    Returns:
        True si la instalación fue exitosa
    """
    if requirements_path is None:
        # Buscar requirements.txt en el directorio del script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        requirements_path = os.path.join(script_dir, "requirements.txt")
    
    if not os.path.exists(requirements_path):
        logger.error(f"Archivo requirements.txt no encontrado en: {requirements_path}")
        return False
    
    try:
        if not silent:
            logger.info(f"Instalando dependencias desde {requirements_path}...")
        
        cmd = [sys.executable, "-m", "pip", "install", "-r", requirements_path]
        
        if silent:
            result = subprocess.run(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=False
            )
        else:
            result = subprocess.run(cmd, check=False)
        
        if result.returncode == 0:
            if not silent:
                logger.info("✓ Dependencias instaladas correctamente desde requirements.txt")
            return True
        else:
            error_msg = result.stderr.decode('utf-8', errors='ignore') if silent else ""
            logger.error(f"✗ Error instalando desde requirements.txt: {error_msg}")
            return False
            
    except Exception as e:
        logger.error(f"✗ Error instalando desde requirements.txt: {e}")
        return False


if __name__ == "__main__":
    """Ejecutar como script para instalar todas las dependencias."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Instala dependencias del middleware INIA")
    parser.add_argument(
        "--module",
        help="Módulo específico para instalar dependencias",
        choices=list(REQUIRED_DEPENDENCIES.keys()) + [None]
    )
    parser.add_argument(
        "--requirements",
        action="store_true",
        help="Instalar desde requirements.txt"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Mostrar salida detallada"
    )
    
    args = parser.parse_args()
    
    silent = not args.verbose
    
    if args.requirements:
        exitoso = instalar_desde_requirements(silent=silent)
    elif args.module:
        exitoso = instalar_dependencias_faltantes(args.module, silent=silent)
    else:
        exitoso = instalar_dependencias_faltantes(silent=silent)
    
    sys.exit(0 if exitoso else 1)

