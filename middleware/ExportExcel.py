import os
import csv
import argparse
import logging
from datetime import date, datetime
from urllib.parse import quote_plus

# Dependencia opcional para Excel
try:
    from openpyxl import Workbook
    from openpyxl.utils import get_column_letter
    import openpyxl.styles
    OPENPYXL_AVAILABLE = True
except Exception:
    OPENPYXL_AVAILABLE = False

# Importaciones SQLAlchemy
try:
    from sqlalchemy import create_engine, text, inspect
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.automap import automap_base
except ModuleNotFoundError:
    print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
    raise

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
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

# ================================
# MÓDULO: LOGGING Y UTILIDADES
# ================================
def log_ok(message: str):
    """Log de éxito."""
    logger.info(f"✓ {message}")

def log_fail(message: str):
    """Log de error."""
    logger.error(f"✗ {message}")

def log_step(message: str):
    """Log de paso."""
    logger.info(f"→ {message}")

def ensure_output_dir(path: str) -> str:
    """Asegura que el directorio de salida exista."""
    os.makedirs(path, exist_ok=True)
    return os.path.abspath(path)

def serialize_value(value):
    """Serializa un valor para exportación."""
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        return value.isoformat(sep=" ")
    if isinstance(value, bool):
        return "true" if value else "false"
    return value

