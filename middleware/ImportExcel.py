import os
import csv
import argparse
import logging
import re
import unicodedata
from typing import Any, Dict, Iterable, List, Optional, Tuple
from datetime import datetime, date
from urllib.parse import quote_plus

# Importar configuración de metadatos
try:
    from metadata_config import (
        METADATA_KEYWORDS,
        METADATA_PATTERNS,
        VALID_HEADER_KEYWORDS,
        VALIDATION_CONFIG,
        ANALYSIS_TYPE_TO_TABLES,
        ANALYSIS_KEYWORDS,
        HEADER_SYNONYMS,
    )
except ImportError:
    # Fallback si no se puede importar
    METADATA_KEYWORDS = []
    METADATA_PATTERNS = []
    VALID_HEADER_KEYWORDS = []
    VALIDATION_CONFIG = {
        "min_headers_validos": 3,
        "max_header_length": 50,
        "min_header_length": 1,
        "max_numeric_percentage": 0.3,
        "max_metadata_percentage": 0.3,
        "min_valid_percentage": 0.5,
        "confidence_threshold": 0.4,
        "max_title_length": 30,
    }
    ANALYSIS_TYPE_TO_TABLES = {}
    ANALYSIS_KEYWORDS = {}
    HEADER_SYNONYMS = {}

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
    from sqlalchemy import create_engine, text, Table, inspect
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.automap import automap_base
except ModuleNotFoundError:
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('ImportExcel', silent=False):
            from sqlalchemy import create_engine, text, Table, inspect
            from sqlalchemy.orm import sessionmaker
            from sqlalchemy.ext.automap import automap_base
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install -r requirements.txt")
            raise
    else:
        print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
        raise

# Dependencias opcionales para Excel
try:
    from openpyxl import load_workbook
    OPENPYXL_AVAILABLE = True
except Exception:
    OPENPYXL_AVAILABLE = False
    # Intentar instalar openpyxl si el módulo de instalación está disponible
    if INSTALL_DEPS_AVAILABLE:
        if verificar_e_instalar('openpyxl', 'openpyxl', silent=False):
            try:
                from openpyxl import load_workbook
                OPENPYXL_AVAILABLE = True
            except Exception:
                OPENPYXL_AVAILABLE = False

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de conexión a la base de datos
DEFAULT_CONFIG = {
    'DB_USER': 'postgres',
    'DB_PASSWORD': '897888fg2',
    'DB_HOST': 'localhost',
    'DB_PORT': '5432',
    'DB_NAME': 'Inia',
}

DB_USER = os.getenv('DB_USER', os.getenv('POSTGRES_USER', DEFAULT_CONFIG['DB_USER']))
DB_PASSWORD = os.getenv('DB_PASSWORD', os.getenv('POSTGRES_PASSWORD', DEFAULT_CONFIG['DB_PASSWORD']))
DB_HOST = os.getenv('DB_HOST', os.getenv('POSTGRES_HOST', DEFAULT_CONFIG['DB_HOST']))
DB_PORT = os.getenv('DB_PORT', os.getenv('POSTGRES_PORT', DEFAULT_CONFIG['DB_PORT']))
DB_NAME = os.getenv('DB_NAME', os.getenv('POSTGRES_DB', DEFAULT_CONFIG['DB_NAME']))

# ================================
# MÓDULO: CONEXIÓN A BASE DE DATOS
# ================================
def build_connection_string() -> str:
    """Construye la cadena de conexión escapando credenciales."""
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        if database_url.startswith('postgresql://'):
            return database_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
        elif database_url.startswith('postgres://'):
            return database_url.replace('postgres://', 'postgresql+psycopg2://', 1)
        return database_url
    
    user_esc = quote_plus(DB_USER or '')
    pass_esc = quote_plus(DB_PASSWORD or '')
    host = DB_HOST or 'localhost'
    port = DB_PORT or '5432'
    db = DB_NAME or ''
    return f'postgresql+psycopg2://{user_esc}:{pass_esc}@{host}:{port}/{db}'

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
# Caché de tablas para evitar acceder al mapper repetidamente
_TABLES_CACHE = {}

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
        # Solo necesitamos las columnas para la importación, no las relaciones
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

