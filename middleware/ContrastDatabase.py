import os
import json
import argparse
import logging
from typing import Dict, List, Any, Optional, Tuple
from urllib.parse import quote_plus

# Intentar importar módulo de instalación de dependencias
try:
    from InstallDependencies import verificar_e_instalar, instalar_dependencias_faltantes
    INSTALL_DEPS_AVAILABLE = True
except ImportError:
    INSTALL_DEPS_AVAILABLE = False

# Verificar e instalar dependencias SQLAlchemy
if INSTALL_DEPS_AVAILABLE:
    if not verificar_e_instalar('sqlalchemy', 'SQLAlchemy', silent=True):
        print("Intentando instalar SQLAlchemy...")
        verificar_e_instalar('sqlalchemy', 'SQLAlchemy', silent=False)

# Importaciones SQLAlchemy
try:
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.automap import automap_base
except ModuleNotFoundError:
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('ContrastDatabase', silent=False):
            from sqlalchemy import create_engine, text
            from sqlalchemy.orm import sessionmaker
            from sqlalchemy.ext.automap import automap_base
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install -r requirements.txt")
            raise
    else:
        print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
        raise

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Importar configuración centralizada de base de datos
from database_config import build_connection_string

def obtener_engine():
    """Obtiene un engine de SQLAlchemy configurado."""
    connection_string = build_connection_string()
    return create_engine(connection_string)

# ================================
# MÓDULO: AUTOMAPEO DE MODELOS
# ================================
Base = None
_engine = None
_models_initialized = False
MODELS = {}

def inicializar_automap(engine=None):
    """Inicializa automap_base y genera modelos automáticamente desde la BD."""
    global Base, _engine, _models_initialized, MODELS
    
    if _models_initialized and Base is not None:
        return Base
    
    if engine is None:
        connection_string = build_connection_string()
        _engine = create_engine(connection_string)
    else:
        _engine = engine
    
    Base = automap_base()
    
    try:
        # Deshabilitar generación automática de relaciones para evitar conflictos de backref
        # Solo necesitamos las columnas para el contraste, no las relaciones
        Base.prepare(
            autoload_with=_engine,
            reflect=True,
            generate_relationship=None  # No generar relaciones automáticamente
        )
        logger.info(f"Modelos generados automáticamente: {len(Base.classes)} tablas")
    except Exception as e:
        logger.error(f"Error inicializando automap: {e}")
        # Si falla, intentar sin reflect=True como fallback
        try:
            logger.warning("Intentando inicializar automap sin reflect=True...")
            Base = automap_base()
            Base.prepare(autoload_with=_engine, generate_relationship=None)
            logger.info(f"Modelos generados automáticamente (fallback): {len(Base.classes)} tablas")
        except Exception as e2:
            logger.error(f"Error en fallback de automap: {e2}")
            raise
    
    MODELS.clear()
    for class_name in dir(Base.classes):
        if not class_name.startswith('_'):
            try:
                cls = getattr(Base.classes, class_name)
                # Intentar obtener el nombre de la tabla de diferentes formas
                tabla_nombre = None
                
                # Método 1: Intentar __tablename__
                try:
                    if hasattr(cls, '__tablename__'):
                        tabla_nombre = cls.__tablename__.lower()
                except:
                    pass
                
                # Método 2: Intentar __table__.name
                if tabla_nombre is None:
                    try:
                        if hasattr(cls, '__table__') and hasattr(cls.__table__, 'name'):
                            tabla_nombre = cls.__table__.name.lower()
                    except:
                        pass
                
                # Método 3: Usar el nombre de la clase directamente (en automap suelen coincidir)
                if tabla_nombre is None:
                    tabla_nombre = class_name.lower()
                
                # Mapear la clase
                if tabla_nombre:
                    MODELS[tabla_nombre] = cls
                    MODELS[class_name.lower()] = cls
                    logger.debug(f"Mapeado: {tabla_nombre} -> {class_name}")
            except Exception as e:
                logger.warning(f"Error procesando clase {class_name}: {e}")
                continue
    
    logger.info(f"Total de modelos mapeados: {len(MODELS)}")
    _models_initialized = True
    return Base