# ================================
# MÓDULO: VALIDACIÓN DE COLUMNAS
# ================================
def verificar_estructura_tabla(session, tabla_nombre: str) -> list:
    """Verifica la estructura real de una tabla en la base de datos."""
    try:
        query = text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = :tabla
            ORDER BY ordinal_position
        """)
        result = session.execute(query, {"tabla": tabla_nombre}).fetchall()
        return [row[0] for row in result]
    except Exception as e:
        log_fail(f"Error verificando estructura de {tabla_nombre}: {e}")
        return []

def filtrar_columnas_analisis(columnas: list, tabla: str) -> list:
    """Filtra columnas para exportar solo datos de análisis, excluyendo campos administrativos."""
    campos_excluir = {
        'id', 'dosn_id', 'germinacion_id', 'pms_id', 'pureza_id', 
        'pureza_pnotatum_id', 'sanitario_id', 'tetrazolio_id', 'recibo_id',
        'activo', 'dosn_activo', 'germinacion_activo', 'pms_activo', 
        'pureza_activo', 'sanitario_activo', 'tetrazolio_activo', 'recibo_activo',
        'repetido', 'dosn_repetido', 'germinacion_repetido', 'pms_repetido',
        'pureza_repetido', 'sanitario_repetido', 'tetrazolio_repetido',
        'fecha_creacion', 'dosn_fecha_creacion', 'germinacion_fecha_creacion',
        'pms_fecha_creacion', 'pureza_fecha_creacion', 'sanitario_fechacreacion',
        'tetrazolio_fecha_creacion', 'fecha_repeticion', 'dosn_fecha_repeticion',
        'germinacion_fecha_repeticion', 'pms_fecha_repeticion', 'pureza_fecha_repeticion',
        'sanitario_fecharepeticion', 'tetrazolio_fecha_repeticion',
        'deposito_id'
    }
    
    columnas_analisis = [col for col in columnas if col not in campos_excluir]
    log_step(f"Filtrando {tabla}: {len(columnas)} → {len(columnas_analisis)} columnas de análisis")
    return columnas_analisis

def obtener_nombre_tabla(model) -> str:
    """Obtiene el nombre de la tabla de un modelo."""
    # Intentar diferentes métodos para obtener el nombre de la tabla
    try:
        if hasattr(model, '__tablename__'):
            return model.__tablename__
    except:
        pass
    
    try:
        if hasattr(model, '__table__') and hasattr(model.__table__, 'name'):
            return model.__table__.name
    except:
        pass
    
    # Si no se puede obtener, usar el nombre de la clase
    return model.__name__.lower()

def obtener_columnas_validas(session, model) -> tuple:
    """Obtiene y valida las columnas de una tabla. Retorna (columnas_validas, columnas_analisis)."""
    table = obtener_nombre_tabla(model)
    columns = [c.name for c in model.__table__.columns]
    
    columnas_reales = verificar_estructura_tabla(session, table)
    if not columnas_reales:
        log_fail(f"No se pudo verificar estructura de {table}")
        return [], []
    
    columnas_validas = [col for col in columns if col in columnas_reales]
    columnas_faltantes = set(columns) - set(columnas_validas)
    
    if columnas_faltantes:
        log_fail(f"Columnas faltantes en {table}: {columnas_faltantes}")
        log_step(f"Exportando solo columnas existentes: {columnas_validas}")
    
    if not columnas_validas:
        log_fail(f"No hay columnas válidas para exportar en {table}")
        return [], []
    
    columnas_analisis = filtrar_columnas_analisis(columnas_validas, table)
    return columnas_validas, columnas_analisis

def obtener_datos_tabla(session, tabla_nombre: str, columnas: list) -> list:
    """Obtiene los datos de una tabla usando SQL directo."""
    query = text(f"SELECT {', '.join(columnas)} FROM {tabla_nombre}")
    result = session.execute(query)
    return result.fetchall()

# ================================
# MÓDULO: FUNCIONES AUXILIARES EXCEL
# ================================
def crear_workbook_excel(titulo: str) -> tuple:
    """Crea un nuevo Workbook de Excel. Retorna (wb, ws)."""
    if not OPENPYXL_AVAILABLE:
        raise RuntimeError("openpyxl no está instalado")
    wb = Workbook()
    ws = wb.active
    ws.title = titulo[:31]  # límite de Excel
    return wb, ws

def escribir_encabezados_excel(ws, encabezados: list):
    """Escribe los encabezados en una hoja de Excel."""
    ws.append(encabezados)

def escribir_filas_excel(ws, rows: list):
    """Escribe las filas de datos en una hoja de Excel."""
    for row in rows:
        values = [serialize_value(value) for value in row]
        ws.append(values)

def ajustar_ancho_columnas_excel(ws, columnas: list, min_width: int = 10, max_width: int = 60):
    """Ajusta el ancho de las columnas en una hoja de Excel."""
    for idx, col_name in enumerate(columnas, start=1):
        max_len = max(
            (len(str(ws.cell(row=r, column=idx).value)) if ws.cell(row=r, column=idx).value is not None else 0)
            for r in range(1, ws.max_row + 1)
        )
        ws.column_dimensions[get_column_letter(idx)].width = min(max(min_width, max_len + 2), max_width)

def guardar_workbook_excel(wb, xlsx_path: str) -> bool:
    """Guarda un Workbook de Excel en un archivo."""
    try:
        wb.save(xlsx_path)
        return True
    except Exception as e:
        log_fail(f"Error guardando Excel: {e}")
        return False

# ================================
# MÓDULO: EXPORTACIÓN EXCEL GENÉRICA
# ================================
def export_analisis_generico(session, model, xlsx_path: str) -> str:
    """Exporta otros análisis con formato genérico."""
    try:
        if not OPENPYXL_AVAILABLE:
            log_fail("openpyxl no está instalado")
            return ""
        
        # Obtener y validar columnas
        columnas_validas, columnas_analisis = obtener_columnas_validas(session, model)
        if not columnas_analisis:
            return ""
        
        # Obtener nombre de tabla
        tabla_nombre = obtener_nombre_tabla(model)
        
        # Obtener datos
        rows = obtener_datos_tabla(session, tabla_nombre, columnas_analisis)
        
        # Crear workbook
        wb, ws = crear_workbook_excel(tabla_nombre)
        
        # Escribir datos
        escribir_encabezados_excel(ws, columnas_analisis)
        escribir_filas_excel(ws, rows)
        
        # Ajustar columnas
        ajustar_ancho_columnas_excel(ws, columnas_analisis)
        
        # Guardar
        if guardar_workbook_excel(wb, xlsx_path):
            log_ok(f"Archivo generado: {xlsx_path} ({len(rows)} filas)")
            return xlsx_path
        return ""
    except Exception as e:
        tabla_nombre = obtener_nombre_tabla(model)
        log_fail(f"No se pudo exportar {tabla_nombre} a Excel: {e}")
        return ""

def export_table_xlsx(session, model, output_dir: str) -> str:
    """Exporta una tabla a formato Excel."""
    table = obtener_nombre_tabla(model)
    xlsx_path = os.path.join(output_dir, f"{table}.xlsx")
    log_step(f"➡️ Exportando {table} a Excel...")
    
    try:
        if not OPENPYXL_AVAILABLE:
            log_fail("openpyxl no está instalado")
            return ""
        
        # Usar formato genérico para todos los análisis
        return export_analisis_generico(session, model, xlsx_path)
    except Exception as e:
        log_fail(f"No se pudo exportar {table} a Excel: {e}")
        return ""

# ================================
# MÓDULO: EXPORTACIÓN PRINCIPAL
# ================================
def export_selected_tables(tables: list, output_dir: str, fmt: str) -> None:
    """Exporta las tablas seleccionadas a Excel."""
    try:
        engine = obtener_engine()
        
        # Inicializar automapeo antes de crear la sesión
        log_step("Inicializando automapeo de la base de datos...")
        inicializar_automap(engine)
        log_step(f"Modelos disponibles: {list(MODELS.keys())}")
        
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Probar la conexión
        session.execute(text("SELECT 1"))
        
        try:
            out_dir = ensure_output_dir(output_dir)
            exported = 0
            
            # Si no se especifican tablas, usar todas las disponibles
            if not tables:
                tables = list(MODELS.keys())
            
            for name in tables:
                try:
                    model = obtener_modelo(name)
                    if not model:
                        log_fail(f"Tabla desconocida: {name}")
                        continue
                    
                    if fmt == "xlsx":
                        path = export_table_xlsx(session, model, out_dir)
                    else:
                        log_fail(f"Formato {fmt} no soportado. Solo se soporta xlsx.")
                        continue
                    
                    if path:
                        exported += 1
                except Exception as e:
                    log_fail(f"Error exportando tabla {name}: {e}")
                    continue
            
            log_ok(f"Tablas exportadas correctamente: {exported}/{len(tables)}")
            
            if exported == 0:
                raise Exception("No se pudo exportar ninguna tabla")
                
        finally:
            session.close()
    except Exception as e:
        log_fail(f"Error en export_selected_tables: {e}")
        raise

# ================================
# MÓDULO: FUNCIÓN PRINCIPAL
# ================================
def main():
    """Función principal del script."""
    parser = argparse.ArgumentParser(description="Exporta análisis del proyecto INIA a Excel")
    parser.add_argument(
        "--tables",
        nargs="*",
        default=[],
        help="Lista de análisis a exportar. Por defecto exporta todos los análisis disponibles"
    )
    parser.add_argument(
        "--out",
        default=os.path.join(os.path.dirname(__file__), "exports"),
        help="Directorio de salida para los archivos"
    )
    parser.add_argument(
        "--format",
        choices=["xlsx"],
        default="xlsx",
        help="Formato de salida (xlsx por defecto)"
    )
    args = parser.parse_args()

    log_step(f"Iniciando exportación de análisis en formato {args.format}…")
    log_step("Se exportarán datos de análisis (excluyendo IDs, estados activos, fechas de control)")
    export_selected_tables(args.tables, args.out, args.format)

if __name__ == "__main__":
    logging.getLogger().setLevel(logging.INFO)
    main()
