"""
Módulo común para gestión de base de datos y automapeo de modelos SQLAlchemy.
Centraliza la lógica compartida entre MassiveInsertFiles, ExportExcel, ImportExcel y ContrastDatabase.
"""
import logging
import traceback
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base

# Variables globales compartidas
Base = None
_engine = None
_models_initialized = False
MODELS = {}
_TABLES_CACHE = {}

logger = logging.getLogger(__name__)


def obtener_engine(use_pool: bool = False):
    """
    Obtiene un engine de SQLAlchemy configurado.
    
    Args:
        use_pool: Si es True, intenta usar create_engine_with_pool del servicio
    
    Returns:
        Engine de SQLAlchemy
    """
    from database_config import build_connection_string
    
    if use_pool:
        try:
            from app.services.database_service import create_engine_with_pool
            logger.debug("Usando create_engine_with_pool() con pool de conexiones")
            return create_engine_with_pool()
        except ImportError:
            logger.debug("create_engine_with_pool no disponible, usando build_connection_string")
    
    connection_string = build_connection_string()
    return create_engine(connection_string)


def _intentar_reflejar_tablas_selectivas(engine, tablas_criticas=None):
    """
    Intenta reflejar tablas de forma selectiva para evitar problemas de codificación.
    Usado principalmente por ImportExcel.py.
    
    Args:
        engine: Engine de SQLAlchemy
        tablas_criticas: Lista de nombres de tablas críticas a reflejar primero
    
    Returns:
        Base preparado o None si falla
    """
    if tablas_criticas is None:
        tablas_criticas = ['lote', 'recibo']  # Tablas críticas para importación
    
    try:
        from sqlalchemy import inspect as sql_inspect
        inspector = sql_inspect(engine)
        
        # Obtener esquemas disponibles
        schemas = inspector.get_schema_names()
        tablas_disponibles = []
        
        for schema in schemas:
            if schema in ['pg_catalog', 'information_schema']:
                continue
            try:
                tablas = inspector.get_table_names(schema=schema)
                for tabla in tablas:
                    tablas_disponibles.append((schema, tabla))
            except Exception as e:
                logger.warning(f"Error obteniendo tablas del esquema {schema}: {e}")
                continue
        
        # Intentar reflejar solo tablas críticas primero
        tablas_a_reflejar = []
        for schema, tabla in tablas_disponibles:
            tabla_lower = tabla.lower()
            if any(critica.lower() in tabla_lower for critica in tablas_criticas):
                tablas_a_reflejar.append((schema, tabla))
        
        if tablas_a_reflejar:
            logger.info(f"Intentando reflejar {len(tablas_a_reflejar)} tablas críticas...")
            Base_selectivo = automap_base()
            metadata = Base_selectivo.metadata
            
            # Reflejar solo las tablas críticas
            nombres_tablas = [tabla for _, tabla in tablas_a_reflejar]
            metadata.reflect(engine, only=nombres_tablas)
            Base_selectivo.prepare()
            logger.info(f"✓ Tablas críticas reflejadas exitosamente: {len(Base_selectivo.classes)} tablas")
            return Base_selectivo
        
        # Si no hay tablas críticas, intentar reflejar todas
        logger.info("No se encontraron tablas críticas, intentando reflejar todas...")
        Base_selectivo = automap_base()
        Base_selectivo.prepare(autoload_with=engine, generate_relationship=None)
        return Base_selectivo
        
    except Exception as e:
        logger.error(f"Error en reflejo selectivo: {e}")
        return None


def _obtener_nombre_tabla_de_clase(cls, class_name: str) -> Optional[str]:
    """
    Obtiene el nombre de tabla de una clase de forma segura.
    Maneja problemas de codificación.
    
    Args:
        cls: Clase del modelo SQLAlchemy
        class_name: Nombre de la clase
    
    Returns:
        Nombre de la tabla en minúsculas o None
    """
    # Método 1: __tablename__
    try:
        if hasattr(cls, '__tablename__'):
            tabla_nombre_raw = cls.__tablename__
            # Manejar posibles problemas de codificación
            if isinstance(tabla_nombre_raw, bytes):
                tabla_nombre = tabla_nombre_raw.decode('utf-8', errors='replace').lower()
            else:
                tabla_nombre = str(tabla_nombre_raw).lower()
            return tabla_nombre
    except (UnicodeDecodeError, UnicodeError) as e:
        logger.warning(f"Error de codificación obteniendo __tablename__ de {class_name}: {e}")
        try:
            # Intentar con diferentes codificaciones
            if isinstance(cls.__tablename__, bytes):
                return cls.__tablename__.decode('latin-1', errors='replace').lower()
        except:
            pass
    except Exception:
        pass
    
    # Método 2: __table__.name
    try:
        if hasattr(cls, '__table__') and hasattr(cls.__table__, 'name'):
            tabla_nombre_raw = cls.__table__.name
            # Manejar posibles problemas de codificación
            if isinstance(tabla_nombre_raw, bytes):
                tabla_nombre = tabla_nombre_raw.decode('utf-8', errors='replace').lower()
            else:
                tabla_nombre = str(tabla_nombre_raw).lower()
            return tabla_nombre
    except (UnicodeDecodeError, UnicodeError) as e:
        logger.warning(f"Error de codificación obteniendo __table__.name de {class_name}: {e}")
        try:
            if hasattr(cls, '__table__') and hasattr(cls.__table__, 'name'):
                if isinstance(cls.__table__.name, bytes):
                    return cls.__table__.name.decode('latin-1', errors='replace').lower()
        except:
            pass
    except Exception:
        pass
    
    # Método 3: Nombre de clase
    try:
        return str(class_name).lower()
    except Exception:
        logger.warning(f"Error convirtiendo class_name a string: {class_name}")
        return None