def obtener_modelo(nombre_tabla):
    """Obtiene un modelo por nombre de tabla."""
    if not _models_initialized or Base is None:
        inicializar_automap()
    
    nombre_tabla_lower = nombre_tabla.lower()
    if nombre_tabla_lower in MODELS:
        return MODELS[nombre_tabla_lower]
    
    if Base is not None:
        for class_name in dir(Base.classes):
            if not class_name.startswith('_'):
                try:
                    cls = getattr(Base.classes, class_name)
                    if hasattr(cls, '__tablename__') and cls.__tablename__.lower() == nombre_tabla_lower:
                        MODELS[nombre_tabla_lower] = cls
                        return cls
                except Exception:
                    continue
    
    raise AttributeError(f"Tabla '{nombre_tabla}' no encontrada en modelos reflejados")

def obtener_columnas_tabla(model) -> List[str]:
    """Obtiene las columnas de una tabla desde el modelo."""
    try:
        columnas = [c.name.lower() for c in model.__table__.columns]
        return columnas
    except Exception as e:
        logger.warning(f"Error obteniendo columnas del modelo: {e}")
        return []

def obtener_nombre_tabla_seguro(model) -> str:
    """Obtiene el nombre de la tabla de un modelo de forma segura."""
    try:
        if hasattr(model, '__tablename__'):
            return model.__tablename__
    except (AttributeError, TypeError):
        pass
    
    try:
        if hasattr(model, '__table__') and hasattr(model.__table__, 'name'):
            return model.__table__.name
    except (AttributeError, TypeError):
        pass
    
    try:
        if hasattr(model, '__name__'):
            return model.__name__.lower()
    except (AttributeError, TypeError):
        pass
    
    return str(model).split('.')[-1].split("'")[0].lower()

# ================================
# MÓDULO: CONTRASTE CON BASE DE DATOS
# ================================
def normalize_header_names(headers: List[str]) -> List[str]:
    """
    Normaliza los nombres de los encabezados (reutilizado de ImportExcel.py).
    Convierte a minúsculas, reemplaza espacios/guiones con guiones bajos,
    y remueve caracteres especiales.
    """
    import re
    import unicodedata
    
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

def contrastar_columnas_con_tabla(columnas_excel: List[str], columnas_tabla: List[str]) -> Tuple[float, List[str], List[str]]:
    """
    Contrasta las columnas del Excel con las columnas de una tabla.
    Usa la misma lógica de normalización que ImportExcel.py.
    
    Args:
        columnas_excel: Lista de nombres de columnas del Excel
        columnas_tabla: Lista de nombres de columnas de la tabla (en minúsculas)
    
    Returns:
        Tuple[float, List[str], List[str]]: (porcentaje_coincidencia, columnas_coincidentes, columnas_no_coincidentes)
    """
    if not columnas_excel or not columnas_tabla:
        return 0.0, [], columnas_excel
    
    # Normalizar columnas del Excel usando la misma lógica que ImportExcel.py
    columnas_excel_normalizadas = normalize_header_names(columnas_excel)
    columnas_tabla_lower = [col.lower().strip() for col in columnas_tabla]
    
    # Encontrar coincidencias exactas
    coincidencias = []
    no_coincidencias = []
    mapeo_coincidencias = {}  # Mapeo de columna Excel original -> columna BD
    
    for i, col_excel_norm in enumerate(columnas_excel_normalizadas):
        col_excel_original = columnas_excel[i]
        encontrada = False
        
        # Buscar coincidencia exacta
        if col_excel_norm in columnas_tabla_lower:
            coincidencias.append(col_excel_norm)
            mapeo_coincidencias[col_excel_original] = col_excel_norm
            encontrada = True
        else:
            # Buscar coincidencia parcial (substring)
            for col_tabla in columnas_tabla_lower:
                if col_excel_norm in col_tabla or col_tabla in col_excel_norm:
                    coincidencias.append(col_excel_norm)
                    mapeo_coincidencias[col_excel_original] = col_tabla
                    encontrada = True
                    break
        
        if not encontrada:
            no_coincidencias.append(col_excel_original)
    
    # Calcular porcentaje de coincidencia
    porcentaje = (len(coincidencias) / len(columnas_excel_normalizadas)) * 100 if columnas_excel_normalizadas else 0.0
    
    return porcentaje, coincidencias, no_coincidencias

