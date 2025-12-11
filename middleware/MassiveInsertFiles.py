import os
import random
import re
import logging
from datetime import datetime, timedelta
from urllib.parse import quote_plus
from typing import Dict, List, Optional, Tuple, Any

# Importar dependencias usando módulo común
from dependencies_common import importar_sqlalchemy, importar_pandas

# Importar SQLAlchemy
create_engine, text, inspect, _, sessionmaker, automap_base = importar_sqlalchemy()

# Importar Pandas
pd, np = importar_pandas()

# ================================
# CONFIGURACIÓN Y LOGGING
# ================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Importar módulo de orden topológico
try:
    from TopologicalOrder import (
        obtener_dependencias_tabla as obtener_dependencias_tabla_topological,
        mapear_todas_dependencias as mapear_todas_dependencias_topological,
        orden_topologico as orden_topologico_topological,
        obtener_prioridad_tabla,
        TABLAS_IGNORAR as TOPOLOGICAL_TABLAS_IGNORAR
    )
    TOPOLOGICAL_ORDER_AVAILABLE = True
except ImportError:
    TOPOLOGICAL_ORDER_AVAILABLE = False
    logger.warning("TopologicalOrder.py no disponible, usando implementación local")

# Importar funciones comunes de base de datos
from db_common import (
    obtener_engine,
    inicializar_automap,
    obtener_modelo,
    Base,
    MODELS
)

# Importar funciones comunes de secuencias
from sequence_common import (
    obtener_columnas_con_secuencia as _obtener_columnas_con_secuencia_common,
    obtener_id_maximo as _obtener_id_maximo_common,
    sincronizar_secuencia_tabla as _sincronizar_secuencia_tabla_common,
    verificar_sincronizacion_secuencia,
    manejar_error_secuencia,
    es_error_secuencia
)