def _mapear_modelos():
    """Mapea los modelos a un diccionario para acceso rápido."""
    global MODELS
    
    MODELS.clear()
    modelos_procesados = 0
    modelos_con_error = 0
    
    for class_name in dir(Base.classes):
        if not class_name.startswith('_'):
            try:
                cls = getattr(Base.classes, class_name)
                tabla_nombre = _obtener_nombre_tabla_de_clase(cls, class_name)
                
                if tabla_nombre:
                    MODELS[tabla_nombre] = cls
                    MODELS[class_name.lower()] = cls
                    modelos_procesados += 1
                    logger.debug(f"Mapeado: {tabla_nombre} -> {class_name}")
            except (UnicodeDecodeError, UnicodeError) as e:
                modelos_con_error += 1
                logger.warning(f"Error de codificación procesando clase {class_name}: {e}. Omitiendo esta clase.")
                continue
            except Exception as e:
                modelos_con_error += 1
                logger.warning(f"Error procesando clase {class_name}: {e}")
                continue
    
    logger.info(f"Total de modelos mapeados: {len(MODELS)} (procesados: {modelos_procesados}, con errores: {modelos_con_error})")
    
    # Verificar que se mapearon al menos algunos modelos
    if len(MODELS) == 0:
        raise RuntimeError("No se pudieron mapear modelos. MODELS está vacío después del procesamiento.")