def encontrar_tabla_mejor_coincidencia(columnas_excel: List[str], umbral_minimo: float = 30.0) -> Optional[Dict[str, Any]]:
    """
    Encuentra la tabla de la base de datos con mejor coincidencia para las columnas del Excel.
    
    Args:
        columnas_excel: Lista de nombres de columnas del Excel
        umbral_minimo: Porcentaje mínimo de coincidencia requerido (por defecto 30%)
    
    Returns:
        Diccionario con información de la tabla con mejor coincidencia, o None si no hay coincidencias suficientes
    """
    if not columnas_excel:
        return None
    
    mejor_tabla = None
    mejor_porcentaje = 0.0
    mejor_coincidencias = []
    mejor_no_coincidencias = []
    
    # Buscar en todas las tablas disponibles
    for tabla_nombre, model in MODELS.items():
        try:
            # Obtener columnas de la tabla
            columnas_tabla = obtener_columnas_tabla(model)
            if not columnas_tabla:
                continue
            
            # Contrastar columnas
            porcentaje, coincidencias, no_coincidencias = contrastar_columnas_con_tabla(
                columnas_excel, columnas_tabla
            )
            
            # Si esta tabla tiene mejor coincidencia y supera el umbral
            if porcentaje > mejor_porcentaje and porcentaje >= umbral_minimo:
                mejor_porcentaje = porcentaje
                mejor_tabla = tabla_nombre
                mejor_coincidencias = coincidencias
                mejor_no_coincidencias = no_coincidencias
        except Exception as e:
            logger.debug(f"Error contrastando con tabla {tabla_nombre}: {e}")
            continue
    
    if mejor_tabla:
        return {
            'tabla': mejor_tabla,
            'porcentaje_coincidencia': round(mejor_porcentaje, 2),
            'columnas_coincidentes': mejor_coincidencias,
            'columnas_no_coincidentes': mejor_no_coincidencias,
            'total_columnas_tabla': len(obtener_columnas_tabla(MODELS[mejor_tabla])),
            'total_columnas_excel': len(columnas_excel),
            'total_coincidencias': len(mejor_coincidencias)
        }
    
    return None

def obtener_tabla_sugerida_por_entidad(entidad_nombre: str) -> Optional[str]:
    """
    Obtiene el nombre de tabla sugerido basado en el nombre de la entidad.
    
    Args:
        entidad_nombre: Nombre de la entidad identificada
    
    Returns:
        Nombre de tabla sugerido, o None si no se puede sugerir
    """
    # Mapeo de entidades a nombres de tabla sugeridos
    mapeo_entidades_tablas = {
        'pureza': 'pureza',
        'pureza_pnotatum': 'pureza_pnotatum',
        'dosn': 'dosn',
        'germinacion': 'germinacion',
        'tetrazolio': 'tetrazolio',
        'sanitario': 'sanitario',
        'pms': 'pms',
        'recibo': 'recibo',
        'lote': 'lote',
        'usuario': 'usuario',
        'deposito': 'deposito',
        'certificado': 'certificado',
        'maleza': 'maleza',
        'cultivo': 'cultivo',
        'metodo': 'metodo',
        'general': None  # No sugerir tabla para entidades generales
    }
    
    entidad_lower = entidad_nombre.lower()
    return mapeo_entidades_tablas.get(entidad_lower)

def verificar_tabla_existe(nombre_tabla: str) -> bool:
    """
    Verifica si una tabla existe en la base de datos.
    
    Args:
        nombre_tabla: Nombre de la tabla a verificar
    
    Returns:
        True si la tabla existe, False en caso contrario
    """
    if not nombre_tabla:
        return False
    
    nombre_tabla_lower = nombre_tabla.lower()
    return nombre_tabla_lower in MODELS