# Re-exports para compatibilidad con tests y código existente
obtener_columnas_con_secuencia = _obtener_columnas_con_secuencia_common
obtener_id_maximo = _obtener_id_maximo_common
sincronizar_secuencia_tabla = _sincronizar_secuencia_tabla_common

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
    """
    Mapea todas las dependencias y constraints de todas las tablas.
    Usa TopologicalOrder.py si está disponible, sino usa implementación local.
    """
    # Intentar usar el módulo TopologicalOrder si está disponible
    if TOPOLOGICAL_ORDER_AVAILABLE:
        try:
            mapeo_topological = mapear_todas_dependencias_topological(engine)
            # Enriquecer con información adicional que necesita MassiveInsertFiles
            inspector = inspect(engine)
            for tabla in mapeo_topological:
                constraints = obtener_constraints_tabla(engine, tabla)
                check_map = mapear_check_constraints_por_columna(engine, tabla)
                
                # Log informativo de CHECK constraints encontrados
                if check_map:
                    for columna, valores in check_map.items():
                        logger.info(f"CHECK constraint detectado para '{tabla}.{columna}': valores permitidos = {valores}")
                
                # Agregar información adicional al mapeo
                mapeo_topological[tabla]['constraints'] = constraints
                mapeo_topological[tabla]['check_map'] = check_map
                # Mantener compatibilidad: 'dependencias' debe incluir todas las dependencias
                # (no solo las válidas)
                if 'dependencias' not in mapeo_topological[tabla]:
                    mapeo_topological[tabla]['dependencias'] = mapeo_topological[tabla].get('dependencias_validas', [])
            
            return mapeo_topological
        except Exception as e:
            logger.warning(f"Error usando TopologicalOrder, usando implementación local: {e}")
    
    # Implementación local (fallback)
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
    """
    Calcula el orden topológico de inserción de tablas usando algoritmo de Kahn.
    Usa TopologicalOrder.py si está disponible, sino usa implementación local.
    """
    # Intentar usar el módulo TopologicalOrder si está disponible
    if TOPOLOGICAL_ORDER_AVAILABLE:
        try:
            # Asegurar que el mapeo tenga la estructura esperada por TopologicalOrder
            mapeo_para_topological = {}
            for tabla, info in mapeo_completo.items():
                mapeo_para_topological[tabla] = {
                    'dependencias_validas': info.get('dependencias_validas', info.get('dependencias', [])),
                    'dependencias_nullable': info.get('dependencias_nullable', []),
                    'tablas_dependientes': info.get('tablas_dependientes', [])
                }
            
            return orden_topologico_topological(mapeo_para_topological, considerar_nullable=True)
        except Exception as e:
            logger.warning(f"Error usando TopologicalOrder, usando implementación local: {e}")
    
    # Implementación local (fallback) - CORREGIDA para filtrar dependencias no mapeadas
    niveles = []
    tablas_restantes = set(mapeo_completo.keys())
    grados_entrada = {}
    
    # Calcular grados de entrada SOLO para dependencias válidas (tablas mapeadas)
    for tabla, info in mapeo_completo.items():
        # Usar dependencias_validas si está disponible, sino filtrar manualmente
        if 'dependencias_validas' in info:
            dependencias_a_contar = info['dependencias_validas']
        else:
            # Filtrar dependencias que apuntan a tablas no mapeadas
            dependencias_a_contar = [
                (tabla_ref, col) for tabla_ref, col in info.get('dependencias', [])
                if tabla_ref in mapeo_completo
            ]
        
        # Excluir auto-referencias del conteo inicial
        dependencias_sin_auto = [
            (tabla_ref, col) for tabla_ref, col in dependencias_a_contar
            if tabla_ref.lower() != tabla.lower()
        ]
        
        grados_entrada[tabla] = len(dependencias_sin_auto)
    
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
            for tabla_dep in mapeo_completo[tabla].get('tablas_dependientes', []):
                if tabla_dep in grados_entrada:
                    grados_entrada[tabla_dep] -= 1
                    if grados_entrada[tabla_dep] < 0:
                        grados_entrada[tabla_dep] = 0
        
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
                           ids_referencias: Dict[str, List[int]], check_map: Dict[str, List[str]] = None,
                           engine=None, tabla_nombre: str = None) -> List[Any]:
    """Genera valores para una columna específica."""
    if check_map is None:
        check_map = {}
    
    col_name = col_info['name']
    tipo = str(col_info['type'])
    nullable = col_info.get('nullable', True)
    default = col_info.get('default')
    autoincrement = col_info.get('autoincrement', False)
    
    # Detectar si es una columna "activo" o "nombre" (nunca pueden ser NULL)
    col_name_lower = col_name.lower()
    es_columna_activo = 'activo' in col_name_lower
    es_columna_nombre = 'nombre' in col_name_lower
    
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
    
    # Para columnas "activo", siempre generar valores booleanos (True/False), nunca NULL
    if es_columna_activo:
        return [random.choice([True, False]) for _ in range(cantidad)]
    
    # Para columnas "nombre", siempre generar valores de texto, nunca NULL
    if es_columna_nombre:
        # Caso especial: LOTE_NOMBRE - generar nombres secuenciales "Lote 001", "Lote 002", etc.
        if tabla_nombre and tabla_nombre.lower() == 'lote' and col_name_lower == 'lote_nombre':
            if engine:
                try:
                    # Obtener el ID máximo actual de LOTE para continuar la secuencia
                    id_maximo = obtener_id_maximo(engine, 'lote')
                    nombres_generados = []
                    for i in range(cantidad):
                        numero = str(id_maximo + i + 1).zfill(3)  # Formato 001, 002, etc.
                        nombres_generados.append(f"Lote {numero}")
                    return nombres_generados
                except Exception as e:
                    logger.warning(f"Error obteniendo ID máximo para LOTE_NOMBRE: {e}. Usando nombres aleatorios.")
            # Fallback: si no hay engine o falla la consulta, usar nombres aleatorios
            nombres_generados = []
            for i in range(cantidad):
                numero = str(i + 1).zfill(3)
                nombres_generados.append(f"Lote {numero}")
            return nombres_generados
        
        # Para otras columnas "nombre", generar nombres aleatorios de longitud razonable
        nombres_generados = []
        for _ in range(cantidad):
            longitud = random.randint(5, 30)
            nombre = ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=longitud))
            nombres_generados.append(nombre)
        return nombres_generados
    
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
    
    # Obtener columnas con secuencias para excluirlas
    columnas_con_secuencia = obtener_columnas_con_secuencia(engine, tabla_nombre)
    
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
        
        # Excluir columnas con secuencias del DataFrame
        # PostgreSQL las generará automáticamente cuando no se incluyan en el INSERT
        col_name_lower = col_name.lower()
        if any(col_name_lower == c.lower() for c in columnas_con_secuencia):
            logger.debug(f"Excluyendo columna con secuencia '{col_name}' de tabla '{tabla_nombre}' (será generada por PostgreSQL)")
            continue
        
        # También manejar columnas que son primary keys y tienen tipo integer/bigint
        # si no están ya en la lista de columnas con secuencia
        if col_name.lower().endswith('_id') and ('int' in str(col_info.get('type', '')).lower()):
            # Verificar si es primary key
            inspector = inspect(engine)
            try:
                pk_constraint = inspector.get_pk_constraint(tabla_nombre, schema='public')
                pk_columns = pk_constraint.get('constrained_columns', [])
                if col_name in pk_columns or col_name.upper() in [c.upper() for c in pk_columns]:
                    # Verificar si tiene secuencia
                    if not any(col_name_lower == c.lower() for c in columnas_con_secuencia):
                        # Si es PK pero no tiene secuencia detectada, intentar incluirla con None
                        logger.debug(f"Incluyendo columna PK '{col_name}' en tabla '{tabla_nombre}' con valores None (probablemente tiene secuencia)")
                        datos[col_name] = [None] * cantidad
                        columnas_procesadas.add(col_name)
                        continue
            except:
                pass
        
        columnas_procesadas.add(col_name)
        valores = generar_valores_columna(col_info, cantidad, fk_map, ids_referencias, check_map, engine, tabla_nombre)
        
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
                            valores = generar_valores_columna(col_info, 1, fk_map, ids_referencias, check_map, engine, tabla_nombre)
                            if valores is not None and len(valores) > 0:
                                nueva_fila[col_name] = valores[0]
                    
                    # Verificar que la combinación sea única
                    combinacion = tuple(nueva_fila.get(col, None) for col in columnas_existentes)
                    if combinacion not in combinaciones_existentes:
                        combinaciones_existentes.add(combinacion)
                        nuevas_filas.append(nueva_fila)
                
                if nuevas_filas and len(nuevas_filas) > 0:
                    df_nuevas = pd.DataFrame(nuevas_filas)
                    # Verificar que df_nuevas tenga datos válidos antes de concatenar (evita FutureWarning)
                    # Filtrar filas que no sean completamente NA antes de concatenar
                    if not df_nuevas.empty:
                        # Eliminar columnas que sean completamente NA antes de concatenar
                        df_nuevas_clean = df_nuevas.dropna(axis=1, how='all')
                        if not df_nuevas_clean.empty:
                            df = pd.concat([df, df_nuevas_clean], ignore_index=True)
                            logger.info(f"Agregadas {len(nuevas_filas)} nuevas filas únicas a '{tabla_nombre}'")
                        else:
                            logger.warning(f"DataFrame df_nuevas solo contiene columnas NA para '{tabla_nombre}'")
                    else:
                        logger.warning(f"DataFrame df_nuevas está vacío para '{tabla_nombre}'")
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
    """Valida que todas las dependencias NO NULLABLE de una tabla tengan IDs disponibles."""
    info_tabla = mapeo.get(tabla, {})
    dependencias = info_tabla.get('dependencias', [])
    dependencias_nullable = set(info_tabla.get('dependencias_nullable', []))
    
    for tabla_ref, columna_fk in dependencias:
        # Solo requerir IDs para dependencias que NO son nullable
        if (tabla_ref, columna_fk) not in dependencias_nullable:
            if tabla_ref not in ids_referencias or not ids_referencias[tabla_ref]:
                logger.error(f"Tabla '{tabla}' requiere '{tabla_ref}' (columna '{columna_fk}' es NOT NULL) pero no hay IDs disponibles")
                return False
    
    return True