def obtener_nombre_tabla_seguro(model) -> str:
    """
    Obtiene el nombre de la tabla de un modelo de forma segura.
    Maneja diferentes formas en que SQLAlchemy puede exponer el nombre de la tabla.
    """
    try:
        # Método 1: Intentar __tablename__ directamente
        if hasattr(model, '__tablename__'):
            return model.__tablename__
    except (AttributeError, TypeError):
        pass
    
    try:
        # Método 2: Intentar __table__.name
        if hasattr(model, '__table__') and hasattr(model.__table__, 'name'):
            return model.__table__.name
    except (AttributeError, TypeError):
        pass
    
    try:
        # Método 3: Usar el nombre de la clase como fallback
        if hasattr(model, '__name__'):
            return model.__name__.lower()
    except (AttributeError, TypeError):
        pass
    
    try:
        # Método 4: Intentar obtener desde el mapeo
        if hasattr(model, '__mapper__') and hasattr(model.__mapper__, 'tables'):
            tables = model.__mapper__.tables
            if tables:
                return list(tables)[0].name
    except (AttributeError, TypeError, IndexError):
        pass
    
    # Último recurso: usar el nombre de la clase como string
    return str(model).split('.')[-1].split("'")[0].lower()

# ================================
# MÓDULO: UTILIDADES DE ARCHIVOS
# ================================
def detect_format_from_path(ruta_archivo: str) -> Optional[str]:
    """Detecta el formato de un archivo basándose en su extensión."""
    if not ruta_archivo:
        return None
    
    _, ext = os.path.splitext(ruta_archivo.lower())
    if ext == '.xlsx' or ext == '.xls':
        return 'xlsx'
    elif ext == '.csv':
        return 'csv'
    return None

def read_rows_from_xlsx(ruta_archivo: str, max_rows: Optional[int] = None) -> Tuple[List[str], List[List[Any]]]:
    """Lee las filas de un archivo Excel. Retorna (headers, rows)."""
    if not OPENPYXL_AVAILABLE:
        raise RuntimeError("openpyxl no está instalado")
    
    headers = []
    rows = []
    
    try:
        wb = load_workbook(ruta_archivo, data_only=True)
        ws = wb.active
        
        # Leer encabezados (primera fila)
        if ws.max_row > 0:
            for col in range(1, ws.max_column + 1):
                celda = ws.cell(row=1, column=col)
                valor = celda.value
                headers.append(str(valor).strip() if valor is not None else f"Columna_{col}")
        
        # Leer filas de datos
        start_row = 2
        end_row = ws.max_row + 1
        if max_rows:
            end_row = min(start_row + max_rows, end_row)
        
        for row_num in range(start_row, end_row):
            fila = []
            for col in range(1, ws.max_column + 1):
                celda = ws.cell(row=row_num, column=col)
                fila.append(celda.value)
            rows.append(fila)
        
        wb.close()
    except Exception as e:
        logger.error(f"Error leyendo archivo Excel: {e}")
        raise
    
    return headers, rows