def contrastar_entidad_con_bd(entidad_info: Dict[str, Any], umbral_minimo: float = 30.0) -> Dict[str, Any]:
    """
    Contrasta una entidad del mapeo con la base de datos.
    Usa la misma lógica de normalización que ImportExcel.py para mapear columnas.
    
    Args:
        entidad_info: Información de la entidad del mapeo JSON
        umbral_minimo: Porcentaje mínimo de coincidencia requerido
    
    Returns:
        Diccionario con la información de la entidad enriquecida con datos de la BD
    """
    # Obtener nombre de la entidad
    entidad_nombre = entidad_info.get('nombre', 'general')
    
    # Obtener columnas de la entidad (usar nombres originales, se normalizarán después)
    columnas_entidad = [col['nombre'] for col in entidad_info.get('columnas', [])]
    
    if not columnas_entidad:
        # Obtener tabla sugerida basada en la entidad
        tabla_sugerida = obtener_tabla_sugerida_por_entidad(entidad_nombre)
        tabla_existe = verificar_tabla_existe(tabla_sugerida) if tabla_sugerida else False
        
        return {
            **entidad_info,
            'tabla_bd': None,
            'tabla_sugerida': tabla_sugerida,
            'tabla_existe': tabla_existe,
            'estado': 'OK' if tabla_existe else 'TABLA_NO_ENCONTRADA',
            'porcentaje_coincidencia': 0.0,
            'coincidencia_encontrada': False,
            'detalles_coincidencia': {
                'mensaje': 'No hay columnas para contrastar',
                'tabla_sugerida': tabla_sugerida,
                'tabla_existe': tabla_existe,
                'accion_recomendada': f"Crear tabla '{tabla_sugerida}' en la base de datos" if tabla_sugerida and not tabla_existe else None
            }
        }
    
    # Buscar tabla con mejor coincidencia
    tabla_coincidencia = encontrar_tabla_mejor_coincidencia(columnas_entidad, umbral_minimo)
    
    if tabla_coincidencia:
        # Tabla encontrada con coincidencia suficiente
        tabla_encontrada = tabla_coincidencia['tabla']
        tabla_existe = verificar_tabla_existe(tabla_encontrada)
        
        return {
            **entidad_info,
            'tabla_bd': tabla_encontrada,
            'tabla_sugerida': tabla_encontrada,
            'tabla_existe': tabla_existe,
            'estado': 'OK',
            'porcentaje_coincidencia': tabla_coincidencia['porcentaje_coincidencia'],
            'coincidencia_encontrada': True,
            'detalles_coincidencia': {
                'columnas_coincidentes': tabla_coincidencia['columnas_coincidentes'],
                'columnas_no_coincidentes': tabla_coincidencia['columnas_no_coincidentes'],
                'total_columnas_tabla': tabla_coincidencia['total_columnas_tabla'],
                'total_columnas_excel': tabla_coincidencia['total_columnas_excel'],
                'total_coincidencias': tabla_coincidencia['total_coincidencias'],
                'mensaje': f"Tabla '{tabla_encontrada}' encontrada con {tabla_coincidencia['porcentaje_coincidencia']}% de coincidencia",
                'accion_recomendada': f"Usar tabla existente '{tabla_encontrada}'"
            }
        }
    else:
        # No se encontró tabla con coincidencia suficiente
        # Obtener tabla sugerida basada en la entidad
        tabla_sugerida = obtener_tabla_sugerida_por_entidad(entidad_nombre)
        tabla_existe = verificar_tabla_existe(tabla_sugerida) if tabla_sugerida else False
        
        # Buscar la mejor coincidencia aunque no supere el umbral
        mejor_coincidencia_sin_umbral = encontrar_tabla_mejor_coincidencia(columnas_entidad, umbral_minimo=0.0)
        
        resultado = {
            **entidad_info,
            'tabla_bd': None,
            'tabla_sugerida': tabla_sugerida,
            'tabla_existe': tabla_existe,
            'estado': 'OK' if tabla_existe else 'TABLA_NO_ENCONTRADA',
            'porcentaje_coincidencia': 0.0,
            'coincidencia_encontrada': False,
            'detalles_coincidencia': {
                'mensaje': f"No se encontró tabla con coincidencia suficiente (umbral mínimo: {umbral_minimo}%)",
                'tabla_sugerida': tabla_sugerida,
                'tabla_existe': tabla_existe
            }
        }
        
        # Si hay una mejor coincidencia aunque no supere el umbral, incluirla
        if mejor_coincidencia_sin_umbral:
            resultado['detalles_coincidencia']['mejor_coincidencia_sin_umbral'] = {
                'tabla': mejor_coincidencia_sin_umbral['tabla'],
                'porcentaje': mejor_coincidencia_sin_umbral['porcentaje_coincidencia']
            }
        
        # Agregar acción recomendada
        if tabla_sugerida:
            if tabla_existe:
                resultado['detalles_coincidencia']['accion_recomendada'] = f"Verificar si la tabla '{tabla_sugerida}' es la correcta. Coincidencia insuficiente con las columnas del Excel."
            else:
                resultado['detalles_coincidencia']['accion_recomendada'] = f"Crear tabla '{tabla_sugerida}' en la base de datos con las columnas identificadas del Excel."
        else:
            resultado['detalles_coincidencia']['accion_recomendada'] = "Revisar manualmente las columnas del Excel para determinar la tabla correcta."
        
        return resultado