def validar_dataframe_not_null(df: pd.DataFrame, tabla: str, constraints: Dict[str, Any], engine=None, columnas_con_secuencia: List[str] = None) -> Tuple[bool, Optional[str]]:
    """Valida que las columnas NOT NULL no tengan valores NULL, excepto columnas con secuencias."""
    if columnas_con_secuencia is None and engine is not None:
        columnas_con_secuencia = obtener_columnas_con_secuencia(engine, tabla)
    
    if constraints.get('not_null'):
        for col in constraints['not_null']:
            # Permitir NULL en columnas con secuencias (PostgreSQL las generará automáticamente)
            if columnas_con_secuencia and any(col.lower() == c.lower() for c in columnas_con_secuencia):
                continue
            
            if col in df.columns and df[col].isna().any():
                return False, col
    return True, None

def validar_dataframe_antes_insertar(df: pd.DataFrame, tabla_nombre: str, engine, columnas_con_secuencia: List[str] = None) -> pd.DataFrame:
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
    
    # Intentar obtener PK con diferentes variantes del nombre de tabla
    pk_constraint = None
    pk_columns = []
    for tabla_variant in [tabla_nombre, tabla_nombre.lower(), tabla_nombre.upper()]:
        try:
            pk_constraint = inspector.get_pk_constraint(tabla_variant, schema='public')
            pk_columns = pk_constraint.get('constrained_columns', [])
            if pk_columns:
                break
        except:
            continue
    
    pk_column = pk_columns[0] if pk_columns else None
    
    if not pk_column:
        return []
    
    ids = []
    with engine.connect() as conn:
        # Usar el nombre de tabla tal como está en la BD (probablemente en mayúsculas)
        # Intentar con diferentes variantes
        for tabla_variant in [tabla_nombre.upper(), tabla_nombre.lower(), tabla_nombre]:
            try:
                query = text(f"SELECT {pk_column} FROM {tabla_variant} WHERE {pk_column} > :id_max ORDER BY {pk_column} LIMIT :limit")
                result = conn.execute(query, {"id_max": id_max_antes, "limit": cantidad})
                ids = [row[0] for row in result]
                if ids:
                    break
            except:
                continue
    
    return ids

