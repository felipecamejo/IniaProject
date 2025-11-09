import os
import csv
import argparse
import logging
from typing import Any, Dict, Iterable, List, Optional, Tuple
from datetime import datetime, date
from urllib.parse import quote_plus

# Dependencias opcionales para Excel
try:
    from openpyxl import load_workbook
    OPENPYXL_AVAILABLE = True
except Exception:
    OPENPYXL_AVAILABLE = False

# Importaciones SQLAlchemy
try:
    from sqlalchemy import create_engine, text, Table
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.automap import automap_base
except ModuleNotFoundError:
    print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
    raise

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
        Base.prepare(autoload_with=_engine)
        logger.info(f"Modelos generados automáticamente: {len(Base.classes)} tablas")
    except Exception as e:
        logger.error(f"Error inicializando automap: {e}")
        raise
    
    MODELS.clear()
    for class_name in dir(Base.classes):
        if not class_name.startswith('_'):
            cls = getattr(Base.classes, class_name)
            if hasattr(cls, '__tablename__'):
                tabla_nombre = cls.__tablename__.lower()
                MODELS[tabla_nombre] = cls
                MODELS[class_name.lower()] = cls
    
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

# ================================
# MÓDULO: GESTIÓN DE SECUENCIAS
# ================================
def asegurar_autoincrementos(engine):
    """Asegura que las columnas ID tengan default nextval(...) en PostgreSQL."""
    try:
        with engine.begin() as conn:
            # Obtener todas las tablas con columnas de tipo serial o bigserial
            query = text("""
                SELECT table_name, column_name
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND column_default LIKE 'nextval%'
                ORDER BY table_name, ordinal_position
            """)
            result = conn.execute(query).fetchall()
            
            for tabla, columna in result:
                # Obtener nombre de la secuencia
                seq_query = text("SELECT pg_get_serial_sequence(:full_table, :columna)")
                seq_row = conn.execute(seq_query, {"full_table": f"public.{tabla}", "columna": columna}).fetchone()
                seq_name = seq_row[0] if seq_row and seq_row[0] else f"public.{tabla}_{columna}_seq"
                
                # Sincronizar la secuencia con el valor actual (max(id))
                max_query = text(f"SELECT COALESCE(MAX({columna}), 0) FROM {tabla}")
                max_row = conn.execute(max_query).fetchone()
                max_id = max_row[0] if max_row else 0
                
                if int(max_id) == 0:
                    conn.execute(text(f"SELECT setval('{seq_name}', 1, false);"))
                else:
                    conn.execute(text(f"SELECT setval('{seq_name}', :val, true);"), {"val": int(max_id)})
            
            logger.info("Secuencias sincronizadas correctamente")
    except Exception as e:
        logger.warning(f"Error sincronizando secuencias: {e}")


# MODELS se crea dinámicamente en inicializar_automap()


def log_info(message: str):
    logger.info(message)


def log_error(message: str):
    logger.error(message)


