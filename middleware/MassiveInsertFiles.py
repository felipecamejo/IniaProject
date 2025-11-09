import os
import random
import re
import logging
from datetime import datetime, timedelta
from urllib.parse import quote_plus
from typing import Dict, List, Optional, Tuple, Any

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
    from sqlalchemy import create_engine, text, inspect
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.automap import automap_base
except ModuleNotFoundError:
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('MassiveInsertFiles', silent=False):
            from sqlalchemy import create_engine, text, inspect
            from sqlalchemy.orm import sessionmaker
            from sqlalchemy.ext.automap import automap_base
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install -r requirements.txt")
            raise
    else:
        print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
        raise

# Verificar e instalar dependencias Pandas y NumPy
if INSTALL_DEPS_AVAILABLE:
    if not verificar_e_instalar('pandas', 'pandas', silent=True):
        print("Intentando instalar pandas...")
        verificar_e_instalar('pandas', 'pandas', silent=False)
    if not verificar_e_instalar('numpy', 'numpy', silent=True):
        print("Intentando instalar numpy...")
        verificar_e_instalar('numpy', 'numpy', silent=False)

# Importaciones Pandas
try:
    import pandas as pd
    import numpy as np
except ModuleNotFoundError:
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('MassiveInsertFiles', silent=False):
            import pandas as pd
            import numpy as np
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install -r requirements.txt")
            raise
    else:
        print("Faltan los paquetes 'pandas' y 'numpy'. Instálalos con: pip install pandas numpy")
        raise

# ================================
# CONFIGURACIÓN Y LOGGING
# ================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
# MÓDULO: ANÁLISIS DE DEPENDENCIAS
# ================================
def obtener_dependencias_tabla(engine, tabla_nombre: str) -> List[Tuple[str, str]]:
    """Obtiene las foreign keys de una tabla. Retorna lista de (tabla_referenciada, columna_fk)."""
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys(tabla_nombre, schema='public')
    dependencias = []
    for fk in fks:
        tabla_ref = fk['referred_table']
        columna_fk = fk['constrained_columns'][0] if fk['constrained_columns'] else None
        if columna_fk:
            dependencias.append((tabla_ref, columna_fk))
    return dependencias

def obtener_constraints_tabla(engine, tabla_nombre: str) -> Dict[str, Any]:
    """Obtiene todos los constraints de una tabla (CHECK, NOT NULL, UNIQUE, etc.)."""
    inspector = inspect(engine)
    constraints = {
        'check': [],
        'not_null': [],
        'unique': [],
        'foreign_keys': []
    }
    
    # Obtener CHECK constraints
    try:
        with engine.connect() as conn:
            query = text("""
                SELECT conname, pg_get_constraintdef(oid) as definition
                FROM pg_constraint
                WHERE conrelid = (
                    SELECT c.oid 
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relname = :tabla AND n.nspname = 'public'
                ) AND contype = 'c'
            """)
            result = conn.execute(query, {"tabla": tabla_nombre})
            for row in result:
                constraints['check'].append({
                    'name': row[0],
                    'definition': row[1]
                })
    except Exception as e:
        logger.warning(f"Error obteniendo CHECK constraints para {tabla_nombre}: {e}")
    
    # Obtener columnas NOT NULL
    columnas = inspector.get_columns(tabla_nombre, schema='public')
    for col in columnas:
        if not col.get('nullable', True):
            constraints['not_null'].append(col['name'])
    
    # Obtener UNIQUE constraints
    try:
        unique_constraints = inspector.get_unique_constraints(tabla_nombre, schema='public')
        for uc in unique_constraints:
            constraints['unique'].append({
                'name': uc['name'],
                'columns': uc['column_names']
            })
    except Exception as e:
        logger.warning(f"Error obteniendo UNIQUE constraints para {tabla_nombre}: {e}")
    
    # Obtener Foreign Keys
    fks = inspector.get_foreign_keys(tabla_nombre, schema='public')
    for fk in fks:
        constraints['foreign_keys'].append({
            'name': fk.get('name', ''),
            'columns': fk.get('constrained_columns', []),
            'referred_table': fk.get('referred_table', ''),
            'referred_columns': fk.get('referred_columns', [])
        })
    
    return constraints

def parsear_check_constraint(definition: str) -> List[str]:
    """Parsea una definición de CHECK constraint para extraer valores permitidos."""
    valores = []
    # Buscar patrones como ARRAY['valor1', 'valor2', ...]
    pattern = r"ARRAY\[(.*?)\]"
    match = re.search(pattern, definition)
    if match:
        valores_str = match.group(1)
        # Extraer valores individuales
        valores_pattern = r"'([^']+)'"
        valores = re.findall(valores_pattern, valores_str)
    return valores