def contrastar_mapeo_con_bd(mapeo_json: Dict[str, Any], umbral_minimo: float = 30.0) -> Dict[str, Any]:
    """
    Contrasta el mapeo JSON generado por AnalizedExcel.py con la base de datos.
    
    Args:
        mapeo_json: Mapeo JSON generado por AnalizedExcel.py
        umbral_minimo: Porcentaje mínimo de coincidencia requerido para considerar una tabla
    
    Returns:
        Mapeo enriquecido con información de las tablas reales de la base de datos
    """
    logger.info("Iniciando contraste del mapeo con la base de datos...")
    
    # Inicializar modelos de la base de datos
    try:
        engine = obtener_engine()
        inicializar_automap(engine)
        logger.info(f"Modelos de BD inicializados: {len(MODELS)} tablas disponibles")
    except Exception as e:
        logger.error(f"Error inicializando modelos de BD: {e}")
        raise
    
    # Crear mapeo enriquecido
    mapeo_contrastado = {
        'archivo': mapeo_json.get('archivo', 'desconocido'),
        'ruta': mapeo_json.get('ruta', ''),
        'resumen': mapeo_json.get('resumen', {}),
        'hojas': []
    }
    
    # Agregar información de tablas disponibles en BD
    mapeo_contrastado['resumen']['tablas_bd_disponibles'] = len(MODELS)
    mapeo_contrastado['resumen']['tablas_bd'] = sorted(list(MODELS.keys()))
    
    # Procesar cada hoja
    for hoja in mapeo_json.get('hojas', []):
        hoja_contrastada = {
            'nombre': hoja.get('nombre', ''),
            'resumen': hoja.get('resumen', {}),
            'entidades': {}
        }
        
        # Procesar cada entidad de la hoja
        for entidad_nombre, entidad_info in hoja.get('entidades', {}).items():
            logger.info(f"Contrastando entidad '{entidad_nombre}' con base de datos...")
            
            # Contrastar entidad con BD
            entidad_contrastada = contrastar_entidad_con_bd(entidad_info, umbral_minimo)
            
            # Agregar información adicional
            entidad_contrastada['entidad_estimada'] = entidad_nombre
            
            hoja_contrastada['entidades'][entidad_nombre] = entidad_contrastada
            
            if entidad_contrastada.get('coincidencia_encontrada'):
                logger.info(f"  -> Tabla BD encontrada: {entidad_contrastada['tabla_bd']} "
                          f"({entidad_contrastada['porcentaje_coincidencia']}% coincidencia)")
            else:
                logger.warning(f"  -> No se encontró tabla BD con coincidencia suficiente")
        
        mapeo_contrastado['hojas'].append(hoja_contrastada)
    
    # Calcular estadísticas finales
    total_entidades = sum(len(hoja.get('entidades', {})) for hoja in mapeo_contrastado['hojas'])
    entidades_con_tabla = sum(
        1 for hoja in mapeo_contrastado['hojas']
        for entidad in hoja.get('entidades', {}).values()
        if entidad.get('coincidencia_encontrada', False)
    )
    
    # Calcular estadísticas de tablas sugeridas
    tablas_sugeridas = []
    tablas_sugeridas_existentes = []
    tablas_sugeridas_no_existentes = []
    
    for hoja in mapeo_contrastado['hojas']:
        for entidad in hoja.get('entidades', {}).values():
            tabla_sugerida = entidad.get('tabla_sugerida')
            if tabla_sugerida and tabla_sugerida not in tablas_sugeridas:
                tablas_sugeridas.append(tabla_sugerida)
                if entidad.get('tabla_existe', False):
                    tablas_sugeridas_existentes.append(tabla_sugerida)
                else:
                    tablas_sugeridas_no_existentes.append(tabla_sugerida)
    
    mapeo_contrastado['resumen']['total_entidades'] = total_entidades
    mapeo_contrastado['resumen']['entidades_con_tabla_bd'] = entidades_con_tabla
    mapeo_contrastado['resumen']['entidades_sin_tabla_bd'] = total_entidades - entidades_con_tabla
    mapeo_contrastado['resumen']['porcentaje_mapeo_exitoso'] = round(
        (entidades_con_tabla / total_entidades * 100) if total_entidades > 0 else 0, 2
    )
    
    # Agregar información de tablas sugeridas
    mapeo_contrastado['resumen']['tablas_sugeridas'] = sorted(tablas_sugeridas)
    mapeo_contrastado['resumen']['tablas_sugeridas_existentes'] = sorted(tablas_sugeridas_existentes)
    mapeo_contrastado['resumen']['tablas_sugeridas_no_existentes'] = sorted(tablas_sugeridas_no_existentes)
    mapeo_contrastado['resumen']['total_tablas_sugeridas'] = len(tablas_sugeridas)
    mapeo_contrastado['resumen']['total_tablas_sugeridas_existentes'] = len(tablas_sugeridas_existentes)
    mapeo_contrastado['resumen']['total_tablas_sugeridas_no_existentes'] = len(tablas_sugeridas_no_existentes)
    
    logger.info(f"Contraste completado: {entidades_con_tabla}/{total_entidades} entidades mapeadas a tablas BD")
    logger.info(f"Tablas sugeridas: {len(tablas_sugeridas)} total, {len(tablas_sugeridas_existentes)} existentes, {len(tablas_sugeridas_no_existentes)} no existentes")
    
    return mapeo_contrastado