def detect_format_from_path(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext in (".xlsx", ".xlsm"):
        return "xlsx"
    if ext == ".csv":
        return "csv"
    return ""  # desconocido


def read_rows_from_csv(path: str) -> Tuple[List[str], List[List[str]]]:
    with open(path, mode="r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        rows = list(reader)
        if not rows:
            return [], []
        headers = rows[0]
        data_rows = rows[1:]
        return headers, data_rows


def read_rows_from_xlsx(path: str) -> Tuple[List[str], List[List[Any]]]:
    if not OPENPYXL_AVAILABLE:
        raise RuntimeError("openpyxl no está instalado; no se puede leer XLSX")
    wb = load_workbook(path, data_only=True, read_only=True)
    ws = wb.active
    rows_iter = ws.iter_rows(values_only=True)
    try:
        headers = [str(h).strip() if h is not None else "" for h in next(rows_iter)]
    except StopIteration:
        return [], []
    data_rows: List[List[Any]] = []
    for row in rows_iter:
        data_rows.append(list(row))
    return headers, data_rows


def normalize_header_names(headers: Iterable[str]) -> List[str]:
    norm = []
    for h in headers:
        h_str = (h or "").strip()
        norm.append(h_str)
    return norm


def get_model_columns(model) -> Dict[str, Any]:
    return {c.name: c for c in model.__table__.columns}


def verificar_estructura_tabla(session, tabla_nombre: str) -> list:
    """Verifica la estructura real de una tabla en la base de datos"""
    try:
        query = text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = :tabla
            ORDER BY ordinal_position
        """)
        result = session.execute(query, {"tabla": tabla_nombre}).fetchall()
        columnas = [row[0] for row in result]
        
        # Log detallado para debugging
        log_info(f"Estructura real de {tabla_nombre}: {columnas}")
        return columnas
    except Exception as e:
        log_error(f"Error verificando estructura de {tabla_nombre}: {e}")
        return []


def inspeccionar_todas_las_tablas(session) -> dict:
    """Inspecciona la estructura de todas las tablas del sistema"""
    try:
        query = text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        result = session.execute(query).fetchall()
        tablas = [row[0] for row in result]
        
        log_info(f"Tablas encontradas en la BD: {tablas}")
        
        estructuras = {}
        for tabla in tablas:
            estructuras[tabla] = verificar_estructura_tabla(session, tabla)
        
        return estructuras
    except Exception as e:
        log_error(f"Error inspeccionando tablas: {e}")
        return {}


def parse_to_column_type(value: Any, column) -> Any:
    if value is None:
        return None
    if isinstance(value, str):
        raw = value.strip()
        if raw == "":
            return None
    else:
        raw = value

    # Detección de tipo por columna
    col_type = column.type.__class__.__name__.lower()

    # Booleans
    if "boolean" in col_type:
        if isinstance(raw, bool):
            return raw
        if isinstance(raw, (int, float)):
            return bool(raw)
        s = str(raw).strip().lower()
        if s in ("true", "t", "1", "yes", "y", "si", "sí"):
            return True
        if s in ("false", "f", "0", "no", "n"):
            return False
        return None

    # Integer-like
    if any(k in col_type for k in ("integer", "bigint", "smallint")):
        try:
            if isinstance(raw, float):
                return int(raw)
            return int(str(raw))
        except Exception:
            return None

    # Float / Numeric
    if any(k in col_type for k in ("float", "numeric", "decimal")):
        try:
            return float(str(raw).replace(",", "."))
        except Exception:
            return None

    # Date / DateTime
    if any(k in col_type for k in ("date", "datetime", "timestamp")):
        if isinstance(raw, (datetime, date)):
            return raw
        s = str(raw).strip()
        for fmt in (
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%Y-%m-%d",
            "%d/%m/%Y %H:%M:%S",
            "%d/%m/%Y",
        ):
            try:
                dt = datetime.strptime(s, fmt)
                return dt
            except Exception:
                pass
        try:
            return datetime.fromisoformat(s)
        except Exception:
            return None

    # Text/String fallback
    return str(raw)


def build_row_payload(headers: List[str], values: List[Any], model, session=None) -> Dict[str, Any]:
    cols = get_model_columns(model)
    payload: Dict[str, Any] = {}
    
    # Verificar estructura real de la tabla si se proporciona session
    columnas_reales = []
    if session:
        columnas_reales = verificar_estructura_tabla(session, model.__tablename__)
    
    for i, h in enumerate(headers):
        if h not in cols:
            continue
        
        # Si tenemos información de la estructura real, verificar que la columna existe
        if columnas_reales and h not in columnas_reales:
            log_error(f"Columna {h} no existe en tabla {model.__tablename__}, omitiendo")
            continue
            
        col = cols[h]
        v = values[i] if i < len(values) else None
        payload[h] = parse_to_column_type(v, col)
    return payload


def get_primary_key_ordered_values(model, data: Dict[str, Any]) -> Optional[Any]:
    pk_cols = list(model.__mapper__.primary_key)
    if len(pk_cols) == 1:
        name = pk_cols[0].name
        if name in data and data[name] is not None:
            return data[name]
        return None
    # PK compuesta
    values = []
    for c in pk_cols:
        name = c.name
        if name not in data or data[name] is None:
            return None
        values.append(data[name])
    return tuple(values)


def strip_auto_increment_if_needed(model, data: Dict[str, Any], keep_ids: bool) -> Dict[str, Any]:
    if keep_ids:
        return data
    # Si PK es autoincremental, quitamos su valor para que lo genere la BD
    pk_cols = list(model.__mapper__.primary_key)
    if len(pk_cols) == 1:
        name = pk_cols[0].name
        # Para tablas de relación con PK compuesta NO removemos
        if name in data:
            data = dict(data)
            data.pop(name, None)
    return data


def upsert_rows(session, model, rows: List[Dict[str, Any]], keep_ids: bool, batch_size: int = 200) -> Tuple[int, int]:
    inserted = 0
    updated = 0
    pk_is_composite = len(list(model.__mapper__.primary_key)) > 1
    batch: List[Dict[str, Any]] = []

    def flush_batch(b: List[Dict[str, Any]]):
        nonlocal inserted, updated
        if not b:
            return
        for payload in b:
            identity = get_primary_key_ordered_values(model, payload)
            if identity is not None:
                # Intentar actualizar existente
                instance = session.get(model, identity)
                if instance is not None:
                    # Actualizar todos los campos excepto PK
                    for k, v in payload.items():
                        if k in {c.name for c in model.__mapper__.primary_key}:
                            continue
                        setattr(instance, k, v)
                    updated += 1
                    continue
            # Insertar nuevo
            payload_insert = strip_auto_increment_if_needed(model, payload, keep_ids)
            instance = model(**payload_insert)
            session.add(instance)
            inserted += 1
        session.flush()
        session.commit()

    for row in rows:
        batch.append(row)
        if len(batch) >= batch_size:
            flush_batch(batch)
            batch = []
    flush_batch(batch)
    return inserted, updated


def insert_rows(session, model, rows: List[Dict[str, Any]], keep_ids: bool, batch_size: int = 500) -> int:
    inserted = 0
    batch: List[Any] = []

    def flush_batch(b: List[Any]):
        nonlocal inserted
        if not b:
            return
        session.add_all(b)
        session.flush()
        session.commit()
        inserted += len(b)

    for payload in rows:
        payload_insert = strip_auto_increment_if_needed(model, payload, keep_ids)
        batch.append(model(**payload_insert))
        if len(batch) >= batch_size:
            flush_batch(batch)
            batch = []
    flush_batch(batch)
    return inserted


def import_one_file(session, model, file_path: str, fmt: Optional[str], upsert: bool, keep_ids: bool) -> Tuple[int, int]:
    if not fmt:
        fmt = detect_format_from_path(file_path)
    if fmt not in ("csv", "xlsx"):
        raise RuntimeError(f"Formato no soportado para: {file_path}")

    if fmt == "csv":
        headers, data_rows = read_rows_from_csv(file_path)
    else:
        headers, data_rows = read_rows_from_xlsx(file_path)

    headers = normalize_header_names(headers)
    if not headers:
        log_error(f"Sin encabezados en {file_path}")
        return 0, 0
    
    # Verificar compatibilidad entre archivo y tabla
    columnas_reales = verificar_estructura_tabla(session, model.__tablename__)
    if columnas_reales:
        columnas_archivo = set(headers)
        columnas_tabla = set(columnas_reales)
        columnas_inexistentes = columnas_archivo - columnas_tabla
        columnas_disponibles = columnas_archivo & columnas_tabla
        
        if columnas_inexistentes:
            log_error(f"Columnas en archivo que no existen en tabla {model.__tablename__}: {columnas_inexistentes}")
        
        if not columnas_disponibles:
            log_error(f"No hay columnas compatibles entre archivo y tabla {model.__tablename__}")
            return 0, 0
        
        log_info(f"Importando columnas compatibles: {columnas_disponibles}")
    else:
        log_error(f"No se pudo verificar estructura de tabla {model.__tablename__}")
        return 0, 0

    # Construir payloads
    payloads: List[Dict[str, Any]] = []
    for values in data_rows:
        payload = build_row_payload(headers, values, model, session)
        if any(v is not None for v in payload.values()):
            payloads.append(payload)

    if not payloads:
        log_info(f"No hay filas válidas para importar en {file_path}")
        return 0, 0

    if upsert:
        ins, upd = upsert_rows(session, model, payloads, keep_ids)
        return ins, upd
    else:
        ins = insert_rows(session, model, payloads, keep_ids)
        return ins, 0


def discover_input_files(input_dir: str, tables: List[str]) -> List[Tuple[str, str]]:
    files: List[Tuple[str, str]] = []  # (tabla, ruta)
    for t in tables:
        base = t.lower()
        xlsx = os.path.join(input_dir, f"{base}.xlsx")
        csvp = os.path.join(input_dir, f"{base}.csv")
        if os.path.isfile(xlsx):
            files.append((t, xlsx))
        elif os.path.isfile(csvp):
            files.append((t, csvp))
    return files


def main():
    parser = argparse.ArgumentParser(description="Importa datos desde XLSX/CSV a tablas del proyecto INIA")
    src = parser.add_mutually_exclusive_group(required=True)
    src.add_argument("--file", dest="file", help="Ruta de archivo a importar (csv/xlsx)")
    src.add_argument("--in", dest="indir", help="Directorio que contiene archivos por tabla")
    src.add_argument("--inspect", action="store_true", help="Inspeccionar estructura de todas las tablas")
    parser.add_argument("--table", dest="table", help="Nombre de la tabla destino (requerido si --file)")
    parser.add_argument("--tables", nargs="*", default=[], help="Lista de tablas a importar (si --in)")
    parser.add_argument("--format", choices=["xlsx", "csv"], default=None, help="Forzar formato de archivo")
    parser.add_argument("--upsert", action="store_true", help="Actualizar si existe fila con misma PK")
    parser.add_argument("--keep-ids", action="store_true", help="Mantener IDs provistos; por defecto deja que DB genere")
    args = parser.parse_args()

    connection_string = build_connection_string()
    engine = create_engine(connection_string)
    
    # Inicializar automapeo antes de crear la sesión
    log_info("Inicializando automapeo de la base de datos...")
    inicializar_automap(engine)
    log_info(f"Modelos disponibles: {list(MODELS.keys())}")
    
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        if args.inspect:
            log_info("Inspeccionando estructura de todas las tablas...")
            estructuras_reales = inspeccionar_todas_las_tablas(session)
            
            # Comparar modelos con estructura real
            log_info("Comparando modelos con estructura real...")
            for name, model in MODELS.items():
                try:
                    columnas_modelo = [c.name for c in model.__table__.columns]
                    tabla_nombre = model.__tablename__.lower()
                    columnas_reales = estructuras_reales.get(tabla_nombre, [])
                    columnas_faltantes = set(columnas_modelo) - set(columnas_reales)
                    columnas_extra = set(columnas_reales) - set(columnas_modelo)
                    
                    if columnas_faltantes:
                        log_error(f"Modelo {name} tiene columnas que no existen en BD: {columnas_faltantes}")
                    if columnas_extra:
                        log_info(f"BD {name} tiene columnas no en modelo: {columnas_extra}")
                except Exception as e:
                    log_error(f"Error comparando modelo {name}: {e}")
            return

        log_info("Asegurando autoincrementos antes de importar...")
        try:
            asegurar_autoincrementos(engine)
        except Exception as e:
            log_error(f"No se pudieron asegurar autoincrementos previos: {e}")

        total_inserted = 0
        total_updated = 0

        if args.file:
            if not args.table:
                raise RuntimeError("--table es requerido cuando se usa --file")
            model = obtener_modelo(args.table)
            if not model:
                raise RuntimeError(f"Tabla desconocida: {args.table}")
            if not os.path.isfile(args.file):
                raise RuntimeError(f"No existe el archivo: {args.file}")
            log_info(f"Importando {args.file} hacia tabla {model.__tablename__}...")
            inserted, updated = import_one_file(session, model, args.file, args.format, args.upsert, args.keep_ids)
            total_inserted += inserted
            total_updated += updated
        else:
            tables = args.tables or list(MODELS.keys())
            files = discover_input_files(args.indir, tables)
            if not files:
                raise RuntimeError("No se encontraron archivos para importar en el directorio indicado")
            for tname, path in files:
                try:
                    model = obtener_modelo(tname)
                    if not model:
                        log_error(f"Tabla desconocida: {tname}")
                        continue
                    log_info(f"Importando {os.path.basename(path)} hacia tabla {model.__tablename__}...")
                    inserted, updated = import_one_file(session, model, path, args.format, args.upsert, args.keep_ids)
                    total_inserted += inserted
                    total_updated += updated
                except Exception as e:
                    log_error(f"Error importando {tname}: {e}")
                    continue

        # Sincronizar secuencias al final para evitar futuros conflictos de PK
        try:
            log_info("Sincronizando secuencias tras importación...")
            asegurar_autoincrementos(engine)
        except Exception as e:
            log_error(f"No se pudieron sincronizar secuencias al final: {e}")

        log_info(f"Importación finalizada. Insertados: {total_inserted}, Actualizados: {total_updated}")
    finally:
        session.close()


if __name__ == "__main__":
    logging.getLogger().setLevel(logging.INFO)
    main()