def mapear_check_constraints_por_columna(engine, tabla_nombre: str) -> Dict[str, List[str]]:
    """Mapea CHECK constraints a sus columnas correspondientes y retorna valores permitidos."""
    constraints = obtener_constraints_tabla(engine, tabla_nombre)
    check_map = {}
    
    for check_constraint in constraints.get('check', []):
        definition = check_constraint.get('definition', '')
        name = check_constraint.get('name', '')
        
        # Extraer el nombre de la columna de la definición del constraint
        # Ejemplo: "CHECK (((lote_categoria)::text = ANY (...)))" -> "lote_categoria"
        columna_match = re.search(r'\(\((\w+)\)::text', definition)
        if columna_match:
            columna = columna_match.group(1)
            valores = parsear_check_constraint(definition)
            if valores:
                check_map[columna] = valores
                logger.debug(f"CHECK constraint para '{tabla_nombre}.{columna}': {valores}")
    
    return check_map

def mapear_todas_dependencias(engine) -> Dict[str, Dict[str, Any]]:
    """Mapea todas las dependencias y constraints de todas las tablas."""
    inspector = inspect(engine)
    tablas = inspector.get_table_names(schema='public')
    
    # Tablas a ignorar
    tablas_ignorar = {'certificado'}
    
    mapeo_completo = {}
    
    for tabla in tablas:
        # Ignorar tablas específicas
        if tabla.lower() in tablas_ignorar:
            logger.info(f"Tabla '{tabla}' ignorada en el proceso de inserción")
            continue
        dependencias = obtener_dependencias_tabla(engine, tabla)
        constraints = obtener_constraints_tabla(engine, tabla)
        pk_constraint = inspector.get_pk_constraint(tabla, schema='public')
        pk_columns = pk_constraint.get('constrained_columns', [])
        
        # Mapear CHECK constraints por columna
        check_map = mapear_check_constraints_por_columna(engine, tabla)
        
        # Log informativo de CHECK constraints encontrados
        if check_map:
            for columna, valores in check_map.items():
                logger.info(f"CHECK constraint detectado para '{tabla}.{columna}': valores permitidos = {valores}")
        
        mapeo_completo[tabla] = {
            'dependencias': dependencias,
            'constraints': constraints,
            'check_map': check_map,  # Agregar mapeo de CHECK constraints
            'pk_columns': pk_columns,
            'es_relacional': len(pk_columns) > 1,
            'tablas_dependientes': []
        }
    
    # Identificar tablas que dependen de cada tabla
    for tabla, info in mapeo_completo.items():
        for tabla_dep, _ in info['dependencias']:
            if tabla_dep in mapeo_completo:
                mapeo_completo[tabla_dep]['tablas_dependientes'].append(tabla)
    
    return mapeo_completo

def orden_topologico(mapeo_completo: Dict[str, Dict[str, Any]]) -> List[List[str]]:
    """Calcula el orden topológico de inserción de tablas usando algoritmo de Kahn."""
    niveles = []
    tablas_restantes = set(mapeo_completo.keys())
    grados_entrada = {}
    
    # Calcular grados de entrada (número de dependencias)
    for tabla, info in mapeo_completo.items():
        grados_entrada[tabla] = len(info['dependencias'])
    
    # Algoritmo de Kahn
    while tablas_restantes:
        nivel_actual = []
        
        # Encontrar tablas sin dependencias pendientes
        for tabla in list(tablas_restantes):
            if grados_entrada[tabla] == 0:
                nivel_actual.append(tabla)
        
        if not nivel_actual:
            tablas_problema = [t for t in tablas_restantes if grados_entrada[t] > 0]
            raise RuntimeError(f"Error: Ciclo detectado o dependencias faltantes. Tablas con problemas: {tablas_problema}")
        
        # Procesar nivel actual
        for tabla in nivel_actual:
            tablas_restantes.remove(tabla)
            # Reducir grados de entrada de tablas dependientes
            for tabla_dep in mapeo_completo[tabla]['tablas_dependientes']:
                if tabla_dep in grados_entrada:
                    grados_entrada[tabla_dep] -= 1
        
        niveles.append(nivel_actual)
    
    return niveles