def inicializar_automap(engine=None, use_pool: bool = False, robust_error_handling: bool = False):
    """
    Inicializa automap_base y genera modelos automáticamente desde la BD.
    
    Args:
        engine: Engine opcional (si None, se crea uno nuevo)
        use_pool: Si es True, intenta usar pool de conexiones
        robust_error_handling: Si es True, usa manejo robusto de errores (para ImportExcel)
    
    Returns:
        Base de automap inicializado
    """
    global Base, _engine, _models_initialized, MODELS
    
    if _models_initialized and Base is not None:
        return Base
    
    if engine is None:
        if use_pool:
            # Usar función centralizada para crear engine con codificación UTF-8
            try:
                from app.services.database_service import create_engine_with_pool
                _engine = create_engine_with_pool()
                logger.info("Engine creado usando create_engine_with_pool() con codificación UTF-8")
            except Exception as e:
                logger.error(f"Error creando engine con create_engine_with_pool(): {e}")
                logger.error(traceback.format_exc())
                raise
        else:
            _engine = obtener_engine(use_pool=False)
    else:
        _engine = engine
    
    Base = automap_base()
    
    logger.info("Iniciando preparación de automap_base...")
    logger.debug(f"Engine configurado: {_engine.url if hasattr(_engine, 'url') else 'N/A'}")
    
    try:
        # Deshabilitar generación automática de relaciones para evitar conflictos de backref
        # Solo necesitamos las columnas para la importación, no las relaciones
        logger.info("Ejecutando Base.prepare() para reflejar todas las tablas...")
        Base.prepare(
            autoload_with=_engine,
            generate_relationship=None  # No generar relaciones automáticamente
        )
        logger.info(f"Modelos generados automáticamente: {len(Base.classes)} tablas")
    except (UnicodeDecodeError, UnicodeError) as e:
        if robust_error_handling:
            # Manejo robusto para ImportExcel (con manejo de codificación)
            logger.error("=" * 80)
            logger.error("ERROR DE CODIFICACIÓN DETECTADO DURANTE Base.prepare()")
            logger.error("=" * 80)
            logger.error(f"Tipo de error: {type(e).__name__}")
            logger.error(f"Mensaje: {e}")
            if hasattr(e, 'start') and hasattr(e, 'end'):
                logger.error(f"Posición del error: bytes {e.start}-{e.end}")
            logger.error("Stack trace completo:")
            logger.error(traceback.format_exc())
            logger.warning("Esto puede deberse a nombres de tablas/columnas con caracteres especiales.")
            logger.warning("Intentando continuar con manejo de errores de codificación...")
            
            # Verificar si se cargaron algunas clases a pesar del error
            if not hasattr(Base, 'classes') or len(Base.classes) == 0:
                # Si no se cargaron clases, intentar con configuración de codificación diferente
                logger.warning("No se cargaron clases. Intentando con configuración alternativa...")
                try:
                    # Intentar con encoding explícito en la conexión
                    Base = automap_base()
                    logger.info("Reintentando Base.prepare() con configuración alternativa...")
                    Base.prepare(autoload_with=_engine, generate_relationship=None)
                    logger.info(f"Modelos generados automáticamente (con encoding alternativo): {len(Base.classes)} tablas")
                except Exception as e2:
                    logger.error(f"Error en intento alternativo: {e2}")
                    logger.error("Stack trace del intento alternativo:")
                    logger.error(traceback.format_exc())
                    
                    # Intentar reflejo selectivo como último recurso
                    logger.warning("Intentando reflejo selectivo de tablas críticas...")
                    Base_selectivo = _intentar_reflejar_tablas_selectivas(_engine)
                    if Base_selectivo and hasattr(Base_selectivo, 'classes') and len(Base_selectivo.classes) > 0:
                        Base = Base_selectivo
                        logger.info(f"✓ Reflejo selectivo exitoso: {len(Base.classes)} tablas cargadas")
                    else:
                        raise RuntimeError(f"No se pudieron cargar modelos debido a error de codificación: {e}. Error alternativo: {e2}")
        else:
            raise
    except Exception as e:
        logger.error("=" * 80)
        logger.error("ERROR INESPERADO DURANTE Base.prepare()")
        logger.error("=" * 80)
        logger.error(f"Tipo de error: {type(e).__name__}")
        logger.error(f"Mensaje: {e}")
        logger.error("Stack trace completo:")
        logger.error(traceback.format_exc())
        # Si falla, intentar sin reflect=True como fallback
        try:
            logger.warning("Intentando inicializar automap sin reflect=True...")
            Base = automap_base()
            Base.prepare(autoload_with=_engine, generate_relationship=None)
            logger.info(f"Modelos generados automáticamente (fallback): {len(Base.classes)} tablas")
        except (UnicodeDecodeError, UnicodeError) as e2:
            logger.error(f"Error de codificación en fallback de automap: {e2}")
            logger.error("Stack trace del fallback:")
            logger.error(traceback.format_exc())
            logger.warning("Continuando con manejo de errores de codificación...")
            pass
        except Exception as e2:
            logger.error(f"Error en fallback de automap: {e2}")
            logger.error("Stack trace del fallback:")
            logger.error(traceback.format_exc())
            
            # Intentar reflejo selectivo como último recurso
            if robust_error_handling:
                logger.warning("Intentando reflejo selectivo de tablas críticas como último recurso...")
                Base_selectivo = _intentar_reflejar_tablas_selectivas(_engine)
                if Base_selectivo and hasattr(Base_selectivo, 'classes') and len(Base_selectivo.classes) > 0:
                    Base = Base_selectivo
                    logger.info(f"✓ Reflejo selectivo exitoso: {len(Base.classes)} tablas cargadas")
                else:
                    raise
    
    # Verificar que se cargaron clases
    if not hasattr(Base, 'classes') or len(Base.classes) == 0:
        raise RuntimeError("No se cargaron modelos de la base de datos. Base.classes está vacío.")
    
    _mapear_modelos()
    _models_initialized = True
    return Base


def obtener_modelo(nombre_tabla: str):
    """
    Obtiene un modelo por nombre de tabla.
    
    Args:
        nombre_tabla: Nombre de la tabla (case-insensitive)
    
    Returns:
        Modelo SQLAlchemy
    
    Raises:
        AttributeError: Si la tabla no se encuentra
    """
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


def obtener_nombre_tabla_seguro(model) -> str:
    """
    Obtiene el nombre de la tabla de un modelo de forma segura.
    Maneja diferentes formas en que SQLAlchemy puede exponer el nombre de la tabla.
    
    Args:
        model: Modelo SQLAlchemy
    
    Returns:
        Nombre de la tabla
    """
    # Método 1: Intentar __tablename__ directamente
    try:
        if hasattr(model, '__tablename__'):
            return model.__tablename__
    except (AttributeError, TypeError):
        pass
    
    # Método 2: Intentar __table__.name
    try:
        if hasattr(model, '__table__') and hasattr(model.__table__, 'name'):
            return model.__table__.name
    except (AttributeError, TypeError):
        pass
    
    # Método 3: Usar el nombre de la clase como fallback
    try:
        if hasattr(model, '__name__'):
            return model.__name__.lower()
    except (AttributeError, TypeError):
        pass
    
    # Método 4: Intentar obtener desde el mapper
    try:
        if hasattr(model, '__mapper__') and hasattr(model.__mapper__, 'tables'):
            tables = model.__mapper__.tables
            if tables:
                return list(tables)[0].name
    except (AttributeError, TypeError, IndexError):
        pass
    
    # Último recurso: usar el nombre de la clase como string
    return str(model).split('.')[-1].split("'")[0].lower()


def reset_automap():
    """
    Resetea el estado del automapeo (útil para tests).
    """
    global Base, _engine, _models_initialized, MODELS, _TABLES_CACHE
    Base = None
    _engine = None
    _models_initialized = False
    MODELS.clear()
    _TABLES_CACHE.clear()

