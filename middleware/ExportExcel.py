import os
import csv
import argparse
import logging
from datetime import date, datetime
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
        # Si falla la instalación silenciosa, intentar con salida
        print("Intentando instalar SQLAlchemy...")
        verificar_e_instalar('sqlalchemy', 'SQLAlchemy', silent=False)

# Importaciones SQLAlchemy
try:
    from sqlalchemy import create_engine, text, inspect
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.automap import automap_base
except ModuleNotFoundError:
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('ExportExcel', silent=False):
            # Reintentar importación después de instalar
            from sqlalchemy import create_engine, text, inspect
            from sqlalchemy.orm import sessionmaker
            from sqlalchemy.ext.automap import automap_base
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install -r requirements.txt")
            raise
    else:
        print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
        raise

# Dependencia opcional para Excel
try:
    from openpyxl import Workbook
    from openpyxl.utils import get_column_letter
    from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
    import openpyxl.styles
    OPENPYXL_AVAILABLE = True
except Exception:
    OPENPYXL_AVAILABLE = False
    # Intentar instalar openpyxl si el módulo de instalación está disponible
    if INSTALL_DEPS_AVAILABLE:
        if verificar_e_instalar('openpyxl', 'openpyxl', silent=False):
            try:
                from openpyxl import Workbook
                from openpyxl.utils import get_column_letter
                from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
                import openpyxl.styles
                OPENPYXL_AVAILABLE = True
            except Exception:
                OPENPYXL_AVAILABLE = False

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
        # Deshabilitar generación automática de relaciones para evitar conflictos de backref
        # Solo necesitamos las columnas para la exportación, no las relaciones
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

def tiene_primary_key(session, tabla_nombre: str) -> bool:
    """Verifica si una tabla tiene Primary Key."""
    try:
        query = text("""
            SELECT COUNT(*)
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
                AND tc.table_schema = ccu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_schema = 'public'
                AND tc.table_name = :tabla
        """)
        result = session.execute(query, {"tabla": tabla_nombre}).fetchone()
        return result[0] > 0 if result else False
    except Exception as e:
        log_fail(f"Error verificando PK de {tabla_nombre}: {e}")
        return False

def obtener_tablas_sin_pk(session) -> list:
    """Obtiene todas las tablas que no tienen Primary Key."""
    try:
        query = text("""
            SELECT t.table_name
            FROM information_schema.tables t
            WHERE t.table_schema = 'public'
                AND t.table_type = 'BASE TABLE'
                AND NOT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints tc
                    WHERE tc.table_schema = 'public'
                        AND tc.table_name = t.table_name
                        AND tc.constraint_type = 'PRIMARY KEY'
                )
            ORDER BY t.table_name
        """)
        result = session.execute(query).fetchall()
        tablas_sin_pk = [row[0] for row in result]
        if tablas_sin_pk:
            log_step(f"Tablas sin PK encontradas: {len(tablas_sin_pk)} - {', '.join(tablas_sin_pk)}")
        return tablas_sin_pk
    except Exception as e:
        log_fail(f"Error obteniendo tablas sin PK: {e}")
        return []

def obtener_tablas_relacionadas(session, tabla_principal: str) -> list:
    """Obtiene tablas relacionadas (sin PK) que están vinculadas a una tabla principal mediante Foreign Keys."""
    try:
        # Usar referential_constraints para obtener las tablas referenciadas correctamente
        # En PostgreSQL, usamos constraint_column_usage para obtener la tabla referenciada
        query = text("""
            SELECT DISTINCT tc.table_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.referential_constraints rc
                ON tc.constraint_name = rc.constraint_name
                AND tc.table_schema = rc.constraint_schema
            JOIN information_schema.constraint_column_usage ccu
                ON rc.unique_constraint_name = ccu.constraint_name
                AND rc.unique_constraint_schema = ccu.constraint_schema
            WHERE tc.table_schema = 'public'
                AND tc.constraint_type = 'FOREIGN KEY'
                AND rc.unique_constraint_schema = 'public'
                AND ccu.table_name = :tabla_principal
                AND tc.table_name != :tabla_principal
                AND NOT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints pk_tc
                    WHERE pk_tc.table_schema = 'public'
                        AND pk_tc.table_name = tc.table_name
                        AND pk_tc.constraint_type = 'PRIMARY KEY'
                )
            ORDER BY tc.table_name
        """)
        result = session.execute(query, {"tabla_principal": tabla_principal}).fetchall()
        tablas_relacionadas = [row[0] for row in result]
        if tablas_relacionadas:
            log_step(f"Tablas relacionadas con {tabla_principal} (sin PK): {len(tablas_relacionadas)} - {', '.join(tablas_relacionadas)}")
        return tablas_relacionadas
    except Exception as e:
        log_fail(f"Error obteniendo tablas relacionadas con {tabla_principal}: {e}")
        # Hacer rollback para que la sesión pueda continuar
        try:
            session.rollback()
        except:
            pass
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