# ================================
# MÓDULO: GENERACIÓN DE DATOS
# ================================
def generar_valor_aleatorio(columna: str, tipo_dato: str, valores_existentes: Optional[List] = None) -> Any:
    """Genera un valor aleatorio según el tipo de dato de la columna."""
    if valores_existentes:
        return random.choice(valores_existentes)
    
    tipo_lower = tipo_dato.lower()
    
    if 'int' in tipo_lower or 'bigint' in tipo_lower or 'smallint' in tipo_lower:
        return random.randint(1, 10000)
    
    if 'float' in tipo_lower or 'real' in tipo_lower or 'double' in tipo_lower or 'numeric' in tipo_lower or 'decimal' in tipo_lower:
        return round(random.uniform(0.0, 100.0), 2)
    
    if 'bool' in tipo_lower:
        return random.choice([True, False])
    
    if 'date' in tipo_lower or 'timestamp' in tipo_lower or 'time' in tipo_lower:
        fecha_base = datetime.now() - timedelta(days=random.randint(1, 365))
        if 'date' in tipo_lower and 'time' not in tipo_lower:
            return fecha_base.date()
        return fecha_base
    
    if 'varchar' in tipo_lower or 'text' in tipo_lower or 'char' in tipo_lower:
        longitud = 50
        if 'varchar' in tipo_lower:
            try:
                longitud = int(tipo_dato.split('(')[1].split(')')[0])
            except:
                longitud = 50
        return ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=min(longitud, 50)))
    
    return None

def generar_valores_columna(col_info: Dict[str, Any], cantidad: int, fk_map: Dict[str, str], 
                           ids_referencias: Dict[str, List[int]], check_map: Dict[str, List[str]] = None) -> List[Any]:
    """Genera valores para una columna específica."""
    if check_map is None:
        check_map = {}
    
    col_name = col_info['name']
    tipo = str(col_info['type'])
    nullable = col_info.get('nullable', True)
    default = col_info.get('default')
    autoincrement = col_info.get('autoincrement', False)
    
    # Saltar columnas autoincrementales
    if autoincrement:
        return None
    
    # Si es foreign key, usar IDs de la tabla referenciada
    if col_name in fk_map:
        tabla_ref = fk_map[col_name]
        if tabla_ref in ids_referencias and ids_referencias[tabla_ref]:
            return [random.choice(ids_referencias[tabla_ref]) for _ in range(cantidad)]
        else:
            return [None if nullable else 1 for _ in range(cantidad)]
    
    # Si hay un CHECK constraint, usar valores permitidos
    if col_name in check_map:
        valores_permitidos = check_map[col_name]
        if valores_permitidos:
            return [random.choice(valores_permitidos) for _ in range(cantidad)]
    
    # Generar valores aleatorios
    valores = []
    for _ in range(cantidad):
        if not nullable:
            if default is not None and random.random() < 0.1:
                valores.append(default)
            else:
                valor = generar_valor_aleatorio(col_name, tipo)
                valores.append(valor)
        else:
            if random.random() < 0.05:
                valores.append(None)
            elif default is not None and random.random() < 0.1:
                valores.append(default)
            else:
                valor = generar_valor_aleatorio(col_name, tipo)
                valores.append(valor)
    
    return valores