def imprimir_mapeo_contrastado(mapeo: Dict[str, Any], formato: str = 'texto') -> None:
    """
    Imprime el mapeo contrastado en el formato especificado.
    
    Args:
        mapeo: Mapeo contrastado con la base de datos
        formato: Formato de salida ('texto' o 'json')
    """
    if formato == 'json':
        print(json.dumps(mapeo, indent=2, ensure_ascii=False))
    else:
        # Formato texto legible
        print("=" * 80)
        print(f"CONTRASTE CON BASE DE DATOS: {mapeo['archivo']}")
        print("=" * 80)
        print(f"Ruta: {mapeo['ruta']}")
        print(f"\nResumen General:")
        print(f"  - Total de hojas: {mapeo['resumen']['total_hojas']}")
        print(f"  - Total de columnas: {mapeo['resumen']['total_columnas']}")
        print(f"  - Total de filas: {mapeo['resumen']['total_filas']}")
        print(f"  - Tablas BD disponibles: {mapeo['resumen']['tablas_bd_disponibles']}")
        print(f"  - Entidades identificadas: {mapeo['resumen']['total_entidades']}")
        print(f"  - Entidades con tabla BD: {mapeo['resumen']['entidades_con_tabla_bd']}")
        print(f"  - Entidades sin tabla BD: {mapeo['resumen']['entidades_sin_tabla_bd']}")
        print(f"  - Porcentaje mapeo exitoso: {mapeo['resumen']['porcentaje_mapeo_exitoso']}%")
        print("\n" + "=" * 80)
        
        for hoja in mapeo['hojas']:
            print(f"\nHOJA: {hoja['nombre']}")
            print("-" * 80)
            print(f"  Columnas: {hoja['resumen']['total_columnas']}, Filas: {hoja['resumen']['total_filas']}")
            print("\n  Entidades y tablas BD:")
            
            for entidad_nombre, entidad_info in hoja['entidades'].items():
                tabla_bd = entidad_info.get('tabla_bd')
                porcentaje = entidad_info.get('porcentaje_coincidencia', 0.0)
                coincidencia = entidad_info.get('coincidencia_encontrada', False)
                
                print(f"\n    [{entidad_nombre.upper()}]")
                if coincidencia and tabla_bd:
                    print(f"      Tabla BD: {tabla_bd}")
                    print(f"      Coincidencia: {porcentaje}%")
                    detalles = entidad_info.get('detalles_coincidencia', {})
                    print(f"      Columnas coincidentes: {len(detalles.get('columnas_coincidentes', []))}")
                    print(f"      Columnas no coincidentes: {len(detalles.get('columnas_no_coincidentes', []))}")
                    if detalles.get('columnas_coincidentes'):
                        print(f"      Coincidencias: {', '.join(detalles['columnas_coincidentes'][:10])}")
                else:
                    print(f"      Tabla BD: No encontrada")
                    print(f"      Coincidencia: {porcentaje}%")
                    print(f"      Mensaje: {entidad_info.get('detalles_coincidencia', {}).get('mensaje', 'Sin coincidencias')}")
        
        print("\n" + "=" * 80)