def insertar_datos_tabla(engine, tabla_nombre: str, df: pd.DataFrame, chunksize: int = 1000) -> List[int]:
    """Inserta datos en una tabla y retorna los IDs generados."""
    try:
        # Validar DataFrame antes de insertar
        columnas_con_secuencia = obtener_columnas_con_secuencia(engine, tabla_nombre)
        df = validar_dataframe_antes_insertar(df, tabla_nombre, engine, columnas_con_secuencia)
        
        # Obtener ID máximo antes de insertar
        id_max_antes = obtener_id_maximo(engine, tabla_nombre)
        
        # Obtener columnas con secuencia para usar DEFAULT
        columnas_con_secuencia_lower = [c.lower() for c in columnas_con_secuencia]
        
        # Usar SQLAlchemy Core directamente para insertar con DEFAULT en columnas con secuencia
        from sqlalchemy import Table, MetaData, insert as sql_insert
        
        metadata = MetaData()
        table = Table(tabla_nombre, metadata, autoload_with=engine, schema='public')
        
        # Preparar datos para inserción
        rows_to_insert = []
        for _, row in df.iterrows():
            row_dict = {}
            # Solo incluir columnas que están en el DataFrame
            # Convertir NaT (Not a Time) de pandas a None
            for col in df.columns:
                val = row[col]
                if pd.isna(val):
                    val = None
                row_dict[col] = val
            rows_to_insert.append(row_dict)
        
        # Insertar en lotes usando SQL directo con nextval() para columnas con secuencia
        with engine.connect() as conn:
            # Obtener nombres de secuencias para cada columna con secuencia
            secuencias_map = {}
            for col_secuencia in columnas_con_secuencia:
                seq_name = None
                try:
                    # Método 1: Intentar obtener el nombre de la secuencia usando pg_get_serial_sequence
                    for tabla_variant in [tabla_nombre.upper(), tabla_nombre.lower(), tabla_nombre]:
                        try:
                            query_seq = text(f"SELECT pg_get_serial_sequence('{tabla_variant}', '{col_secuencia}')")
                            seq_name = conn.execute(query_seq).scalar()
                            if seq_name:
                                break
                        except:
                            continue
                    
                    # Método 2: Si pg_get_serial_sequence no funciona, buscar secuencias por nombre
                    if not seq_name:
                        # Buscar secuencias que coincidan con el patrón tabla_seq o tabla_columna_seq
                        patterns = [
                            f"{tabla_nombre.lower()}_seq",
                            f"{tabla_nombre.lower()}_{col_secuencia.lower()}_seq",
                            f"{tabla_nombre.upper()}_seq",
                            f"{tabla_nombre.upper()}_{col_secuencia.upper()}_seq"
                        ]
                        for pattern in patterns:
                            query_seq_search = text("""
                                SELECT sequence_name
                                FROM information_schema.sequences
                                WHERE sequence_schema = 'public'
                                    AND sequence_name = :pattern
                            """)
                            seq_result = conn.execute(query_seq_search, {"pattern": pattern}).fetchone()
                            if seq_result:
                                seq_name = seq_result[0]
                                # Agregar schema si es necesario
                                if '.' not in seq_name:
                                    seq_name = f"public.{seq_name}"
                                break
                    
                    if seq_name:
                        # Usar el nombre completo de la secuencia (incluyendo schema si existe)
                        secuencias_map[col_secuencia] = seq_name
                    else:
                        # Si no encontramos la secuencia, usar None para indicar que usaremos DEFAULT
                        logger.warning(f"No se encontró secuencia para {col_secuencia} en {tabla_nombre}, se usará DEFAULT")
                        secuencias_map[col_secuencia] = None
                except Exception as e:
                    # Si falla, usar None para indicar que usaremos DEFAULT
                    logger.warning(f"Error obteniendo secuencia para {col_secuencia} en {tabla_nombre}: {e}. Se usará DEFAULT")
                    secuencias_map[col_secuencia] = None
            
            # Construir INSERT SQL INCLUYENDO columnas con secuencia usando DEFAULT explícitamente
            # Esto garantiza que PostgreSQL use el DEFAULT configurado (la secuencia)
            columnas_df = list(df.columns)
            columnas_con_secuencia_lower = [c.lower() for c in columnas_con_secuencia]
            # INCLUIR columnas con secuencia para usar DEFAULT explícitamente
            columnas_insert = list(columnas_df)  # Incluir todas las columnas del DataFrame
            for col_secuencia in columnas_con_secuencia:
                if col_secuencia not in columnas_insert:
                    columnas_insert.append(col_secuencia)
            
            for i in range(0, len(rows_to_insert), chunksize):
                batch = rows_to_insert[i:i+chunksize]
                
                # Construir valores para cada fila
                valores_sql = []
                for row_dict in batch:
                    valores_fila = []
                    for col in columnas_insert:
                        # Si es columna con secuencia, usar nextval() explícitamente
                        if col.lower() in columnas_con_secuencia_lower:
                            seq_name = secuencias_map.get(col)
                            if seq_name:
                                # Usar nextval() con el nombre completo de la secuencia
                                valores_fila.append(f"nextval('{seq_name}')")
                            else:
                                # Si no tenemos el nombre de la secuencia, usar DEFAULT
                                valores_fila.append("DEFAULT")
                            continue
                        
                        val = row_dict.get(col)
                        col_lower = col.lower()
                        
                        # Para columnas "activo", asegurar que nunca sea NULL (convertir a False)
                        if 'activo' in col_lower:
                            if val is None or pd.isna(val):
                                val = False
                        
                        # Para columnas "nombre", asegurar que nunca sea NULL (convertir a cadena vacía o generar valor)
                        if 'nombre' in col_lower:
                            if val is None or pd.isna(val) or (isinstance(val, str) and val.strip() == ''):
                                # Generar un nombre por defecto si está vacío
                                import random
                                import string
                                longitud = random.randint(5, 20)
                                val = ''.join(random.choices(string.ascii_letters + string.digits, k=longitud))
                        
                        if val is None:
                            valores_fila.append("NULL")
                        elif isinstance(val, str):
                            # Escapar comillas simples
                            val_escaped = val.replace("'", "''")
                            valores_fila.append(f"'{val_escaped}'")
                        elif isinstance(val, (datetime, pd.Timestamp)):
                            valores_fila.append(f"'{val}'")
                        elif pd.isna(val):
                            valores_fila.append("NULL")
                        elif isinstance(val, bool):
                            # Convertir booleanos a PostgreSQL boolean literal
                            valores_fila.append("TRUE" if val else "FALSE")
                        else:
                            valores_fila.append(str(val))
                    
                    valores_sql.append(f"({', '.join(valores_fila)})")
                
                # Construir y ejecutar INSERT SQL
                # INCLUIR columnas con secuencia usando DEFAULT explícitamente
                columnas_sql = ', '.join([f'"{col}"' for col in columnas_insert])
                valores_sql_str = ', '.join(valores_sql)
                # Usar el nombre de tabla en mayúsculas (formato estándar en esta BD)
                tabla_nombre_upper = tabla_nombre.upper()
                sql_insert_str = f'INSERT INTO {tabla_nombre_upper} ({columnas_sql}) VALUES {valores_sql_str}'
                
                conn.execute(text(sql_insert_str))
            conn.commit()
        
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
        'detalles': {},
        'es_error_secuencia': False
    }
    
    # Identificar tipo de error común
    # IMPORTANTE: Verificar UniqueViolation PRIMERO antes de otros tipos
    if 'unique' in mensaje_error_lower or 'duplicate' in mensaje_error_lower or 'llave duplicada' in mensaje_error_lower:
        error_info['tipo'] = 'unique_violation'
        error_info['detalles']['descripcion'] = 'Violación de UNIQUE constraint'
        # Intentar detectar si es error de secuencia
        # Esto se verificará más tarde con es_error_secuencia, pero marcamos como posible
        error_info['es_error_secuencia'] = True
    elif 'foreign key' in mensaje_error_lower or ('constraint' in mensaje_error_lower and 'foreign' in mensaje_error_lower):
        error_info['tipo'] = 'foreign_key_violation'
        error_info['detalles']['descripcion'] = 'Violación de foreign key constraint'
    elif 'not null' in mensaje_error_lower or ('null' in mensaje_error_lower and 'not' in mensaje_error_lower):
        error_info['tipo'] = 'not_null_violation'
        error_info['detalles']['descripcion'] = 'Violación de NOT NULL constraint'
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
    
    # Intentar extraer información de secuencia del mensaje de error
    import re
    if error_info['tipo'] == 'unique_violation':
        # Buscar ID duplicado en el mensaje
        id_match = re.search(r'\((\d+)\)', mensaje_error_completo)
        if id_match:
            error_info['detalles']['id_duplicado'] = int(id_match.group(1))
        # Buscar nombre de constraint
        constraint_match = re.search(r'constraint\s+["\']?(\w+)["\']?', mensaje_error_lower)
        if constraint_match:
            error_info['detalles']['constraint_nombre'] = constraint_match.group(1)
    
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
        # Obtener columnas con secuencia para la validación
        columnas_con_secuencia = obtener_columnas_con_secuencia(engine, tabla)
        valido, columna_problema = validar_dataframe_not_null(df, tabla, constraints, engine, columnas_con_secuencia)
        if not valido:
            error_info = {
                'tabla': tabla,
                'tipo': 'not_null_violation',
                'mensaje': f"Columna NOT NULL '{columna_problema}' en tabla '{tabla}' tiene valores NULL",
                'columna': columna_problema
            }
            return False, None, error_info
        
        # Sincronizar secuencia de la tabla antes de insertar
        logger.info(f"[{tabla}] Sincronizando secuencia antes de insertar...")
        exito_sync, seq_name, max_val = sincronizar_secuencia_tabla(engine, tabla)
        if exito_sync:
            logger.info(f"[{tabla}] ✓ Secuencia sincronizada correctamente (MAX={max_val})")
        else:
            logger.warning(f"[{tabla}] ⚠ No se pudo sincronizar la secuencia, continuando de todas formas...")
        
        # Verificar sincronización después de sincronizar
        esta_sincronizada, max_id_tabla, last_value, _ = verificar_sincronizacion_secuencia(engine, tabla)
        if not esta_sincronizada:
            logger.warning(f"[{tabla}] ⚠ Secuencia no está sincronizada después de sincronización (MAX tabla={max_id_tabla}, last_value={last_value}). Intentando resincronización forzada...")
            exito_sync, _, _ = sincronizar_secuencia_tabla(engine, tabla, forzar_resincronizacion=True)
            if exito_sync:
                logger.info(f"[{tabla}] ✓ Secuencia resincronizada forzadamente")
        
        # Insertar datos
        logger.info(f"[SECUENCIAL] Insertando {len(df)} registros en '{tabla}'...")
        ids = insertar_datos_tabla(engine, tabla, df)
        
        if ids:
            logger.info(f"Insertados {len(ids)} registros en '{tabla}' (IDs: {min(ids)}-{max(ids)})")
        else:
            logger.info(f"Insertados {len(df)} registros en '{tabla}' (sin PK para obtener IDs)")
        
        return True, ids, None
        
    except Exception as e:
        error_info = identificar_error_detallado(e, tabla, df)
        
        # Intentar manejar error de secuencia de forma inteligente
        cantidad_necesaria = len(df) if df is not None else 0
        exito_recuperacion, ids_existentes, error_info_recuperacion = manejar_error_secuencia(
            engine, e, tabla, cantidad_necesaria, ids_referencias
        )
        
        if exito_recuperacion and ids_existentes:
            logger.info(f"Recuperación exitosa: usando {len(ids_existentes)} IDs existentes de '{tabla}'")
            # Agregar IDs a ids_referencias para que dependientes puedan continuar
            if tabla not in ids_referencias:
                ids_referencias[tabla] = []
            ids_referencias[tabla].extend(ids_existentes)
            return True, ids_existentes, None
        elif error_info_recuperacion:
            # Hay información de recuperación pero no fue exitosa
            error_info.update(error_info_recuperacion)
        
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