def obtener_estilo_encabezado():
    """Retorna el estilo para los encabezados."""
    if not OPENPYXL_AVAILABLE:
        return None
    
    # Color de fondo azul claro profesional
    fill = PatternFill(
        start_color="4472C4",  # Azul corporativo
        end_color="4472C4",
        fill_type="solid"
    )
    
    # Fuente en negrita, blanca, tamaño 11
    font = Font(
        bold=True,
        size=11,
        color="FFFFFF"  # Blanco
    )
    
    # Bordes medianos negros
    border = Border(
        left=Side(style='medium', color='000000'),
        right=Side(style='medium', color='000000'),
        top=Side(style='medium', color='000000'),
        bottom=Side(style='medium', color='000000')
    )
    
    # Alineación centrada
    alignment = Alignment(
        horizontal='center',
        vertical='center',
        wrap_text=True
    )
    
    return {
        'fill': fill,
        'font': font,
        'border': border,
        'alignment': alignment
    }

def obtener_estilo_datos():
    """Retorna el estilo para las celdas de datos."""
    if not OPENPYXL_AVAILABLE:
        return None
    
    # Bordes delgados negros
    border = Border(
        left=Side(style='thin', color='000000'),
        right=Side(style='thin', color='000000'),
        top=Side(style='thin', color='000000'),
        bottom=Side(style='thin', color='000000')
    )
    
    # Alineación vertical centrada
    alignment = Alignment(
        vertical='center',
        wrap_text=True
    )
    
    # Fuente normal
    font = Font(size=11)
    
    return {
        'border': border,
        'alignment': alignment,
        'font': font
    }

def escribir_encabezados_excel(ws, encabezados: list):
    """Escribe los encabezados en una hoja de Excel con formato profesional."""
    ws.append(encabezados)
    
    if not OPENPYXL_AVAILABLE:
        return
    
    estilo = obtener_estilo_encabezado()
    if estilo:
        # Aplicar estilo a cada celda del encabezado
        for col_idx, header in enumerate(encabezados, start=1):
            cell = ws.cell(row=1, column=col_idx)
            cell.fill = estilo['fill']
            cell.font = estilo['font']
            cell.border = estilo['border']
            cell.alignment = estilo['alignment']
        
        # Ajustar altura de la fila de encabezado
        ws.row_dimensions[1].height = 25

def escribir_filas_excel(ws, rows: list):
    """Escribe las filas de datos en una hoja de Excel con formato profesional."""
    if not OPENPYXL_AVAILABLE:
        for row in rows:
            values = [serialize_value(value) for value in row]
            ws.append(values)
        return
    
    estilo = obtener_estilo_datos()
    start_row = ws.max_row + 1
    
    for row_num, row in enumerate(rows, start=0):
        # Guardar valores originales para determinar tipo
        original_values = list(row)
        values = [serialize_value(value) for value in row]
        ws.append(values)
        row_idx = start_row + row_num
        
        if estilo:
            # Aplicar estilo a cada celda de la fila
            for col_idx, (original_value, serialized_value) in enumerate(zip(original_values, values), start=1):
                cell = ws.cell(row=row_idx, column=col_idx)
                cell.border = estilo['border']
                cell.font = estilo['font']
                
                # Alineación horizontal según el tipo de dato original
                if isinstance(original_value, (int, float)):
                    cell.alignment = Alignment(
                        horizontal='right',
                        vertical='center',
                        wrap_text=True
                    )
                elif isinstance(original_value, (datetime, date)):
                    cell.alignment = Alignment(
                        horizontal='center',
                        vertical='center',
                        wrap_text=True
                    )
                else:
                    cell.alignment = Alignment(
                        horizontal='left',
                        vertical='center',
                        wrap_text=True
                    )
        
        # Altura de fila estándar
        ws.row_dimensions[row_idx].height = 18