def generar_datos_tabla(engine, tabla_nombre: str, cantidad: int, ids_referencias: Dict[str, List[int]] = None, 
                       mapeo_completo: Dict[str, Dict[str, Any]] = None) -> pd.DataFrame:
    """Genera un DataFrame con datos de prueba para una tabla."""
    if ids_referencias is None:
        ids_referencias = {}
    
    inspector = inspect(engine)
    columnas_info = inspector.get_columns(tabla_nombre, schema='public')
    
    # Obtener dependencias (foreign keys)
    dependencias = obtener_dependencias_tabla(engine, tabla_nombre)
    fk_map = {fk_col: tabla_ref for tabla_ref, fk_col in dependencias}
    
    # Obtener CHECK constraints para esta tabla
    check_map = {}
    unique_constraints = []
    if mapeo_completo and tabla_nombre in mapeo_completo:
        check_map = mapeo_completo[tabla_nombre].get('check_map', {})
        unique_constraints = mapeo_completo[tabla_nombre].get('constraints', {}).get('unique', [])
    else:
        # Si no se proporciona el mapeo completo, obtener constraints directamente
        check_map = mapear_check_constraints_por_columna(engine, tabla_nombre)
        constraints = obtener_constraints_tabla(engine, tabla_nombre)
        unique_constraints = constraints.get('unique', [])
    
    # Identificar columnas que forman parte de restricciones UNIQUE
    columnas_unique = set()
    for uc in unique_constraints:
        columnas_unique.update(uc.get('columns', []))
    
    datos = {}
    columnas_procesadas = set()
    
    # Primera pasada: generar valores para todas las columnas
    for col_info in columnas_info:
        col_name = col_info['name']
        
        # Evitar procesar la misma columna dos veces
        if col_name in columnas_procesadas:
            logger.warning(f"Columna duplicada detectada en '{tabla_nombre}': {col_name}. Omitiendo.")
            continue
        
        columnas_procesadas.add(col_name)
        valores = generar_valores_columna(col_info, cantidad, fk_map, ids_referencias, check_map)
        
        if valores is not None:
            datos[col_name] = valores
    
    # Crear DataFrame inicial
    df = pd.DataFrame(datos)
    
    # Si hay restricciones UNIQUE, asegurar que no haya duplicados
    if unique_constraints and len(df) > 0:
        for uc in unique_constraints:
            uc_columns = uc.get('columns', [])
            if not uc_columns:
                continue
            
            # Verificar que todas las columnas del UNIQUE constraint existan en el DataFrame
            columnas_existentes = [col for col in uc_columns if col in df.columns]
            if len(columnas_existentes) != len(uc_columns):
                logger.warning(f"Algunas columnas del UNIQUE constraint '{uc.get('name', '')}' no existen en el DataFrame: {uc_columns}")
                continue
            
            # Eliminar filas duplicadas basadas en las columnas del UNIQUE constraint
            filas_antes = len(df)
            df = df.drop_duplicates(subset=columnas_existentes, keep='first')
            filas_eliminadas = filas_antes - len(df)
            
            if filas_eliminadas > 0:
                logger.warning(f"Eliminadas {filas_eliminadas} filas duplicadas por restricción UNIQUE '{uc.get('name', '')}' en tabla '{tabla_nombre}'")
            
            # Si se eliminaron filas, regenerar valores para las columnas afectadas hasta alcanzar la cantidad deseada
            if len(df) < cantidad:
                faltantes = cantidad - len(df)
                logger.info(f"Regenerando {faltantes} filas adicionales para respetar restricción UNIQUE en '{tabla_nombre}'")
                
                # Generar nuevas combinaciones únicas
                combinaciones_existentes = set()
                for _, row in df.iterrows():
                    combinacion = tuple(row[col] for col in columnas_existentes)
                    combinaciones_existentes.add(combinacion)
                
                nuevas_filas = []
                intentos = 0
                max_intentos = faltantes * 100  # Límite de intentos para evitar loops infinitos
                
                while len(nuevas_filas) < faltantes and intentos < max_intentos:
                    intentos += 1
                    nueva_fila = {}
                    
                    # Generar valores para todas las columnas
                    for col_info in columnas_info:
                        col_name = col_info['name']
                        if col_name in columnas_procesadas:
                            valores = generar_valores_columna(col_info, 1, fk_map, ids_referencias, check_map)
                            if valores is not None and len(valores) > 0:
                                nueva_fila[col_name] = valores[0]
                    
                    # Verificar que la combinación sea única
                    combinacion = tuple(nueva_fila.get(col, None) for col in columnas_existentes)
                    if combinacion not in combinaciones_existentes:
                        combinaciones_existentes.add(combinacion)
                        nuevas_filas.append(nueva_fila)
                
                if nuevas_filas:
                    df_nuevas = pd.DataFrame(nuevas_filas)
                    df = pd.concat([df, df_nuevas], ignore_index=True)
                    logger.info(f"Agregadas {len(nuevas_filas)} nuevas filas únicas a '{tabla_nombre}'")
                else:
                    logger.warning(f"No se pudieron generar suficientes filas únicas para '{tabla_nombre}'. Generadas: {len(df)} de {cantidad}")
    
    # Verificar columnas duplicadas
    if len(df.columns) != len(set(df.columns)):
        columnas_duplicadas = [col for col in df.columns if list(df.columns).count(col) > 1]
        logger.error(f"Columnas duplicadas detectadas en DataFrame para '{tabla_nombre}': {columnas_duplicadas}")
        df = df.loc[:, ~df.columns.duplicated()]
    
    # Validar número de filas
    if len(df) != cantidad:
        logger.warning(f"DataFrame para '{tabla_nombre}' tiene {len(df)} filas, esperadas {cantidad}")
    
    return df

# ================================
# MÓDULO: VALIDACIÓN
# ================================
def verificar_tabla_existe(engine, tabla_nombre: str) -> bool:
    """Verifica si una tabla existe en la base de datos."""
    inspector = inspect(engine)
    tablas = inspector.get_table_names(schema='public')
    return tabla_nombre in tablas