# ================================
# MÓDULO: FUNCIÓN PRINCIPAL
# ================================
def contrastar_json_con_bd(ruta_json: str, umbral_minimo: float = 30.0, formato_salida: str = 'texto', imprimir: bool = True) -> Dict[str, Any]:
    """
    Función principal que toma un JSON de mapeo y lo contrasta con la base de datos.
    
    Args:
        ruta_json: Ruta al archivo JSON generado por AnalizedExcel.py
        umbral_minimo: Porcentaje mínimo de coincidencia requerido
        formato_salida: Formato de salida ('texto' o 'json')
    
    Returns:
        Mapeo contrastado con la base de datos
    """
    logger.info(f"Iniciando contraste de JSON con base de datos: {ruta_json}")
    
    try:
        # Leer JSON
        if not os.path.exists(ruta_json):
            raise FileNotFoundError(f"El archivo JSON no existe: {ruta_json}")
        
        with open(ruta_json, 'r', encoding='utf-8') as f:
            mapeo_json = json.load(f)
        
        logger.info(f"JSON cargado: {mapeo_json.get('archivo', 'desconocido')}")
        
        # Contrastar con BD
        mapeo_contrastado = contrastar_mapeo_con_bd(mapeo_json, umbral_minimo)
        
        # Imprimir resultado
        if imprimir:
            imprimir_mapeo_contrastado(mapeo_contrastado, formato_salida)
        
        return mapeo_contrastado
        
    except Exception as e:
        logger.error(f"Error contrastando JSON con BD: {e}")
        raise

def main():
    """Función principal del script."""
    parser = argparse.ArgumentParser(description="Contrasta uno o varios mapeos JSON con la base de datos para identificar tablas reales")
    parser.add_argument(
        "json_files",
        nargs="+",
        help="Ruta(s) a los archivos JSON generados por AnalizedExcel.py"
    )
    parser.add_argument(
        "--umbral",
        type=float,
        default=30.0,
        help="Porcentaje mínimo de coincidencia requerido (por defecto 30.0)"
    )
    parser.add_argument(
        "--formato",
        choices=["texto", "json"],
        default="texto",
        help="Formato de salida (texto por defecto)"
    )
    args = parser.parse_args()
    
    resultados_json: List[Dict[str, Any]] = []
    errores: List[Dict[str, str]] = []
    
    for ruta in args.json_files:
        logger.info(f"Contrastando archivo '{ruta}'...")
        try:
            if args.formato == "texto":
                print(f"\n=== Archivo: {ruta} ===\n")
                contrastar_json_con_bd(ruta, args.umbral, args.formato, imprimir=True)
            else:
                mapeo = contrastar_json_con_bd(ruta, args.umbral, args.formato, imprimir=False)
                resultados_json.append({"archivo": ruta, "resultado": mapeo})
        except Exception as e:
            logger.error(f"Error contrastando '{ruta}': {e}", exc_info=True)
            errores.append({"archivo": ruta, "error": str(e)})
    
    if args.formato == "json":
        salida = {
            "total_archivos": len(args.json_files),
            "procesados": resultados_json,
            "errores": errores or None,
        }
        print(json.dumps(salida, indent=2, ensure_ascii=False))

    if errores:
        raise SystemExit(1)

if __name__ == "__main__":
    main()