def read_rows_from_csv(ruta_archivo: str, max_rows: Optional[int] = None) -> Tuple[List[str], List[List[Any]]]:
    """Lee las filas de un archivo CSV. Retorna (headers, rows)."""
    headers = []
    rows = []
    
    try:
        with open(ruta_archivo, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            
            # Leer encabezados (primera fila)
            try:
                headers = next(reader)
                headers = [h.strip() if h else f"Columna_{i+1}" for i, h in enumerate(headers)]
            except StopIteration:
                pass
            
            # Leer filas de datos
            for i, fila in enumerate(reader):
                if max_rows and i >= max_rows:
                    break
                rows.append(fila)
    except Exception as e:
        logger.error(f"Error leyendo archivo CSV: {e}")
        raise
    
    return headers, rows

def normalize_header_names(headers: List[str]) -> List[str]:
    """Normaliza los nombres de los encabezados."""
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

# ================================
# MÓDULO: DETECCIÓN DE TABLAS
# ================================
def detectar_tipo_analisis_por_contenido(ruta_archivo: str) -> Optional[str]:
    """Detecta el tipo de análisis basándose en el contenido del archivo."""
    try:
        fmt = detect_format_from_path(ruta_archivo)
        if not fmt:
            return None
        
        # Leer primera fila para detectar tipo
        if fmt == 'xlsx':
            headers, _ = read_rows_from_xlsx(ruta_archivo, max_rows=1)
        else:
            headers, _ = read_rows_from_csv(ruta_archivo, max_rows=1)
        
        headers_lower = [h.lower() for h in headers if h]
        
        # Detectar tipo de análisis basándose en keywords
        if any('dosn' in h for h in headers_lower):
            return 'dosn'
        elif any('pureza' in h for h in headers_lower):
            return 'pureza'
        elif any('germinacion' in h for h in headers_lower):
            return 'germinacion'
        elif any('tetrazolio' in h for h in headers_lower):
            return 'tetrazolio'
        elif any('sanitario' in h for h in headers_lower):
            return 'sanitario'
        elif any('pms' in h for h in headers_lower):
            return 'pms'
        
        return None
    except Exception as e:
        logger.warning(f"Error detectando tipo de análisis: {e}")
        return None

def detectar_tabla_por_columnas(session, headers: List[str], tipo_analisis: Optional[str] = None) -> Optional[str]:
    """Detecta la tabla basándose en las columnas del archivo."""
    if not headers or len(headers) < 3:
        return None
    
    headers_lower = [h.lower() for h in headers if h]
    
    # Buscar en los modelos disponibles
    mejor_coincidencia = None
    mejor_puntuacion = 0
    
    for tabla_nombre, model in MODELS.items():
        try:
            # Obtener columnas del modelo
            columnas_modelo = [c.name.lower() for c in model.__table__.columns]
            
            # Calcular coincidencias
            coincidencias = sum(1 for h in headers_lower if h in columnas_modelo)
            puntuacion = coincidencias / len(headers_lower) if headers_lower else 0
            
            if puntuacion > mejor_puntuacion and puntuacion >= 0.3:  # Al menos 30% de coincidencia
                mejor_puntuacion = puntuacion
                mejor_coincidencia = tabla_nombre
        except Exception as e:
            logger.debug(f"Error verificando tabla {tabla_nombre}: {e}")
            continue
    
    return mejor_coincidencia

# ================================
# MÓDULO: SINCRONIZACIÓN DE SECUENCIAS
# ================================
def asegurar_autoincrementos(engine):
    """Asegura que las secuencias de autoincremento estén sincronizadas."""
    try:
        with engine.connect() as conn:
            # Obtener todas las tablas con columnas serial/bigserial
            query = text("""
                SELECT 
                    t.table_name,
                    c.column_name,
                    c.data_type
                FROM information_schema.tables t
                JOIN information_schema.columns c ON t.table_name = c.table_name
                WHERE t.table_schema = 'public'
                    AND t.table_type = 'BASE TABLE'
                    AND c.data_type IN ('integer', 'bigint')
                    AND c.column_default LIKE 'nextval%'
                ORDER BY t.table_name, c.column_name
            """)
            
            result = conn.execute(query)
            for row in result:
                tabla = row[0]
                columna = row[1]
                
                # Obtener el valor máximo actual
                query_max = text(f"SELECT COALESCE(MAX({columna}), 0) FROM {tabla}")
                max_val = conn.execute(query_max).scalar()
                
                # Obtener el nombre de la secuencia
                query_seq = text(f"""
                    SELECT pg_get_serial_sequence('{tabla}', '{columna}')
                """)
                seq_name = conn.execute(query_seq).scalar()
                
                if seq_name:
                    # Sincronizar la secuencia
                    query_sync = text(f"SELECT setval('{seq_name}', {max_val}, true)")
                    conn.execute(query_sync)
                    conn.commit()
                    logger.debug(f"Secuencia {seq_name} sincronizada a {max_val}")
    except Exception as e:
        logger.warning(f"Error sincronizando secuencias: {e}")

# ================================
# MÓDULO: IMPORTACIÓN DE ARCHIVOS
# ================================
def convertir_valor_segun_tipo(valor: Any, tipo_columna) -> Any:
    """
    Convierte un valor según el tipo de columna de la base de datos.
    
    Args:
        valor: Valor a convertir
        tipo_columna: Tipo de columna de SQLAlchemy
    
    Returns:
        Valor convertido al tipo correcto
    """
    if valor is None:
        return None
    
    # Obtener el tipo Python del tipo SQLAlchemy
    tipo_python = tipo_columna.python_type if hasattr(tipo_columna, 'python_type') else type(valor)
    
    # Verificar también el nombre del tipo SQLAlchemy para detectar booleanos
    tipo_nombre = None
    if hasattr(tipo_columna, '__class__'):
        tipo_nombre = tipo_columna.__class__.__name__.lower()
    elif hasattr(tipo_columna, 'name'):
        tipo_nombre = str(tipo_columna.name).lower()
    
    # Verificar si es un tipo Boolean de SQLAlchemy
    es_booleano_sqlalchemy = False
    try:
        from sqlalchemy import Boolean
        if isinstance(tipo_columna, Boolean):
            es_booleano_sqlalchemy = True
    except:
        pass
    
    # Si ya es del tipo correcto, retornarlo
    if isinstance(valor, tipo_python):
        return valor
    
    # Convertir según el tipo
    try:
        # Booleanos: convertir strings 'true', 'false', '1', '0', etc.
        # Verificar tanto el tipo Python como el nombre del tipo SQLAlchemy
        es_booleano = (tipo_python == bool or 
                      es_booleano_sqlalchemy or
                      (tipo_nombre and 'bool' in tipo_nombre) or
                      (hasattr(tipo_columna, 'python_type') and tipo_columna.python_type == bool))
        
        if es_booleano:
            if isinstance(valor, bool):
                return valor
            if isinstance(valor, str):
                valor_str = valor.lower().strip()
                if valor_str in ('true', '1', 'yes', 'si', 'sí', 't', 'y', 'verdadero', 'v'):
                    return True
                elif valor_str in ('false', '0', 'no', 'n', 'f', 'falso'):
                    return False
                else:
                    # Si no se puede convertir, retornar False por defecto
                    logger.warning(f"No se pudo convertir '{valor}' a booleano, usando False")
                    return False
            if isinstance(valor, (int, float)):
                return bool(valor)
            # Si es None o vacío, retornar False por defecto para booleanos
            return False
        
        # Enteros
        elif tipo_python == int:
            if isinstance(valor, str):
                # Intentar convertir string a int
                try:
                    # Remover espacios y caracteres no numéricos
                    valor_limpio = valor.strip()
                    if valor_limpio:
                        return int(float(valor_limpio))  # Usar float primero para manejar "1.0"
                except (ValueError, TypeError):
                    logger.warning(f"No se pudo convertir '{valor}' a entero")
                    return None
            return int(valor)
        
        # Flotantes
        elif tipo_python == float:
            if isinstance(valor, str):
                try:
                    valor_limpio = valor.strip()
                    if valor_limpio:
                        return float(valor_limpio)
                except (ValueError, TypeError):
                    logger.warning(f"No se pudo convertir '{valor}' a flotante")
                    return None
            return float(valor)
        
        # Strings: asegurar que sea string
        elif tipo_python == str:
            return str(valor)
        
        # Fechas y timestamps
        elif hasattr(tipo_python, '__name__') and 'date' in tipo_python.__name__.lower():
            if isinstance(valor, str):
                # Intentar parsear fecha
                try:
                    from datetime import datetime
                    # Intentar varios formatos comunes
                    formatos = ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y-%m-%d %H:%M:%S']
                    for fmt in formatos:
                        try:
                            return datetime.strptime(valor.strip(), fmt)
                        except ValueError:
                            continue
                    logger.warning(f"No se pudo parsear fecha '{valor}'")
                    return None
                except Exception as e:
                    logger.warning(f"Error parseando fecha '{valor}': {e}")
                    return None
            return valor
        
        # Por defecto, retornar el valor tal cual
        return valor
        
    except Exception as e:
        logger.warning(f"Error convirtiendo valor '{valor}' a tipo {tipo_python}: {e}")
        return valor

def import_one_file(session, model, ruta_archivo: str, formato: str, upsert: bool = False, keep_ids: bool = False) -> Tuple[int, int]:
    """
    Importa un archivo Excel/CSV a una tabla.
    
    Args:
        session: Sesión de SQLAlchemy
        model: Modelo de la tabla destino
        ruta_archivo: Ruta al archivo a importar
        formato: Formato del archivo ('xlsx' o 'csv')
        upsert: Si es True, actualiza registros existentes
        keep_ids: Si es True, mantiene los IDs del archivo
    
    Returns:
        Tuple[int, int]: (insertados, actualizados)
    """
    inserted = 0
    updated = 0
    
    try:
        # Leer archivo
        if formato == 'xlsx':
            headers, rows = read_rows_from_xlsx(ruta_archivo)
        else:
            headers, rows = read_rows_from_csv(ruta_archivo)
        
        if not headers or not rows:
            logger.warning("Archivo vacío o sin datos")
            return 0, 0
        
        # Normalizar headers
        headers = normalize_header_names(headers)
        
        # Obtener columnas del modelo con sus tipos
        columnas_modelo = {c.name.lower(): c for c in model.__table__.columns}
        
        # Mapear headers a columnas del modelo (incluyendo el tipo)
        mapeo_columnas = {}
        tipos_columnas = {}  # Almacenar tipos de columnas
        for header in headers:
            if header.lower() in columnas_modelo:
                columna_modelo = columnas_modelo[header.lower()]
                nombre_columna = columna_modelo.name
                mapeo_columnas[header] = nombre_columna
                tipos_columnas[nombre_columna] = columna_modelo.type  # Guardar el tipo
                # Log de depuración para columnas booleanas
                tipo_col = columna_modelo.type
                es_booleano = False
                if hasattr(tipo_col, 'python_type') and tipo_col.python_type == bool:
                    es_booleano = True
                    logger.debug(f"Columna booleana detectada: '{nombre_columna}' (tipo: {tipo_col})")
                elif hasattr(tipo_col, '__class__'):
                    tipo_nombre = tipo_col.__class__.__name__.lower()
                    if 'bool' in tipo_nombre:
                        es_booleano = True
                        logger.debug(f"Columna booleana detectada por nombre: '{nombre_columna}' (tipo: {tipo_nombre})")
                # Verificar también el tipo de datos de PostgreSQL
                if hasattr(tipo_col, 'type_affinity'):
                    try:
                        from sqlalchemy import Boolean
                        if isinstance(tipo_col, Boolean):
                            es_booleano = True
                            logger.debug(f"Columna booleana detectada por tipo SQLAlchemy: '{nombre_columna}'")
                    except:
                        pass
        
        if not mapeo_columnas:
            logger.error("No se encontraron columnas coincidentes")
            return 0, 0
        
        # Procesar filas y preparar datos para bulk insert
        filas_datos = []
        for fila in rows:
            try:
                datos = {}
                for i, valor in enumerate(fila):
                    if i < len(headers) and headers[i] in mapeo_columnas:
                        columna = mapeo_columnas[headers[i]]
                        # Convertir valor según el tipo de columna
                        tipo_columna = tipos_columnas.get(columna)
                        if tipo_columna:
                            try:
                                valor_convertido = convertir_valor_segun_tipo(valor, tipo_columna)
                                # Log de depuración para booleanos
                                if hasattr(tipo_columna, 'python_type') and tipo_columna.python_type == bool:
                                    logger.debug(f"Columna '{columna}': '{valor}' ({type(valor).__name__}) -> {valor_convertido} ({type(valor_convertido).__name__})")
                            except Exception as e:
                                logger.warning(f"Error convirtiendo valor '{valor}' para columna '{columna}': {e}")
                                valor_convertido = valor
                        else:
                            valor_convertido = valor
                        datos[columna] = valor_convertido
                
                if datos:
                    filas_datos.append(datos)
            except Exception as e:
                logger.warning(f"Error procesando fila: {e}")
                continue
        
        # Usar SQLAlchemy Core directamente pero con el mapper
        # Obtener la tabla de forma segura usando caché para evitar configurar relaciones
        from sqlalchemy import insert, select, update, MetaData
        
        if filas_datos:
            try:
                # Obtener nombre de tabla sin acceder al mapper
                tabla_nombre = obtener_nombre_tabla_seguro(model)
                
                # Usar caché para obtener la tabla sin disparar configuración del mapper
                if tabla_nombre not in _TABLES_CACHE:
                    # Obtener tabla directamente desde la metadata reflejada
                    # Esto evita acceder al mapper que puede disparar configuración de relaciones
                    metadata = MetaData()
                    metadata.reflect(bind=session.bind, only=[tabla_nombre])
                    _TABLES_CACHE[tabla_nombre] = metadata.tables[tabla_nombre]
                
                table = _TABLES_CACHE[tabla_nombre]
                
                if upsert:
                    # Para upsert, necesitamos procesar individualmente
                    for datos in filas_datos:
                        try:
                            # Buscar clave primaria
                            pk_column = None
                            for col in table.primary_key.columns:
                                if col.name in datos:
                                    pk_column = col.name
                                    break
                            
                            if pk_column and datos.get(pk_column):
                                # Verificar si existe usando select directo (Core, no ORM)
                                stmt_select = select(table).where(
                                    table.columns[pk_column] == datos[pk_column]
                                )
                                result = session.execute(stmt_select).first()
                                
                                if result:
                                    # Actualizar usando update directo (Core, no ORM)
                                    stmt_update = update(table).where(
                                        table.columns[pk_column] == datos[pk_column]
                                    ).values(**datos)
                                    session.execute(stmt_update)
                                    updated += 1
                                else:
                                    # Insertar usando insert directo (Core, no ORM)
                                    stmt_insert = insert(table).values(**datos)
                                    session.execute(stmt_insert)
                                    inserted += 1
                            else:
                                # No hay PK, insertar directamente
                                stmt_insert = insert(table).values(**datos)
                                session.execute(stmt_insert)
                                inserted += 1
                        except Exception as e:
                            logger.warning(f"Error procesando fila (upsert): {e}")
                            continue
                else:
                    # Usar insert() statements directamente (Core, no ORM)
                    # Insertar en lotes para mejor rendimiento
                    batch_size = 1000
                    for i in range(0, len(filas_datos), batch_size):
                        batch = filas_datos[i:i + batch_size]
                        stmt = insert(table).values(batch)
                        result = session.execute(stmt)
                        inserted += len(batch)
                
                session.commit()
                logger.info(f"Importación completada: {inserted} insertados, {updated} actualizados")
            except Exception as e:
                logger.error(f"Error en insert: {e}")
                session.rollback()
                raise
        else:
            logger.warning("No hay datos para importar")
        
    except Exception as e:
        logger.error(f"Error importando archivo: {e}")
        session.rollback()
        raise
    
    return inserted, updated