def ajustar_ancho_columnas_excel(ws, columnas: list, min_width: int = 12, max_width: int = 50):
    """Ajusta el ancho de las columnas en una hoja de Excel."""
    for idx, col_name in enumerate(columnas, start=1):
        # Calcular el ancho basado en el contenido
        max_len = len(str(col_name))  # Empezar con el ancho del encabezado
        
        # Revisar todas las filas de datos
        for r in range(1, ws.max_row + 1):
            cell_value = ws.cell(row=r, column=idx).value
            if cell_value is not None:
                cell_len = len(str(cell_value))
                max_len = max(max_len, cell_len)
        
        # Ajustar ancho con un poco de padding
        calculated_width = min(max(min_width, max_len + 3), max_width)
        ws.column_dimensions[get_column_letter(idx)].width = calculated_width

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
    # Normalizar nombre de archivo: siempre lowercase para evitar problemas con alias
    table_normalized = table.lower()
    xlsx_path = os.path.join(output_dir, f"{table_normalized}.xlsx")
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
def export_selected_tables(tables: list, output_dir: str, fmt: str, incluir_sin_pk: bool = True) -> None:
    """Exporta las tablas seleccionadas a Excel.
    
    Args:
        tables: Lista de nombres de tablas a exportar. Si está vacía, exporta todas.
        output_dir: Directorio de salida para los archivos
        fmt: Formato de exportación ('xlsx' o 'csv')
        incluir_sin_pk: Si es True, incluye también tablas sin Primary Key
    """
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
            tablas_a_exportar = set()
            
            # Si no se especifican tablas, usar todas las disponibles
            if not tables:
                tablas_a_exportar = set(MODELS.keys())
            else:
                tablas_a_exportar = set(t.lower() for t in tables)
            
            # Si se debe incluir tablas sin PK, agregarlas a la lista
            if incluir_sin_pk:
                # Primero, agregar tablas relacionadas de las tablas principales que se están exportando
                tablas_principales = list(tablas_a_exportar.copy())
                for tabla_principal in tablas_principales:
                    try:
                        tablas_relacionadas = obtener_tablas_relacionadas(session, tabla_principal)
                        for tabla_rel in tablas_relacionadas:
                            tabla_rel_lower = tabla_rel.lower()
                            if tabla_rel_lower not in tablas_a_exportar:
                                log_step(f"Incluyendo tabla relacionada con {tabla_principal}: {tabla_rel}")
                                tablas_a_exportar.add(tabla_rel_lower)
                    except Exception as e:
                        log_fail(f"Error obteniendo tablas relacionadas con {tabla_principal}: {e}")
                        # Hacer rollback para continuar
                        try:
                            session.rollback()
                        except:
                            pass
                        continue
                
                # Luego, agregar todas las demás tablas sin PK
                try:
                    tablas_sin_pk = obtener_tablas_sin_pk(session)
                    for tabla_sin_pk in tablas_sin_pk:
                        tabla_lower = tabla_sin_pk.lower()
                        if tabla_lower not in tablas_a_exportar:
                            # Intentar obtener el modelo o crear uno dinámico
                            if tabla_lower in MODELS:
                                tablas_a_exportar.add(tabla_lower)
                            else:
                                # Si no está en MODELS, intentar agregarla directamente
                                log_step(f"Incluyendo tabla sin PK: {tabla_sin_pk}")
                                tablas_a_exportar.add(tabla_lower)
                except Exception as e:
                    log_fail(f"Error obteniendo tablas sin PK: {e}")
                    # Hacer rollback para continuar
                    try:
                        session.rollback()
                    except:
                        pass
            
            log_step(f"Total de tablas a exportar: {len(tablas_a_exportar)}")
            
            for name in tablas_a_exportar:
                try:
                    # Intentar obtener el modelo
                    model = None
                    try:
                        model = obtener_modelo(name)
                    except (AttributeError, KeyError):
                        # Si no se encuentra el modelo, intentar exportar directamente
                        log_step(f"Tabla {name} no encontrada en modelos, intentando exportación directa...")
                        # Verificar que la tabla existe en la BD
                        query_check = text("""
                            SELECT EXISTS (
                                SELECT 1
                                FROM information_schema.tables
                                WHERE table_schema = 'public'
                                    AND table_name = :tabla
                            )
                        """)
                        exists = session.execute(query_check, {"tabla": name}).fetchone()[0]
                        if not exists:
                            log_fail(f"Tabla {name} no existe en la base de datos")
                            continue
                        
                        # Crear un modelo temporal para la exportación
                        # Usar el modelo genérico si es posible
                        if name in MODELS:
                            model = MODELS[name]
                        else:
                            # Exportar directamente sin modelo
                            log_step(f"Exportando tabla {name} directamente (sin modelo)...")
                            try:
                                # Obtener columnas de la tabla
                                columnas = verificar_estructura_tabla(session, name)
                                if not columnas:
                                    log_fail(f"No se pudieron obtener columnas de {name}")
                                    continue
                                
                                # Filtrar columnas de análisis
                                columnas_analisis = filtrar_columnas_analisis(columnas, name)
                                if not columnas_analisis:
                                    log_step(f"Tabla {name} no tiene columnas de análisis después del filtrado")
                                    continue
                                
                                # Obtener datos
                                rows = obtener_datos_tabla(session, name, columnas_analisis)
                                
                                # Crear workbook
                                if not OPENPYXL_AVAILABLE:
                                    log_fail("openpyxl no está instalado")
                                    continue
                                
                                wb, ws = crear_workbook_excel(name)
                                
                                # Escribir datos
                                escribir_encabezados_excel(ws, columnas_analisis)
                                escribir_filas_excel(ws, rows)
                                
                                # Ajustar columnas
                                ajustar_ancho_columnas_excel(ws, columnas_analisis)
                                
                                # Guardar (normalizar nombre a lowercase)
                                name_normalized = name.lower()
                                xlsx_path = os.path.join(out_dir, f"{name_normalized}.xlsx")
                                if guardar_workbook_excel(wb, xlsx_path):
                                    log_ok(f"Archivo generado: {xlsx_path} ({len(rows)} filas)")
                                    exported += 1
                                continue
                            except Exception as e:
                                log_fail(f"Error exportando tabla {name} directamente: {e}")
                                continue
                    
                    if not model:
                        log_fail(f"No se pudo obtener modelo para tabla: {name}")
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
            
            log_ok(f"Tablas exportadas correctamente: {exported}/{len(tablas_a_exportar)}")
            
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

    # Determinar si incluir tablas sin PK
    incluir_sin_pk = True  # Por defecto incluir tablas sin PK
    
    # Verificar si hay argumentos para excluir
    if hasattr(args, 'excluir_sin_pk') and args.excluir_sin_pk:
        incluir_sin_pk = False
    elif hasattr(args, 'incluir_sin_pk') and not args.incluir_sin_pk:
        incluir_sin_pk = False

    log_step(f"Iniciando exportación de análisis en formato {args.format}…")
    log_step("Se exportarán datos de análisis (excluyendo IDs, estados activos, fechas de control)")
    if incluir_sin_pk:
        log_step("Incluyendo tablas sin Primary Key (tablas vinculadas)")
    export_selected_tables(args.tables, args.out, args.format, incluir_sin_pk=incluir_sin_pk)

if __name__ == "__main__":
    logging.getLogger().setLevel(logging.INFO)
    main()