def actualizar_descripciones_lotes(engine):
    """Actualiza las descripciones de los lotes con los análisis realmente asociados."""
    from sqlalchemy import text
    
    logger.info("=" * 80)
    logger.info("Actualizando descripciones de lotes con análisis asociados...")
    logger.info("=" * 80)
    
    # Mapeo de tipos de análisis a tablas y columnas
    tipos_analisis = {
        'DOSN': {'tabla': 'DOSN', 'recibo_col': 'RECIBO_ID', 'activo_col': 'DOSN_ACTIVO'},
        'Pureza': {'tabla': 'PUREZA', 'recibo_col': 'RECIBO_ID', 'activo_col': 'PUREZA_ACTIVO'},
        'Germinación': {'tabla': 'GERMINACION', 'recibo_col': 'RECIBO_ID', 'activo_col': 'GERMINACION_ACTIVO'},
        'PMS': {'tabla': 'PMS', 'recibo_col': 'RECIBO_ID', 'activo_col': 'PMS_ACTIVO'},
        'Sanitario': {'tabla': 'SANITARIO', 'recibo_col': 'SANITARIO_RECIBOID', 'activo_col': 'SANITARIO_ACTIVO'},
        'Tetrazolio': {'tabla': 'TETRAZOLIO', 'recibo_col': 'RECIBO_ID', 'activo_col': 'TETRAZOLIO_ACTIVO'},
        'Pureza P. notatum': {'tabla': 'PUREZA_PNOTATUM', 'recibo_col': 'RECIBO_ID', 'activo_col': 'PUREZA_ACTIVO'}
    }
    
    try:
        with engine.connect() as conn:
            # Obtener todos los lotes activos
            query_lotes = text("""
                SELECT LOTE_ID 
                FROM LOTE 
                WHERE LOTE_ACTIVO = true
                ORDER BY LOTE_ID
            """)
            lotes = conn.execute(query_lotes).fetchall()
            
            if not lotes:
                logger.info("No se encontraron lotes activos para actualizar")
                return
            
            logger.info(f"Procesando {len(lotes)} lotes...")
            lotes_actualizados = 0
            
            for (lote_id,) in lotes:
                # Obtener recibos activos asociados al lote
                query_recibos = text("""
                    SELECT RECIBO_ID 
                    FROM RECIBO 
                    WHERE LOTE_ID = :lote_id 
                    AND RECIBO_ACTIVO = true
                """)
                recibos = conn.execute(query_recibos, {"lote_id": lote_id}).fetchall()
                
                if not recibos:
                    # Si no hay recibos, actualizar descripción como "Sin análisis asociados"
                    query_update = text("""
                        UPDATE LOTE 
                        SET LOTE_DESCRIPCION = :descripcion 
                        WHERE LOTE_ID = :lote_id
                    """)
                    conn.execute(query_update, {"lote_id": lote_id, "descripcion": "Sin análisis asociados"})
                    conn.commit()
                    continue
                
                # Para cada recibo, verificar qué análisis tiene asociados
                analisis_encontrados = []
                
                for (recibo_id,) in recibos:
                    # Verificar cada tipo de análisis
                    for nombre_analisis, info in tipos_analisis.items():
                        tabla = info['tabla']
                        recibo_col = info['recibo_col']
                        activo_col = info['activo_col']
                        
                        # Verificar si existe análisis de este tipo para este recibo
                        query_analisis = text(f"""
                            SELECT COUNT(*) 
                            FROM {tabla} 
                            WHERE {recibo_col} = :recibo_id 
                            AND {activo_col} = true
                        """)
                        count = conn.execute(query_analisis, {"recibo_id": recibo_id}).scalar()
                        
                        if count and count > 0:
                            if nombre_analisis not in analisis_encontrados:
                                analisis_encontrados.append(nombre_analisis)
                
                # Construir descripción
                if analisis_encontrados:
                    descripcion = f"Incluye análisis de: {', '.join(analisis_encontrados)}"
                else:
                    descripcion = "Sin análisis asociados"
                
                # Actualizar descripción del lote
                query_update = text("""
                    UPDATE LOTE 
                    SET LOTE_DESCRIPCION = :descripcion 
                    WHERE LOTE_ID = :lote_id
                """)
                conn.execute(query_update, {"lote_id": lote_id, "descripcion": descripcion})
                conn.commit()
                lotes_actualizados += 1
                
                if lotes_actualizados % 100 == 0:
                    logger.info(f"Actualizados {lotes_actualizados}/{len(lotes)} lotes...")
            
            logger.info(f"Descripciones actualizadas exitosamente para {lotes_actualizados} lotes")
            
    except Exception as e:
        logger.warning(f"Error actualizando descripciones de lotes: {e}. Continuando...")
        logger.debug(f"Detalles del error: {e}", exc_info=True)

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
    
    # Importar función de sincronización
    from ImportExcel import asegurar_autoincrementos
    
    # Sincronizar secuencias antes de insertar
    logger.info("=" * 80)
    logger.info("Sincronizando secuencias de autoincremento...")
    logger.info("=" * 80)
    try:
        asegurar_autoincrementos(engine)
        logger.info("Secuencias sincronizadas correctamente")
    except Exception as e:
        logger.warning(f"Error sincronizando secuencias: {e}. Continuando...")
    
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
    
    # El orden topológico ya respeta las prioridades definidas en TopologicalOrder.py:
    # 1. Usuario (prioridad 1)
    # 2. Lote (prioridad 2)
    # 3. Listados (prioridad 3)
    # 4. Recibos (prioridad 4)
    # 5. Análisis (prioridad 5)
    # No es necesario forzar ningún orden, ya que TopologicalOrder.py lo maneja correctamente
    
    logger.info(f"Orden de inserción calculado: {len(niveles)} niveles (con prioridades de TopologicalOrder)")
    for i, nivel in enumerate(niveles, 1):
        # Mostrar prioridades de las tablas en cada nivel
        if TOPOLOGICAL_ORDER_AVAILABLE:
            try:
                prioridades_nivel = [obtener_prioridad_tabla(t) for t in nivel]
                logger.info(f"  Nivel {i} ({len(nivel)} tabla(s)): {nivel}")
                if prioridades_nivel:
                    logger.info(f"    Prioridades: min={min(prioridades_nivel)}, max={max(prioridades_nivel)}")
            except Exception as e:
                logger.warning(f"Error obteniendo prioridades: {e}")
                logger.info(f"  Nivel {i} ({len(nivel)} tabla(s)): {nivel}")
        else:
            logger.info(f"  Nivel {i} ({len(nivel)} tabla(s)): {nivel}")
    
    # Sincronizar específicamente la secuencia de 'lote' antes de insertar
    if 'lote' in mapeo_completo:
        try:
            logger.info("Sincronizando secuencia de 'lote' específicamente...")
            with engine.connect() as conn:
                # Usar el mismo método que en insertar_datos_tabla para obtener la secuencia
                tabla_nombre = 'lote'
                col_secuencia = 'lote_id'
                max_val = 0
                seq_name = None
                
                # Método 1: Intentar obtener el nombre de la secuencia usando pg_get_serial_sequence
                for tabla_variant in [tabla_nombre.upper(), tabla_nombre.lower(), tabla_nombre]:
                    try:
                        query_seq = text(f"SELECT pg_get_serial_sequence('{tabla_variant}', '{col_secuencia}')")
                        seq_name = conn.execute(query_seq).scalar()
                        if seq_name:
                            # Obtener el valor máximo usando la misma variante
                            query_max = text(f'SELECT COALESCE(MAX("{col_secuencia}"), 0) FROM {tabla_variant}')
                            max_val = conn.execute(query_max).scalar()
                            break
                    except:
                        continue
                
                # Método 2: Si pg_get_serial_sequence no funciona, buscar secuencias por nombre
                if not seq_name:
                    patterns = [
                        f"{tabla_nombre.lower()}_seq",
                        f"{tabla_nombre.lower()}_{col_secuencia.lower()}_seq",
                        f"{tabla_nombre.upper()}_seq",
                        f"{tabla_nombre.upper()}_{col_secuencia.upper()}_seq"
                    ]
                    for pattern in patterns:
                        query_seq_search = text("""
                            SELECT sequence_name
                            FROM information_schema.sequences
                            WHERE sequence_schema = 'public'
                                AND sequence_name = :pattern
                        """)
                        seq_result = conn.execute(query_seq_search, {"pattern": pattern}).fetchone()
                        if seq_result:
                            seq_name = seq_result[0]
                            # Agregar schema si es necesario
                            if '.' not in seq_name:
                                seq_name = f"public.{seq_name}"
                            # Obtener el valor máximo
                            query_max = text(f'SELECT COALESCE(MAX("{col_secuencia}"), 0) FROM {tabla_nombre.upper()}')
                            max_val = conn.execute(query_max).scalar()
                            break
                
                if seq_name:
                    # Sincronizar la secuencia
                    query_sync = text(f"SELECT setval('{seq_name}', {max_val}, false)")
                    conn.execute(query_sync)
                    conn.commit()
                    logger.info(f"Secuencia de 'lote' ({seq_name}) sincronizada a {max_val} (próximo valor será {max_val + 1})")
                else:
                    logger.warning("No se encontró la secuencia para 'lote'")
        except Exception as e:
            logger.warning(f"Error sincronizando secuencia de 'lote': {e}. Continuando...")
    
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
    
    # Actualizar descripciones de lotes con análisis asociados
    if 'lote' in tablas_completadas:
        try:
            actualizar_descripciones_lotes(engine)
        except Exception as e:
            logger.warning(f"Error actualizando descripciones de lotes: {e}. Continuando...")
    
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

# ================================
# RE-EXPORTS PARA COMPATIBILIDAD
# ================================
# Mantener re-exports para que código existente que importa desde este módulo siga funcionando
from db_common import Base, MODELS, obtener_engine, inicializar_automap, obtener_modelo