def validar_dependencias_disponibles(tabla: str, mapeo: Dict[str, Dict[str, Any]], ids_referencias: Dict[str, List[int]]) -> bool:
    """Valida que todas las dependencias de una tabla tengan IDs disponibles."""
    info_tabla = mapeo.get(tabla, {})
    dependencias = info_tabla.get('dependencias', [])
    
    for tabla_ref, _ in dependencias:
        if tabla_ref not in ids_referencias or not ids_referencias[tabla_ref]:
            logger.error(f"Tabla '{tabla}' requiere '{tabla_ref}' pero no hay IDs disponibles")
            return False
    
    return True

def validar_dataframe_not_null(df: pd.DataFrame, tabla: str, constraints: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Valida que las columnas NOT NULL no tengan valores NULL."""
    if constraints.get('not_null'):
        for col in constraints['not_null']:
            if col in df.columns and df[col].isna().any():
                return False, col
    return True, None

def validar_dataframe_antes_insertar(df: pd.DataFrame, tabla_nombre: str, engine) -> pd.DataFrame:
    """Valida y limpia el DataFrame antes de insertar."""
    if df.empty:
        raise ValueError(f"DataFrame vacío para tabla '{tabla_nombre}'")
    
    # Verificar columnas duplicadas
    if len(df.columns) != len(set(df.columns)):
        logger.warning(f"Columnas duplicadas en DataFrame para '{tabla_nombre}'. Eliminando duplicados...")
        df = df.loc[:, ~df.columns.duplicated()]
    
    # Validar que las columnas existan en la tabla
    inspector = inspect(engine)
    columnas_tabla = [col['name'] for col in inspector.get_columns(tabla_nombre, schema='public')]
    columnas_df = set(df.columns)
    columnas_inexistentes = columnas_df - set(columnas_tabla)
    
    if columnas_inexistentes:
        logger.warning(f"Columnas en DataFrame que no existen en tabla '{tabla_nombre}': {columnas_inexistentes}. Eliminando...")
        df = df.drop(columns=list(columnas_inexistentes))
    
    if df.empty:
        raise ValueError(f"DataFrame vacío después de validación para tabla '{tabla_nombre}'")
    
    return df

# ================================
# MÓDULO: INSERCIÓN DE DATOS
# ================================
def obtener_ids_insertados(engine, tabla_nombre: str, id_max_antes: int, cantidad: int) -> List[int]:
    """Obtiene los IDs de los registros insertados."""
    inspector = inspect(engine)
    pk_constraint = inspector.get_pk_constraint(tabla_nombre, schema='public')
    pk_columns = pk_constraint.get('constrained_columns', [])
    pk_column = pk_columns[0] if pk_columns else None
    
    if not pk_column:
        return []
    
    ids = []
    with engine.connect() as conn:
        query = text(f"SELECT {pk_column} FROM {tabla_nombre} WHERE {pk_column} > :id_max ORDER BY {pk_column} LIMIT :limit")
        result = conn.execute(query, {"id_max": id_max_antes, "limit": cantidad})
        ids = [row[0] for row in result]
    
    return ids

def obtener_id_maximo(engine, tabla_nombre: str) -> int:
    """Obtiene el ID máximo actual de una tabla."""
    inspector = inspect(engine)
    pk_constraint = inspector.get_pk_constraint(tabla_nombre, schema='public')
    pk_columns = pk_constraint.get('constrained_columns', [])
    pk_column = pk_columns[0] if pk_columns else None
    
    if not pk_column:
        return 0
    
    with engine.connect() as conn:
        query_max = text(f"SELECT COALESCE(MAX({pk_column}), 0) FROM {tabla_nombre}")
        result_max = conn.execute(query_max)
        return result_max.scalar() or 0

def insertar_datos_tabla(engine, tabla_nombre: str, df: pd.DataFrame, chunksize: int = 1000) -> List[int]:
    """Inserta datos en una tabla y retorna los IDs generados."""
    try:
        # Validar DataFrame antes de insertar
        df = validar_dataframe_antes_insertar(df, tabla_nombre, engine)
        
        # Obtener ID máximo antes de insertar
        id_max_antes = obtener_id_maximo(engine, tabla_nombre)
        
        # Insertar datos
        df.to_sql(
            name=tabla_nombre,
            con=engine,
            if_exists='append',
            index=False,
            chunksize=chunksize,
            method='multi'
        )
        
        # Obtener IDs insertados
        ids = obtener_ids_insertados(engine, tabla_nombre, id_max_antes, len(df))
        
        logger.info(f"Datos insertados en '{tabla_nombre}': {len(df)} registros")
        return ids
        
    except Exception as e:
        error_msg = str(e)
        if len(error_msg) > 500:
            error_msg = error_msg[:500] + "..."
        logger.error(f"Error insertando datos en '{tabla_nombre}': {error_msg}")
        raise

# ================================
# MÓDULO: MANEJO DE ERRORES
# ================================
def identificar_error_detallado(error: Exception, tabla: str, df: pd.DataFrame = None) -> Dict[str, Any]:
    """Identifica y detalla el tipo de error ocurrido."""
    mensaje_error_completo = str(error)
    mensaje_error_corto = mensaje_error_completo[:500] + "..." if len(mensaje_error_completo) > 500 else mensaje_error_completo
    mensaje_error_lower = mensaje_error_completo.lower()
    
    error_info = {
        'tabla': tabla,
        'tipo_error': type(error).__name__,
        'mensaje': mensaje_error_corto,
        'mensaje_completo': mensaje_error_completo,
        'detalles': {}
    }
    
    # Identificar tipo de error común
    if 'foreign key' in mensaje_error_lower or 'constraint' in mensaje_error_lower:
        error_info['tipo'] = 'foreign_key_violation'
        error_info['detalles']['descripcion'] = 'Violación de foreign key constraint'
    elif 'not null' in mensaje_error_lower or 'null' in mensaje_error_lower:
        error_info['tipo'] = 'not_null_violation'
        error_info['detalles']['descripcion'] = 'Violación de NOT NULL constraint'
    elif 'unique' in mensaje_error_lower or 'duplicate' in mensaje_error_lower:
        error_info['tipo'] = 'unique_violation'
        error_info['detalles']['descripcion'] = 'Violación de UNIQUE constraint'
    elif 'check' in mensaje_error_lower:
        error_info['tipo'] = 'check_violation'
        error_info['detalles']['descripcion'] = 'Violación de CHECK constraint'
    elif 'table' in mensaje_error_lower and 'does not exist' in mensaje_error_lower:
        error_info['tipo'] = 'table_not_found'
        error_info['detalles']['descripcion'] = 'Tabla no existe en la base de datos'
    elif 'column' in mensaje_error_lower and 'does not exist' in mensaje_error_lower:
        error_info['tipo'] = 'column_not_found'
        error_info['detalles']['descripcion'] = 'Columna no existe en la tabla'
    else:
        error_info['tipo'] = 'unknown_error'
        error_info['detalles']['descripcion'] = 'Error desconocido'
    
    if df is not None:
        error_info['detalles']['filas_intentadas'] = len(df)
        error_info['detalles']['columnas'] = list(df.columns)[:20]
    
    return error_info

def log_error_detallado(error_info: Dict[str, Any], tabla: str):
    """Registra un error de forma segura."""
    logger.error("=" * 80)
    logger.error(f"ERROR en tabla '{tabla}':")
    logger.error(f"  Tipo: {error_info.get('tipo', 'unknown')}")
    try:
        mensaje = error_info.get('mensaje', 'Sin mensaje')
        if len(mensaje) > 200:
            mensaje = mensaje[:200] + "..."
        logger.error(f"  Mensaje: {mensaje}")
    except Exception:
        logger.error(f"  Mensaje: Error al procesar mensaje (muy largo)")
    try:
        detalles_str = str(error_info.get('detalles', {}))[:200]
        logger.error(f"  Detalles: {detalles_str}")
    except Exception:
        logger.error(f"  Detalles: Error al procesar detalles")
    logger.error("=" * 80)

# ================================
# MÓDULO: PROCESO DE INSERCIÓN
# ================================
def procesar_tabla_insercion(engine, tabla: str, mapeo_completo: Dict[str, Dict[str, Any]], 
                             ids_referencias: Dict[str, List[int]], cantidad: int) -> Tuple[bool, Optional[List[int]], Optional[Dict[str, Any]]]:
    """Procesa la inserción de una tabla individual. Retorna (exito, ids, error_info)."""
    try:
        # Verificar que la tabla existe
        if not verificar_tabla_existe(engine, tabla):
            error_info = {
                'tabla': tabla,
                'tipo': 'table_not_found',
                'mensaje': f"Tabla '{tabla}' no existe en la base de datos"
            }
            return False, None, error_info
        
        # Validar dependencias
        if not validar_dependencias_disponibles(tabla, mapeo_completo, ids_referencias):
            error_info = {
                'tabla': tabla,
                'tipo': 'missing_dependencies',
                'mensaje': f"Faltan dependencias para tabla '{tabla}'"
            }
            return False, None, error_info
        
        info_tabla = mapeo_completo[tabla]
        es_relacional = info_tabla['es_relacional']
        cantidad_actual = min(cantidad, 500) if es_relacional else cantidad
        
        # Generar datos (pasar mapeo_completo para obtener CHECK constraints)
        logger.info(f"[SECUENCIAL] Generando {cantidad_actual} registros para tabla '{tabla}'...")
        df = generar_datos_tabla(engine, tabla, cantidad_actual, ids_referencias, mapeo_completo)
        
        if df.empty:
            error_info = {
                'tabla': tabla,
                'tipo': 'no_data_generated',
                'mensaje': f"No se generaron datos para tabla '{tabla}'"
            }
            return False, None, error_info
        
        # Validar constraints NOT NULL
        constraints = info_tabla['constraints']
        valido, columna_problema = validar_dataframe_not_null(df, tabla, constraints)
        if not valido:
            error_info = {
                'tabla': tabla,
                'tipo': 'not_null_violation',
                'mensaje': f"Columna NOT NULL '{columna_problema}' en tabla '{tabla}' tiene valores NULL",
                'columna': columna_problema
            }
            return False, None, error_info
        
        # Insertar datos
        logger.info(f"[SECUENCIAL] Insertando {len(df)} registros en '{tabla}'...")
        ids = insertar_datos_tabla(engine, tabla, df)
        
        if ids:
            logger.info(f"Insertados {len(ids)} registros en '{tabla}' (IDs: {min(ids)}-{max(ids)})")
        else:
            logger.info(f"Insertados {len(df)} registros en '{tabla}' (sin PK para obtener IDs)")
        
        return True, ids, None
        
    except Exception as e:
        error_info = identificar_error_detallado(e, tabla)
        return False, None, error_info

def procesar_nivel_insercion(engine, nivel: List[str], nivel_num: int, mapeo_completo: Dict[str, Dict[str, Any]], 
                             ids_referencias: Dict[str, List[int]], cantidad: int) -> Tuple[Dict[str, List[int]], List[str], List[Dict[str, Any]]]:
    """Procesa la inserción de un nivel completo de tablas."""
    tablas_completadas = []
    tablas_pendientes = []
    errores_encontrados = []
    
    logger.info("=" * 80)
    logger.info(f"NIVEL {nivel_num}: Insertando {len(nivel)} tablas...")
    logger.info("=" * 80)
    
    for tabla in nivel:
        exito, ids, error_info = procesar_tabla_insercion(engine, tabla, mapeo_completo, ids_referencias, cantidad)
        
        if exito:
            if ids:
                ids_referencias[tabla] = ids
            tablas_completadas.append(tabla)
        else:
            if error_info:
                errores_encontrados.append(error_info)
                log_error_detallado(error_info, tabla)
            tablas_pendientes.append(tabla)
    
    return ids_referencias, tablas_pendientes, errores_encontrados

def reintentar_tablas_pendientes(engine, tablas_pendientes: List[str], mapeo_completo: Dict[str, Dict[str, Any]], 
                                 ids_referencias: Dict[str, List[int]], cantidad: int, max_reintentos: int = 3) -> Tuple[List[str], List[Dict[str, Any]]]:
    """Reintenta la inserción de tablas pendientes."""
    if not tablas_pendientes:
        return [], []
    
    logger.info("=" * 80)
    logger.info(f"Reintentando {len(tablas_pendientes)} tablas pendientes...")
    logger.info("=" * 80)
    
    errores_adicionales = []
    reintentos = 0
    
    while tablas_pendientes and reintentos < max_reintentos:
        reintentos += 1
        logger.info(f"Intento {reintentos} de {max_reintentos}...")
        
        tablas_a_reintentar = tablas_pendientes.copy()
        tablas_pendientes = []
        
        for tabla in tablas_a_reintentar:
            exito, ids, error_info = procesar_tabla_insercion(engine, tabla, mapeo_completo, ids_referencias, cantidad)
            
            if exito:
                if ids:
                    ids_referencias[tabla] = ids
                logger.info(f"Reintento exitoso: Tabla '{tabla}' insertada correctamente")
            else:
                if error_info:
                    errores_adicionales.append(error_info)
                    logger.warning(f"Error en reintento de '{tabla}': {error_info.get('mensaje', 'Error desconocido')[:100]}")
                tablas_pendientes.append(tabla)
    
    return tablas_pendientes, errores_adicionales

def mostrar_resumen_final(tablas_completadas: List[str], tablas_pendientes: List[str], errores_encontrados: List[Dict[str, Any]]):
    """Muestra el resumen final del proceso de inserción."""
    logger.info("=" * 80)
    logger.info("RESUMEN FINAL")
    logger.info("=" * 80)
    logger.info(f"Tablas completadas: {len(tablas_completadas)}")
    logger.info(f"Tablas pendientes: {len(tablas_pendientes)}")
    logger.info(f"Errores encontrados: {len(errores_encontrados)}")
    logger.info("=" * 80)
    
    if tablas_completadas:
        logger.info(f"Tablas completadas exitosamente: {sorted(tablas_completadas)}")
    
    if tablas_pendientes:
        logger.warning(f"Tablas pendientes: {sorted(tablas_pendientes)}")
    
    if errores_encontrados:
        logger.error("Errores encontrados:")
        for error in errores_encontrados:
            try:
                tabla = error.get('tabla', 'desconocida')
                tipo = error.get('tipo', 'unknown')
                mensaje = error.get('mensaje', 'Sin mensaje')
                if len(mensaje) > 200:
                    mensaje = mensaje[:200] + "..."
                logger.error(f"  - {tabla}: {tipo} - {mensaje}")
            except Exception as e:
                logger.error(f"  - Error al procesar información de error: {str(e)[:100]}")
    
    logger.info("=" * 80)

# ================================
# FUNCIÓN PRINCIPAL
# ================================
def insertar_1000_registros_principales():
    """Inserta 1000 registros en las tablas principales respetando dependencias y constraints.
    
    Inserta en secuencia, identifica errores y reintenta pendientes.
    """
    engine = obtener_engine()
    inicializar_automap(engine)
    
    # Mapear todas las dependencias y constraints
    logger.info("=" * 80)
    logger.info("Mapeando dependencias y constraints de todas las tablas...")
    logger.info("=" * 80)
    
    mapeo_completo = mapear_todas_dependencias(engine)
    
    logger.info(f"Total de tablas mapeadas: {len(mapeo_completo)}")
    for tabla, info in mapeo_completo.items():
        logger.info(f"  - {tabla}: {len(info['dependencias'])} dependencias, "
                   f"{len(info['constraints']['check'])} CHECK constraints, "
                   f"{len(info['constraints']['not_null'])} NOT NULL columns")
    
    # Calcular orden topológico
    logger.info("=" * 80)
    logger.info("Calculando orden topológico de inserción...")
    logger.info("=" * 80)
    
    niveles = orden_topologico(mapeo_completo)
    
    logger.info(f"Orden de inserción calculado: {len(niveles)} niveles")
    for i, nivel in enumerate(niveles, 1):
        logger.info(f"  Nivel {i}: {nivel}")
    
    # Inicializar variables de control
    ids_referencias = {}
    cantidad = 1000
    tablas_completadas = []
    tablas_pendientes = []
    errores_encontrados = []
    
    # Insertar tablas nivel por nivel EN SECUENCIA
    logger.info("=" * 80)
    logger.info("Iniciando inserción masiva de datos (SECUENCIAL)...")
    logger.info("=" * 80)
    
    for nivel_num, nivel in enumerate(niveles, 1):
        ids_referencias, pendientes_nivel, errores_nivel = procesar_nivel_insercion(
            engine, nivel, nivel_num, mapeo_completo, ids_referencias, cantidad
        )
        tablas_completadas.extend([t for t in nivel if t not in pendientes_nivel])
        tablas_pendientes.extend(pendientes_nivel)
        errores_encontrados.extend(errores_nivel)
    
    # Reintentar tablas pendientes
    if tablas_pendientes:
        pendientes_finales, errores_reintento = reintentar_tablas_pendientes(
            engine, tablas_pendientes, mapeo_completo, ids_referencias, cantidad
        )
        tablas_completadas.extend([t for t in tablas_pendientes if t not in pendientes_finales])
        tablas_pendientes = pendientes_finales
        errores_encontrados.extend(errores_reintento)
    
    # Mostrar resumen final
    mostrar_resumen_final(tablas_completadas, tablas_pendientes, errores_encontrados)
    
    if tablas_pendientes:
        raise RuntimeError(f"Inserción incompleta. {len(tablas_pendientes)} tablas pendientes: {sorted(tablas_pendientes)}")

# ================================
# ENTRADA PRINCIPAL
# ================================
if __name__ == "__main__":
    print("=" * 80)
    print("Script de inserción masiva de datos usando SQLAlchemy y Pandas")
    print("=" * 80)
    print("Iniciando inserción de 1000 registros en tablas principales (SECUENCIAL)...")
    print("=" * 80)
    
    try:
        insertar_1000_registros_principales()
        print("=" * 80)
        print("Proceso completado exitosamente")
        print("=" * 80)
    except Exception as e:
        logger.error("=" * 80)
        logger.error(f"Error en el proceso principal: {e}")
        logger.error("=" * 80)
        raise
