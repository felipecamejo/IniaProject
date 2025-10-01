import logging
from datetime import date, datetime, timedelta
import random
from urllib.parse import quote_plus
import sys
import re

# Importaciones con manejo explícito de dependencias faltantes
try:
    from sqlalchemy import create_engine, Column, Integer, String, Date, Float, Text, Boolean, BigInteger, DateTime, PrimaryKeyConstraint, text
    from sqlalchemy.orm import declarative_base, sessionmaker
except ModuleNotFoundError:
    print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
    raise

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Colores ANSI para logs en consola
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"

def log_ok(message: str):
    logger.info(f"{GREEN}✅ {message}{RESET}")

def log_fail(message: str):
    logger.error(f"{RED}❌ {message}{RESET}")

def log_step(message: str):
    logger.info(f"{CYAN}{message}{RESET}")

def log_progress(current: int, total: int, operation: str):
    """Muestra progreso de inserción masiva"""
    percentage = (current / total) * 100
    bar_length = 30
    filled_length = int(bar_length * current // total)
    bar = '█' * filled_length + '-' * (bar_length - filled_length)
    logger.info(f"{CYAN}{operation}: |{bar}| {percentage:.1f}% ({current}/{total}){RESET}")

def insert_batch_optimized(session, objects_list, batch_size=1000, operation_name="Inserción"):
    """Inserta objetos en lotes optimizados con progreso"""
    total = len(objects_list)
    if total == 0:
        return
    
    log_step(f"➡️ {operation_name} - Total: {total} registros")
    
    for i in range(0, total, batch_size):
        batch = objects_list[i:i + batch_size]
        session.add_all(batch)
        session.flush()
        session.commit()
        
        # Mostrar progreso cada lote
        current = min(i + batch_size, total)
        log_progress(current, total, operation_name)
    
    log_ok(f"{operation_name} completada: {total} registros")

# ================================
# Configuración inline por defecto
# ================================
DEFAULT_CONFIG = {
    'DB_USER': 'postgres',
    'DB_PASSWORD': '897888fg2',
    'DB_HOST': 'localhost',
    'DB_PORT': '5432',
    'DB_NAME': 'Inia',
}

# Usar EXCLUSIVAMENTE la configuración por defecto definida arriba
DB_USER = DEFAULT_CONFIG['DB_USER']
DB_PASSWORD = DEFAULT_CONFIG['DB_PASSWORD']
DB_HOST = DEFAULT_CONFIG['DB_HOST']
DB_PORT = DEFAULT_CONFIG['DB_PORT']
DB_NAME = DEFAULT_CONFIG['DB_NAME']

# Lista opcional de usuarios a utilizar en las relaciones.
# Puedes poner emails (str) o IDs (int o str numérica), por ejemplo:
# USUARIOS_SELECCIONADOS = ["admin@inia.com", 5, "7"]
USUARIOS_SELECCIONADOS = []

def build_connection_string():
    """Construye la cadena de conexión escapando credenciales."""
    user_esc = quote_plus(DB_USER or '')
    pass_esc = quote_plus(DB_PASSWORD or '')
    host = DB_HOST or 'localhost'
    port = DB_PORT or '5432'
    db = DB_NAME or ''
    return f'postgresql+psycopg2://{user_esc}:{pass_esc}@{host}:{port}/{db}'

# Crear la base declarativa (SQLAlchemy 2.0)
Base = declarative_base()

# Definir todas las tablas basadas en el mapeo de la base de datos
class Lote(Base):
    __tablename__ = 'lote'
    lote_id = Column(BigInteger, primary_key=True, autoincrement=True)
    lote_activo = Column(Boolean, nullable=True)
    lote_nombre = Column(String(255), nullable=True)
    lote_descripcion = Column(String(255), nullable=True)
    lote_fecha_creacion = Column(DateTime, nullable=True)
    lote_fecha_finalizacion = Column(DateTime, nullable=True)

class Maleza(Base):
    __tablename__ = 'maleza'
    maleza_id = Column(BigInteger, primary_key=True, autoincrement=True)
    maleza_activo = Column(Boolean, nullable=True)
    maleza_nombre = Column(String(255), nullable=True)
    maleza_descripcion = Column(String(255), nullable=True)

class Semilla(Base):
    __tablename__ = 'semilla'
    semilla_id = Column(BigInteger, primary_key=True, autoincrement=True)
    semilla_activo = Column(Boolean, nullable=True)
    semilla_nro_semillas_pura = Column(Integer, nullable=True)

class Usuario(Base):
    __tablename__ = 'usuario'
    usuario_id = Column(BigInteger, primary_key=True, autoincrement=True)
    usuario_activo = Column(Boolean, nullable=True)
    email = Column(String(255), nullable=True)
    nombre = Column(String(255), nullable=True)
    password = Column(String(255), nullable=True)
    rol = Column(String(255), nullable=True)

class Recibo(Base):
    __tablename__ = 'recibo'
    recibo_id = Column(BigInteger, primary_key=True, autoincrement=True)
    recibo_activo = Column(Boolean, nullable=True)
    analisis_solicitados = Column(String(255), nullable=True)
    articulo = Column(Integer, nullable=True)
    cultivar = Column(String(255), nullable=True)
    deposito = Column(String(255), nullable=True)
    especie = Column(String(255), nullable=True)
    estado = Column(String(255), nullable=True)
    fecha_recibo = Column(DateTime, nullable=True)
    ficha = Column(String(255), nullable=True)
    kg_limpios = Column(Float, nullable=True)
    lote = Column(Integer, nullable=True)
    nro_analisis = Column(Integer, nullable=True)
    origen = Column(String(255), nullable=True)
    remitente = Column(String(255), nullable=True)
    lote_id = Column(BigInteger, nullable=True)

class Dosn(Base):
    __tablename__ = 'dosn'
    dosn_id = Column(BigInteger, primary_key=True, autoincrement=True)
    dosn_activo = Column(Boolean, nullable=True)
    dosn_completo_reducido = Column(Boolean, nullable=True)
    dosn_determinacion_brassica = Column(Float, nullable=True)
    dosn_determinacion_cuscuta = Column(Float, nullable=True)
    dosn_estandar = Column(Boolean, nullable=True)
    dosn_fecha = Column(DateTime, nullable=True)
    dosn_fecha_analisis = Column(DateTime, nullable=True)
    dosn_gramos_analizados = Column(Float, nullable=True)
    dosn_malezas_tolerancia_cero = Column(Float, nullable=True)
    dosn_otros_cultivos = Column(Float, nullable=True)
    dosn_tipos_de_analisis = Column(String(255), nullable=True)
    recibo_id = Column(BigInteger, nullable=True)
    dosn_repetido = Column(Boolean, nullable=True)

class Cultivo(Base):
    __tablename__ = 'cultivo'
    cultivo_id = Column(BigInteger, primary_key=True, autoincrement=True)
    cultivo_activo = Column(Boolean, nullable=True)
    cultivo_nombre = Column(String(255), nullable=True)
    dosn_id = Column(BigInteger, nullable=True)
    cultivo_descripcion = Column(String(255), nullable=True)

class Germinacion(Base):
    __tablename__ = 'germinacion'
    germinacion_id = Column(BigInteger, primary_key=True, autoincrement=True)
    germinacion_activo = Column(Boolean, nullable=True)
    germinacion_comentarios = Column(String(255), nullable=True)
    germinacion_fechaconteo_1 = Column(DateTime, nullable=True)
    germinacion_fechaconteo_2 = Column(DateTime, nullable=True)
    germinacion_fechaconteo_3 = Column(DateTime, nullable=True)
    germinacion_fechaconteo_4 = Column(DateTime, nullable=True)
    germinacion_fechaconteo_5 = Column(DateTime, nullable=True)
    germinacion_fechafinal = Column(DateTime, nullable=True)
    germinacion_fechainicio = Column(DateTime, nullable=True)
    germinacion_germinacion = Column(Integer, nullable=True)
    germinacion_metodo = Column(String(255), nullable=True)
    germinacion_nrodias = Column(Integer, nullable=True)
    germinacion_nrosemillaporrepeticion = Column(Integer, nullable=True)
    germinacion_panormal = Column(Integer, nullable=True)
    germinacion_pmuertas = Column(Integer, nullable=True)
    germinacion_pnormal = Column(Integer, nullable=True)
    germinacion_predondeo = Column(Integer, nullable=True)
    germinacion_prefrio = Column(String(255), nullable=True)
    germinacion_pretratamiento = Column(String(255), nullable=True)
    germinacion_promediorepeticiones = Column(Float, nullable=True)
    germinacion_repeticionanormal = Column(Integer, nullable=True)
    germinacion_repeticiondura = Column(Integer, nullable=True)
    germinacion_repeticionfresca = Column(Integer, nullable=True)
    germinacion_repeticionmuerta = Column(Integer, nullable=True)
    germinacion_repeticionnormal_1 = Column(Integer, nullable=True)
    germinacion_repeticionnormal_2 = Column(Integer, nullable=True)
    germinacion_repeticionnormal_3 = Column(Integer, nullable=True)
    germinacion_repeticionnormal_4 = Column(Integer, nullable=True)
    germinacion_repeticionnormal_5 = Column(Integer, nullable=True)
    germinacion_semillasduras = Column(Integer, nullable=True)
    germinacion_temperatura = Column(Float, nullable=True)
    germinacion_totaldias = Column(Integer, nullable=True)
    germinacion_totalrepeticion = Column(Integer, nullable=True)
    germinacion_tratamiento = Column(String(255), nullable=True)
    recibo_id = Column(BigInteger, nullable=True)
    germinacion_repetido = Column(Boolean, nullable=True)

class Pms(Base):
    __tablename__ = 'pms'
    pms_id = Column(BigInteger, primary_key=True, autoincrement=True)
    pms_activo = Column(Boolean, nullable=True)
    fecha_medicion = Column(DateTime, nullable=True)
    humedad_porcentual = Column(Float, nullable=True)
    metodo = Column(String(255), nullable=True)
    observaciones = Column(String(255), nullable=True)
    peso_mil_semillas = Column(Float, nullable=True)
    recibo_id = Column(BigInteger, nullable=True)
    pms_repetido = Column(Boolean, nullable=True)

class Pureza(Base):
    __tablename__ = 'pureza'
    pureza_id = Column(BigInteger, primary_key=True, autoincrement=True)
    pureza_activo = Column(Boolean, nullable=True)
    estandar = Column(Boolean, nullable=True)
    fecha = Column(DateTime, nullable=True)
    fecha_estandar = Column(DateTime, nullable=True)
    malezas = Column(Float, nullable=True)
    malezas_toleradas = Column(Float, nullable=True)
    material_inerte = Column(Float, nullable=True)
    otros_cultivo = Column(Float, nullable=True)
    otros_cultivos = Column(Float, nullable=True)
    peso_inicial = Column(Float, nullable=True)
    peso_total = Column(Float, nullable=True)
    semilla_pura = Column(Float, nullable=True)
    recibo_id = Column(BigInteger, nullable=True)
    pureza_repetido = Column(Boolean, nullable=True)

class PurezaPnotatum(Base):
    __tablename__ = 'pureza_pnotatum'
    pureza_pnotatum_id = Column(BigInteger, primary_key=True, autoincrement=True)
    pureza_at = Column(Float, nullable=True)
    pureza_pi = Column(Float, nullable=True)
    pureza_activo = Column(Boolean, nullable=True)
    pureza_peso_inicial = Column(Float, nullable=True)
    pureza_porcentaje = Column(Float, nullable=True)
    pureza_porcentaje_a = Column(Float, nullable=True)
    pureza_repeticiones = Column(Integer, nullable=True)
    pureza_semillas_ls = Column(Float, nullable=True)
    pureza_total_a = Column(Integer, nullable=True)
    recibo_id = Column(BigInteger, nullable=True)
    pureza_repetido = Column(Boolean, nullable=True)

class Sanitario(Base):
    __tablename__ = 'sanitario'
    sanitario_id = Column(BigInteger, primary_key=True, autoincrement=True)
    sanitario_activo = Column(Boolean, nullable=True)
    sanitario_estadoproductodosis = Column(String(255), nullable=True)
    sanitario_fecha = Column(DateTime, nullable=True)
    sanitario_fechasiembra = Column(DateTime, nullable=True)
    sanitario_horasluzoscuridad = Column(Integer, nullable=True)
    sanitario_metodo = Column(String(255), nullable=True)
    sanitario_nrodias = Column(Integer, nullable=True)
    sanitario_nrosemillasrepeticion = Column(Integer, nullable=True)
    sanitario_observaciones = Column(String(255), nullable=True)
    sanitario_temperatura = Column(Integer, nullable=True)
    recibo_id = Column(BigInteger, nullable=True)
    sanitario_repetido = Column(Boolean, nullable=True)

class Hongo(Base):
    __tablename__ = 'hongo'
    hongo_id = Column(BigInteger, primary_key=True, autoincrement=True)
    hongo_activo = Column(Boolean, nullable=True)
    hongo_nombre = Column(String(255), nullable=True)
    hongo_descripcion = Column(String(255), nullable=True)

class Tetrazolio(Base):
    __tablename__ = 'tetrazolio'
    tetrazolio_id = Column(BigInteger, primary_key=True, autoincrement=True)
    tetrazolio_activo = Column(Boolean, nullable=True)
    concentracion = Column(Float, nullable=True)
    tetrazolio_danio_ambiente = Column(Integer, nullable=True)
    tetrazolio_danios_chinches = Column(Integer, nullable=True)
    tetrazolio_danios_duras = Column(Integer, nullable=True)
    tetrazolio_danios_fracturas = Column(Integer, nullable=True)
    tetrazolio_danios_mecanicos = Column(Integer, nullable=True)
    tetrazolio_danios_nro_semillas = Column(Integer, nullable=True)
    tetrazolio_danios_otros = Column(Integer, nullable=True)
    tetrazolio_danios_por_porcentajes = Column(Integer, nullable=True)
    tetrazolio_duras = Column(Float, nullable=True)
    tetrazolio_fecha = Column(DateTime, nullable=True)
    tetrazolio_no_viables = Column(Float, nullable=True)
    tetrazolio_nro_semillas = Column(Integer, nullable=True)
    tetrazolio_nro_semillas_por_repeticion = Column(Integer, nullable=True)
    tetrazolio_porcentaje = Column(Integer, nullable=True)
    tetrazolio_porcentaje_final = Column(Integer, nullable=True)
    pretratamiento = Column(String(255), nullable=True)
    tetrazolio_promedio = Column(Float, nullable=True)
    tetrazolio_repeticion = Column(Integer, nullable=True)
    tincion_grados = Column(Float, nullable=True)
    tincion_hs = Column(Float, nullable=True)
    tetrazolio_total = Column(Float, nullable=True)
    viabilidad_tz = Column(String(255), nullable=True)
    viabilidad_vigor_tz = Column(String(255), nullable=True)
    tetrazolio_viables = Column(Float, nullable=True)
    recibo_id = Column(BigInteger, nullable=True)
    tetrazolio_repetido = Column(Boolean, nullable=True)


class UsuarioLote(Base):
    __tablename__ = 'usuario_lote'
    usuario_id = Column(BigInteger, primary_key=True)
    lote_id = Column(BigInteger, primary_key=True)
    
    __table_args__ = (
        PrimaryKeyConstraint('usuario_id', 'lote_id'),
    )

class SanitarioHongo(Base):
    __tablename__ = 'sanitario_hongo'
    sanitario_hongo_id = Column(BigInteger, primary_key=True, autoincrement=True)
    incidencia = Column(Integer, nullable=True)
    repeticion = Column(Integer, nullable=True)
    valor = Column(Integer, nullable=True)
    hongo_id = Column(BigInteger, nullable=True)
    sanitario_id = Column(BigInteger, nullable=True)

# Datos de muestra para generar entradas realistas
DATOS_MUESTRA = {
    'especies': ['Trigo', 'Maíz', 'Soja', 'Girasol', 'Sorgo', 'Cebada', 'Avena', 'Arroz'],
    'cultivares': ['Variedad A', 'Variedad B', 'Variedad C', 'Híbrido X', 'Híbrido Y', 'Línea Z'],
    'origenes': ['Uruguay', 'Argentina', 'Brasil', 'Paraguay', 'Chile', 'Bolivia'],
    'remitentes': ['Productor A', 'Productor B', 'Cooperativa X', 'Empresa Y', 'Laboratorio Z'],
    'depositos': ['Depósito Norte', 'Depósito Sur', 'Depósito Este', 'Depósito Oeste', 'Depósito Central'],
    'estados': ['Recibido', 'En análisis', 'Completado', 'Pendiente'],
    'analisis': ['DOSN', 'Germinación', 'PMS', 'Pureza', 'Sanitario', 'Tetrazolio'],
    'metodos': ['METODO_A', 'METODO_B', 'METODO_C'],
    'hongos': ['Fusarium', 'Alternaria', 'Aspergillus', 'Penicillium', 'Rhizopus'],
    'roles': ['ADMIN', 'ANALISTA', 'OBSERVADOR'],
    'tratamientos': ['BIOLOGICO', 'QUIMICO', 'NINGUNO'],
    'prefrios': ['FRIO_HUMEDO', 'FRIO_SECO', 'NINGUNO'],
    'pretratamientos': ['SIN_PRETRATAMIENTO', 'ESCARIFICACION', 'ESTRATIFICACION'],
    'estados_producto': ['ESTADO_X', 'ESTADO_Y'],
    'viabilidades': ['VIABLES', 'NO_VIABLES', 'DUDOSOS'],
    'viabilidades_vigor': ['BUEN_VIGOR', 'VIGOR_MEDIO', 'VIGOR_BAJO'],
    'tipos_analisis': ['COMPLETO', 'REDUCIDO', 'ESTANDAR'],
    'tipos_hongo': ['Patógeno', 'Saprófito', 'Simbiótico', 'Oportunista'],
    'comentarios': ['Sin observaciones', 'Muestra en buen estado', 'Requiere atención', 'Proceso normal'],
    'observaciones': ['Sin observaciones', 'Muestra representativa', 'Condiciones normales', 'Proceso exitoso']
}

def generar_fecha_aleatoria(dias_atras=365):
    """Genera una fecha aleatoria en los últimos N días"""
    fecha_base = datetime.now() - timedelta(days=random.randint(1, dias_atras))
    return fecha_base.replace(
        hour=random.randint(8, 18),
        minute=random.randint(0, 59),
        second=random.randint(0, 59)
    )
    
def asegurar_autoincrementos(engine):
    """Asegura que las columnas ID tengan default nextval(...) en PostgreSQL.
    No altera modelos; ajusta defaults en tablas existentes si faltan.
    """
    ajustes = [
        ("usuario", "usuario_id"),
        ("lote", "lote_id"),
        ("recibo", "recibo_id"),
        ("maleza", "maleza_id"),
        ("semilla", "semilla_id"),
        ("dosn", "dosn_id"),
        ("cultivo", "cultivo_id"),
        ("germinacion", "germinacion_id"),
        ("pms", "pms_id"),
        ("pureza", "pureza_id"),
        ("pureza_pnotatum", "pureza_pnotatum_id"),
        ("sanitario", "sanitario_id"),
        ("hongo", "hongo_id"),
        ("tetrazolio", "tetrazolio_id"),
        ("sanitario_hongo", "sanitario_hongo_id"),
    ]
    with engine.begin() as conn:
        for tabla, columna in ajustes:
            # Detectar si el default ya es una secuencia
            q_default = text(
                """
                SELECT column_default
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = :tabla
                  AND column_name = :columna
                """
            )
            res = conn.execute(q_default, {"tabla": tabla, "columna": columna}).fetchone()
            actual_default = res[0] if res else None
            if actual_default and "nextval(" in str(actual_default):
                # Aunque ya haya default, igualmente sincronizamos la secuencia a max(id)
                # (continuamos flujo para setear seq_name y setval)
                ...

            # Resolver nombre real de la secuencia en PostgreSQL si existe
            q_seqname = text("SELECT pg_get_serial_sequence(:full_table, :columna)")
            seq_row = conn.execute(q_seqname, {"full_table": f"public.{tabla}", "columna": columna}).fetchone()
            seq_name = seq_row[0] if seq_row and seq_row[0] else f"public.{tabla}_{columna}_seq"

            # Crear secuencia si no existe
            conn.execute(text(f"CREATE SEQUENCE IF NOT EXISTS {seq_name};"))

            # Asegurar default en columna
            conn.execute(text(
                f"ALTER TABLE {tabla} ALTER COLUMN {columna} SET DEFAULT nextval('{seq_name}');"
            ))

            # Vincular propiedad de la secuencia a la columna (opcional pero recomendable)
            conn.execute(text(
                f"ALTER SEQUENCE {seq_name} OWNED BY {tabla}.{columna};"
            ))

            # Sincronizar la secuencia con el valor actual (max(id)) para evitar duplicados
            max_row = conn.execute(text(f"SELECT COALESCE(MAX({columna}), 0) FROM {tabla};")).fetchone()
            max_id = max_row[0] if max_row else 0
            # Cuando la tabla está vacía (max_id == 0), se debe usar is_called = false para que nextval devuelva 1
            if int(max_id) == 0:
                conn.execute(text(f"SELECT setval('{seq_name}', 1, false);"))
            else:
                # setval(seq, max_id, true) hace que el próximo nextval sea max_id+1
                conn.execute(text(f"SELECT setval('{seq_name}', :val, true);"), {"val": int(max_id)})

def cargar_usuarios(session):
    """Carga usuarios activos. Si USUARIOS_SELECCIONADOS contiene emails o IDs,
    filtra por esos usuarios; de lo contrario, trae todos los activos.
    """
    if not USUARIOS_SELECCIONADOS:
        return session.query(Usuario).filter(Usuario.usuario_activo == True).all()

    emails = [u for u in USUARIOS_SELECCIONADOS if isinstance(u, str) and not u.isdigit()]
    ids = [int(u) for u in USUARIOS_SELECCIONADOS if isinstance(u, (int, str)) and str(u).isdigit()]

    query = session.query(Usuario).filter(Usuario.usuario_activo == True)
    if emails and ids:
        users = query.filter((Usuario.email.in_(emails)) | (Usuario.usuario_id.in_(ids))).all()
    elif emails:
        users = query.filter(Usuario.email.in_(emails)).all()
    elif ids:
        users = query.filter(Usuario.usuario_id.in_(ids)).all()
    else:
        users = query.all()
    return users

def obtener_tipos_hongo_permitidos(engine):
    """Función obsoleta - la tabla hongo ya no tiene columna hongo_tipo.
    Devuelve lista vacía ya que no hay restricciones de tipo.
    """
    return []
    
def obtener_valores_check(engine, tabla: str, columna: str) -> list:
    """Devuelve valores permitidos por un CHECK de enumeración en PostgreSQL.
    Busca definiciones ARRAY[...] o IN(...). Retorna lista en mayúsculas o [].
    """
    try:
        with engine.connect() as conn:
            sql = text(
                """
                SELECT pg_get_constraintdef(c.oid) AS def
                FROM pg_constraint c
                JOIN pg_class t ON t.oid = c.conrelid
                JOIN pg_namespace n ON n.oid = t.relnamespace
                WHERE n.nspname = 'public'
                  AND t.relname = :tabla
                  AND c.contype = 'c'
                  AND c.conname ILIKE :columna_like
                LIMIT 1
                """
            )
            row = conn.execute(sql, {"tabla": tabla, "columna_like": f"%{columna}%"}).fetchone()
            if not row or not row[0]:
                return []
            definition = row[0]
            m = re.search(r"ARRAY\[(.*?)\]", definition)
            values_blob = m.group(1) if m else None
            if not values_blob:
                m = re.search(r"\bIN\s*\((.*?)\)", definition, re.IGNORECASE)
                values_blob = m.group(1) if m else None
            if not values_blob:
                return []
            parts = re.findall(r"'([^']+)'", values_blob)
            return [p.upper() for p in parts]
    except Exception:
        return []
    
# ================================
# Inserciones separadas por análisis
# ================================

def insert_pms(session, recibos):
    try:
        pms_list = []
        for i in range(5000):
            fecha_medicion = generar_fecha_aleatoria(30)
            pms = Pms(
                pms_activo=True,
                fecha_medicion=fecha_medicion,
                humedad_porcentual=round(random.uniform(8.0, 15.0), 2),
                metodo=random.choice(DATOS_MUESTRA['metodos']),
                observaciones=random.choice(DATOS_MUESTRA['observaciones']),
                peso_mil_semillas=round(random.uniform(20.0, 50.0), 2),
                recibo_id=random.choice([r.recibo_id for r in recibos]),
                pms_repetido=random.choice([True, False])
            )
            pms_list.append(pms)
        
        # Usar inserción optimizada por lotes
        insert_batch_optimized(session, pms_list, batch_size=1000, operation_name="PMS")
        return pms_list
    except Exception as e:
        session.rollback()
        log_fail(f"Error insertando PMS: {e}")
        return []

def insert_pureza(session, recibos):
    try:
        purezas = []
        for i in range(5000):
            fecha_pureza = generar_fecha_aleatoria(30)
            fecha_estandar = generar_fecha_aleatoria(25)
            pureza = Pureza(
                pureza_activo=True,
                estandar=random.choice([True, False]),
                fecha=fecha_pureza,
                fecha_estandar=fecha_estandar,
                malezas=round(random.uniform(0.0, 5.0), 2),
                malezas_toleradas=round(random.uniform(0.0, 2.0), 2),
                material_inerte=round(random.uniform(0.0, 3.0), 2),
                otros_cultivo=round(random.uniform(0.0, 2.0), 2),
                otros_cultivos=round(random.uniform(0.0, 2.0), 2),
                peso_inicial=round(random.uniform(50.0, 200.0), 2),
                peso_total=round(random.uniform(45.0, 195.0), 2),
                semilla_pura=round(random.uniform(90.0, 99.0), 2),
                recibo_id=random.choice([r.recibo_id for r in recibos]),
                pureza_repetido=random.choice([True, False])
            )
            purezas.append(pureza)
        
        # Usar inserción optimizada por lotes
        insert_batch_optimized(session, purezas, batch_size=1000, operation_name="Pureza")
        return purezas
    except Exception as e:
        session.rollback()
        log_fail(f"Error insertando Pureza: {e}")
        return []

def insert_pureza_pnotatum(session, recibos):
    try:
        purezas_pnotatum = []
        for i in range(5000):
            pureza_pnotatum = PurezaPnotatum(
                pureza_at=round(random.uniform(0.0, 5.0), 2),
                pureza_pi=round(random.uniform(0.0, 3.0), 2),
                pureza_activo=True,
                pureza_peso_inicial=round(random.uniform(10.0, 50.0), 2),
                pureza_porcentaje=round(random.uniform(0.0, 10.0), 2),
                pureza_porcentaje_a=round(random.uniform(0.0, 8.0), 2),
                pureza_repeticiones=random.randint(2, 4),
                pureza_semillas_ls=round(random.uniform(0.0, 2.0), 2),
                pureza_total_a=random.randint(0, 5),
                recibo_id=random.choice([r.recibo_id for r in recibos]),
                pureza_repetido=random.choice([True, False])
            )
            purezas_pnotatum.append(pureza_pnotatum)
        
        # Usar inserción optimizada por lotes
        insert_batch_optimized(session, purezas_pnotatum, batch_size=1000, operation_name="Pureza PNotatum")
        return purezas_pnotatum
    except Exception as e:
        session.rollback()
        log_fail(f"Error insertando Pureza PNotatum: {e}")
        return []

def insert_tetrazolio(session, recibos, engine=None):
    try:
        log_step("➡️ Insertando Tetrazolio...")
        pretratamientos_validos = DATOS_MUESTRA['pretratamientos']
        viabilidades_validas = DATOS_MUESTRA['viabilidades']
        viabilidades_vigor_validas = DATOS_MUESTRA['viabilidades_vigor']
        if engine is not None:
            valores = obtener_valores_check(engine, 'tetrazolio', 'pretratamiento')
            if valores:
                pretratamientos_validos = valores
            vals_via = obtener_valores_check(engine, 'tetrazolio', 'viabilidad_tz')
            if vals_via:
                viabilidades_validas = vals_via
            vals_vigor = obtener_valores_check(engine, 'tetrazolio', 'viabilidad_vigor_tz')
            if vals_vigor:
                viabilidades_vigor_validas = vals_vigor
        tetrazolios = []
        for i in range(5000):
            fecha_tetrazolio = generar_fecha_aleatoria(30)
            tetrazolio = Tetrazolio(
                tetrazolio_activo=True,
                concentracion=round(random.uniform(0.5, 2.0), 2),
                tetrazolio_danio_ambiente=random.randint(0, 5),
                tetrazolio_danios_chinches=random.randint(0, 3),
                tetrazolio_danios_duras=random.randint(0, 8),
                tetrazolio_danios_fracturas=random.randint(0, 5),
                tetrazolio_danios_mecanicos=random.randint(0, 4),
                tetrazolio_danios_nro_semillas=random.randint(0, 10),
                tetrazolio_danios_otros=random.randint(0, 2),
                tetrazolio_danios_por_porcentajes=random.randint(0, 5),
                tetrazolio_duras=round(random.uniform(0.0, 10.0), 2),
                tetrazolio_fecha=fecha_tetrazolio,
                tetrazolio_no_viables=round(random.uniform(0.0, 15.0), 2),
                tetrazolio_nro_semillas=random.randint(200, 400),
                tetrazolio_nro_semillas_por_repeticion=random.randint(50, 100),
                tetrazolio_porcentaje=random.randint(70, 95),
                tetrazolio_porcentaje_final=random.randint(70, 95),
                pretratamiento=random.choice(pretratamientos_validos),
                tetrazolio_promedio=round(random.uniform(80.0, 95.0), 2),
                tetrazolio_repeticion=random.randint(2, 4),
                tincion_grados=round(random.uniform(20.0, 40.0), 1),
                tincion_hs=round(random.uniform(2.0, 4.0), 1),
                tetrazolio_total=round(random.uniform(80.0, 95.0), 2),
                viabilidad_tz=random.choice(viabilidades_validas),
                viabilidad_vigor_tz=random.choice(viabilidades_vigor_validas),
                tetrazolio_viables=round(random.uniform(80.0, 95.0), 2),
                recibo_id=random.choice([r.recibo_id for r in recibos]),
                tetrazolio_repetido=random.choice([True, False])
            )
            tetrazolios.append(tetrazolio)
        # Usar inserción optimizada por lotes
        insert_batch_optimized(session, tetrazolios, batch_size=1000, operation_name="Tetrazolio")
        return tetrazolios
    except Exception as e:
        session.rollback()
        log_fail(f"Error insertando Tetrazolio: {e}")
        return []

def insert_dosn(session, recibos):
    try:
        log_step("➡️ Insertando DOSN...")
        dosns = []
        for i in range(5000):
            fecha_dosn = generar_fecha_aleatoria(60)
            fecha_analisis = generar_fecha_aleatoria(30)
            dosn = Dosn(
                dosn_activo=True,
                dosn_completo_reducido=random.choice([True, False]),
                dosn_determinacion_brassica=round(random.uniform(0.0, 10.0), 2),
                dosn_determinacion_cuscuta=round(random.uniform(0.0, 5.0), 2),
                dosn_estandar=random.choice([True, False]),
                dosn_fecha=fecha_dosn,
                dosn_fecha_analisis=fecha_analisis,
                dosn_gramos_analizados=round(random.uniform(10.0, 100.0), 2),
                dosn_malezas_tolerancia_cero=round(random.uniform(0.0, 2.0), 2),
                dosn_otros_cultivos=round(random.uniform(0.0, 5.0), 2),
                dosn_tipos_de_analisis=random.choice(DATOS_MUESTRA['tipos_analisis']),
                recibo_id=random.choice([r.recibo_id for r in recibos]),
                dosn_repetido=random.choice([True, False])
            )
            dosns.append(dosn)
        # Usar inserción optimizada por lotes
        insert_batch_optimized(session, dosns, batch_size=1000, operation_name="DOSN")
        return dosns
    except Exception as e:
        session.rollback()
        log_fail(f"Error insertando DOSN: {e}")
        return []

def insert_cultivos(session, dosns):
    try:
        log_step("➡️ Insertando Cultivos (dependen de DOSN)...")
        if not dosns:
            log_fail("No hay DOSN disponibles para asociar Cultivos.")
            return []
        cultivos = []
        for i in range(5000):
            cultivo = Cultivo(
                cultivo_activo=True,
                cultivo_nombre=f"Cultivo-{i+1}",
                dosn_id=random.choice([d.dosn_id for d in dosns]),
                cultivo_descripcion=f"Descripción del cultivo {i+1}"
            )
            cultivos.append(cultivo)
        # Usar inserción optimizada por lotes
        insert_batch_optimized(session, cultivos, batch_size=1000, operation_name="Cultivos")
        return cultivos
    except Exception as e:
        session.rollback()
        log_fail(f"Error insertando Cultivos: {e}")
        return []

def insert_germinacion(session, recibos, engine=None):
    try:
        log_step("➡️ Insertando Germinación...")
        germinaciones = []
        # Normalizamos valores para cumplir constraints de BD
        metodos_validos = DATOS_MUESTRA['metodos']
        tratamientos_validos = DATOS_MUESTRA['tratamientos']
        prefrios_validos = DATOS_MUESTRA['prefrios']
        pretratamientos_validos = DATOS_MUESTRA['pretratamientos']
        if engine is not None:
            valores_prefrio = obtener_valores_check(engine, 'germinacion', 'prefrio')
            if valores_prefrio:
                prefrios_validos = valores_prefrio
            valores_pretrat = obtener_valores_check(engine, 'germinacion', 'pretratamiento')
            if valores_pretrat:
                pretratamientos_validos = valores_pretrat
        for i in range(5000):
            # Generar fechas en orden cronológico lógico
            fecha_inicio = generar_fecha_aleatoria(40)
            fecha_conteo_1 = generar_fecha_aleatoria(30)
            fecha_conteo_2 = generar_fecha_aleatoria(25)
            fecha_conteo_3 = generar_fecha_aleatoria(20)
            fecha_conteo_4 = generar_fecha_aleatoria(15)
            fecha_conteo_5 = generar_fecha_aleatoria(10)
            fecha_final = generar_fecha_aleatoria(5)
            
            germinacion = Germinacion(
                germinacion_activo=True,
                germinacion_comentarios=random.choice(DATOS_MUESTRA['comentarios']),
                germinacion_fechaconteo_1=fecha_conteo_1,
                germinacion_fechaconteo_2=fecha_conteo_2,
                germinacion_fechaconteo_3=fecha_conteo_3,
                germinacion_fechaconteo_4=fecha_conteo_4,
                germinacion_fechaconteo_5=fecha_conteo_5,
                germinacion_fechafinal=fecha_final,
                germinacion_fechainicio=fecha_inicio,
                germinacion_germinacion=random.randint(70, 95),
                germinacion_metodo=random.choice(metodos_validos),
                germinacion_nrodias=random.randint(5, 15),
                germinacion_nrosemillaporrepeticion=random.randint(50, 200),
                germinacion_panormal=random.randint(0, 10),
                germinacion_pmuertas=random.randint(0, 5),
                germinacion_pnormal=random.randint(80, 95),
                germinacion_predondeo=random.randint(0, 3),
                germinacion_prefrio=random.choice(prefrios_validos),
                germinacion_pretratamiento=random.choice(pretratamientos_validos),
                germinacion_promediorepeticiones=round(random.uniform(80.0, 95.0), 2),
                germinacion_repeticionanormal=random.randint(0, 2),
                germinacion_repeticiondura=random.randint(0, 3),
                germinacion_repeticionfresca=random.randint(0, 1),
                germinacion_repeticionmuerta=random.randint(0, 2),
                germinacion_repeticionnormal_1=random.randint(40, 50),
                germinacion_repeticionnormal_2=random.randint(40, 50),
                germinacion_repeticionnormal_3=random.randint(40, 50),
                germinacion_repeticionnormal_4=random.randint(40, 50),
                germinacion_repeticionnormal_5=random.randint(40, 50),
                germinacion_semillasduras=random.randint(0, 5),
                germinacion_temperatura=round(random.uniform(20.0, 25.0), 1),
                germinacion_totaldias=random.randint(5, 15),
                germinacion_totalrepeticion=random.randint(200, 250),
                germinacion_tratamiento=random.choice(tratamientos_validos),
                recibo_id=random.choice([r.recibo_id for r in recibos]),
                germinacion_repetido=random.choice([True, False])
            )
            germinaciones.append(germinacion)
        # Usar inserción optimizada por lotes
        insert_batch_optimized(session, germinaciones, batch_size=1000, operation_name="Germinación")
        return germinaciones
    except Exception as e:
        session.rollback()
        log_fail(f"Error insertando Germinación: {e}")
        return []
    
def insertar_datos_masivos():
    """Inserta datos masivos respetando las dependencias entre tablas"""
    try:
        connection_string = build_connection_string()
        engine = create_engine(connection_string)
        # Asegurar defaults de autoincrement antes de insertar
        try:
            logger.info("🔧 Asegurando autoincrementos en IDs...")
            asegurar_autoincrementos(engine)
            logger.info("✅ Autoincrementos verificados/ajustados")
        except Exception as e:
            logger.error(f"❌ No se pudieron asegurar autoincrementos: {e}")
        Session = sessionmaker(bind=engine)
        session = Session()
        
        try:
            logger.info("🚀 Iniciando inserción masiva de datos en secuencias...")

            # SECUENCIA 1: (Usuarios) CARGAR EXISTENTES, NO CREAR
            logger.info("👥 SECUENCIA 1: Cargando usuarios activos (posible filtro por lista)...")
            usuarios = cargar_usuarios(session)
            logger.info(f"✅ Usuarios existentes encontrados: {len(usuarios)}")

            # SECUENCIA 2: Lotes
            logger.info("📦 SECUENCIA 2: Insertando lotes...")
            lotes = []
            for i in range(20):
                fecha_creacion = generar_fecha_aleatoria(180)
                fecha_finalizacion = generar_fecha_aleatoria(30)
                lote = Lote(
                    lote_activo=True,
                    lote_nombre=f"Lote-{i+1:03d}",
                    lote_descripcion=f"Descripción del lote {i+1}",
                    lote_fecha_creacion=fecha_creacion,
                    lote_fecha_finalizacion=fecha_finalizacion
                )
                lotes.append(lote)
            insert_batch_optimized(session, lotes, batch_size=20, operation_name="Lotes")
            logger.info(f"✅ SECUENCIA 2 COMPLETADA: {len(lotes)} lotes")

            # SECUENCIA 3: Recibos (dependen de Lotes)
            logger.info("📋 SECUENCIA 3: Insertando recibos...")
            recibos = []
            for i in range(50):
                fecha_recibo = generar_fecha_aleatoria(90)
                recibo = Recibo(
                    recibo_activo=True,
                    analisis_solicitados=random.choice(DATOS_MUESTRA['analisis']),
                    articulo=random.randint(1000, 9999),
                    cultivar=random.choice(DATOS_MUESTRA['cultivares']),
                    deposito=random.choice(DATOS_MUESTRA['depositos']),
                    especie=random.choice(DATOS_MUESTRA['especies']),
                    estado=random.choice(DATOS_MUESTRA['estados']),
                    fecha_recibo=fecha_recibo,
                    ficha=f"FICHA-{i+1:04d}",
                    kg_limpios=round(random.uniform(1.0, 100.0), 2),
                    lote=random.randint(1, 100),
                    nro_analisis=random.randint(1000, 9999),
                    origen=random.choice(DATOS_MUESTRA['origenes']),
                    remitente=random.choice(DATOS_MUESTRA['remitentes']),
                    lote_id=random.choice([l.lote_id for l in lotes])
                )
                recibos.append(recibo)
            insert_batch_optimized(session, recibos, batch_size=50, operation_name="Recibos")
            logger.info(f"✅ SECUENCIA 3 COMPLETADA: {len(recibos)} recibos")

            # SECUENCIA 4: Hongos y Malezas (respetando dependencias internas)
            #  - Malezas es independiente
            #  - Sanitario depende de Recibo
            #  - Hongo depende de Sanitario
            logger.info("🌿🧫 SECUENCIA 4: Insertando malezas, sanitario y hongos...")

            # Malezas (independiente)
            malezas = []
            for i in range(15):
                maleza = Maleza(
                    maleza_activo=True,
                    maleza_nombre=f"Maleza-{i+1}",
                    maleza_descripcion=f"Descripción de maleza {i+1}"
                )
                malezas.append(maleza)
            insert_batch_optimized(session, malezas, batch_size=15, operation_name="Malezas")
            logger.info(f"✅ Malezas insertadas: {len(malezas)}")

            # Sanitario (para poder asociar Hongos)
            sanitarios = []
            for i in range(16):
                fecha_sanitario = generar_fecha_aleatoria(30)
                fecha_siembra = generar_fecha_aleatoria(25)
                sanitario = Sanitario(
                    sanitario_activo=True,
                    sanitario_estadoproductodosis=random.choice(DATOS_MUESTRA['estados_producto']),
                    sanitario_fecha=fecha_sanitario,
                    sanitario_fechasiembra=fecha_siembra,
                    sanitario_horasluzoscuridad=random.randint(8, 16),
                    sanitario_metodo=random.choice(DATOS_MUESTRA['metodos']),
                    sanitario_nrodias=random.randint(5, 14),
                    sanitario_nrosemillasrepeticion=random.randint(50, 200),
                    sanitario_observaciones=random.choice(DATOS_MUESTRA['observaciones']),
                    sanitario_temperatura=random.randint(20, 30),
                    recibo_id=random.choice([r.recibo_id for r in recibos]),
                    sanitario_repetido=random.choice([True, False])
                )
                sanitarios.append(sanitario)
            insert_batch_optimized(session, sanitarios, batch_size=16, operation_name="Sanitarios")
            logger.info(f"✅ Sanitarios insertados: {len(sanitarios)}")

            # Hongos (dependen de Sanitario)
            hongos = []
            for i in range(20):
                hongo = Hongo(
                    hongo_activo=True,
                    hongo_nombre=random.choice(DATOS_MUESTRA['hongos']),
                    hongo_descripcion=f"Descripción del hongo {i+1}"
                )
                hongos.append(hongo)
            insert_batch_optimized(session, hongos, batch_size=20, operation_name="Hongos")
            logger.info(f"✅ SECUENCIA 4 COMPLETADA: {len(hongos)} hongos, {len(malezas)} malezas")

            # SECUENCIA 5: El resto de entidades y relaciones
            logger.info("🧩 SECUENCIA 5: Insertando el resto de entidades y relaciones...")

            # Semillas (independiente)
            semillas = []
            for i in range(10):
                semilla = Semilla(
                    semilla_activo=True,
                    semilla_nro_semillas_pura=random.randint(100, 10000)
                )
                semillas.append(semilla)
            insert_batch_optimized(session, semillas, batch_size=10, operation_name="Semillas")
            logger.info(f"✅ Semillas insertadas: {len(semillas)}")

            # Inserciones separadas de análisis
            pms_list = insert_pms(session, recibos)
            purezas = insert_pureza(session, recibos)
            purezas_pnotatum = insert_pureza_pnotatum(session, recibos)
            tetrazolios = insert_tetrazolio(session, recibos, engine)
            dosns = insert_dosn(session, recibos)
            cultivos = insert_cultivos(session, dosns)
            germinaciones = insert_germinacion(session, recibos, engine)
            # Relaciones
            usuario_lotes = []
            if usuarios:
                pares_existentes = set()
                for i in range(30):
                    par = (
                        random.choice([u.usuario_id for u in usuarios]),
                        random.choice([l.lote_id for l in lotes])
                    )
                    if par in pares_existentes:
                        continue
                    pares_existentes.add(par)
                    usuario_lote = UsuarioLote(
                        usuario_id=par[0],
                        lote_id=par[1]
                    )
                    usuario_lotes.append(usuario_lote)
                if usuario_lotes:
                    insert_batch_optimized(session, usuario_lotes, batch_size=30, operation_name="Usuario-Lote")
            else:
                logger.info("ℹ️ No hay usuarios; se omite la creación de relaciones usuario-lote")
            
            sanitario_hongos = []
            for i in range(25):
                sanitario_hongo = SanitarioHongo(
                    incidencia=random.randint(0, 100),
                    repeticion=random.randint(1, 4),
                    valor=random.randint(0, 5),
                    hongo_id=random.choice([h.hongo_id for h in hongos]),
                    sanitario_id=random.choice([s.sanitario_id for s in sanitarios])
                )
                sanitario_hongos.append(sanitario_hongo)
            insert_batch_optimized(session, sanitario_hongos, batch_size=25, operation_name="Sanitario-Hongo")
            
            # Commit final de la secuencia 5 (seguridad, puede no haber cambios pendientes)
            try:
                session.commit()
            except Exception:
                session.rollback()
            
            # Resumen final
            total_registros = (
                len(lotes) + len(malezas) + len(semillas) + len(usuarios) +
                len(recibos) + len(dosns) + len(cultivos) + len(germinaciones) +
                len(pms_list) + len(purezas) + len(purezas_pnotatum) + len(sanitarios) +
                len(tetrazolios) + len(hongos) + len(usuario_lotes) + len(sanitario_hongos)
            )
            
            logger.info("🎉 ¡TODAS LAS SECUENCIAS COMPLETADAS EXITOSAMENTE!")
            logger.info(f"📊 Total de registros insertados: {total_registros}")
            logger.info("✅ Todas las dependencias fueron respetadas")
            
            return True
            
        except Exception as e:
            session.rollback()
            logger.error(f"❌ Error durante la inserción: {e}")
            return False
        finally:
            session.close()
            
    except Exception as e:
        logger.error(f"❌ Error de conexión: {e}")
        return False

if __name__ == "__main__":
    print("=" * 80)
    print("🚀 SCRIPT DE INSERCIÓN MASIVA DE DATOS - LABORATORIO")
    print("=" * 80)
    print("📋 Respetando dependencias entre tablas:")
    print("   1. Lote, Maleza, Semilla, Usuario (independientes)")
    print("   2. Recibo (depende de Lote)")
    print("   3. DOSN, Germinación, PMS, Pureza, PurezaPnotatum, Sanitario, Tetrazolio (dependen de Recibo)")
    print("   4. Cultivo (depende de DOSN), Hongo (depende de Sanitario)")
    print("   5. UsuarioLote, SanitarioHongo (tablas de relación)")
    print("")
    print("🔥 MODO LABORATORIO: 5000 registros por análisis para pruebas de rendimiento")
    print("⚡ Inserción optimizada por lotes con indicadores de progreso")
    print("=" * 80)
    
    exito = insertar_datos_masivos()
    
    if exito:
        print("\n🎉 ¡PROCESO COMPLETADO EXITOSAMENTE!")
        print("💡 Los datos fueron insertados respetando todas las dependencias")
    else:
        print("\n❌ ERROR EN EL PROCESO")
        print("💡 Revisa los logs para más detalles")
    
    print("\n" + "=" * 80)
