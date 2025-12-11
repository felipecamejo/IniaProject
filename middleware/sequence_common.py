"""
Módulo común para gestión de secuencias PostgreSQL.

Centraliza la lógica de sincronización, verificación y recuperación de secuencias
para evitar duplicación de código y mejorar el manejo de errores.
"""

import logging
from typing import Dict, List, Optional, Tuple, Any

# Importar dependencias usando módulo común
from dependencies_common import importar_sqlalchemy

# Importar SQLAlchemy
create_engine, text, inspect, _, sessionmaker, automap_base = importar_sqlalchemy()

# ================================
# CONFIGURACIÓN Y LOGGING
# ================================
logger = logging.getLogger(__name__)


# ================================
# FUNCIONES AUXILIARES
# ================================

def obtener_columnas_con_secuencia(engine, tabla_nombre: str) -> List[str]:
    """Obtiene las columnas que tienen secuencias (SERIAL/BIGSERIAL) en PostgreSQL."""
    columnas_con_secuencia = []
    try:
        # Normalizar nombre de tabla a minúsculas para búsqueda consistente
        tabla_normalizada = tabla_nombre.lower()
        
        with engine.connect() as conn:
            # Método 1: Buscar por column_default LIKE 'nextval%'
            query = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public'
                    AND LOWER(table_name) = LOWER(:tabla)
                    AND column_default LIKE 'nextval%'
            """)
            result = conn.execute(query, {"tabla": tabla_nombre})
            columnas_con_secuencia = [row[0] for row in result]
            
            # Método 2: Si no encontramos nada, buscar secuencias por nombre de tabla
            # Las secuencias suelen tener el formato: tabla_seq
            if not columnas_con_secuencia:
                # Buscar secuencias que coincidan con el nombre de la tabla
                query_seq = text("""
                    SELECT sequence_name
                    FROM information_schema.sequences
                    WHERE sequence_schema = 'public'
                        AND sequence_name = :seq_name
                """)
                seq_name_pattern = f"{tabla_normalizada}_seq"
                seq_result = conn.execute(query_seq, {"seq_name": seq_name_pattern}).fetchone()
                
                if seq_result:
                    # Si encontramos una secuencia, buscar columnas que puedan usarla
                    # Generalmente es la columna que termina en _id y es primary key
                    inspector = inspect(engine)
                    try:
                        # Intentar con nombre original y normalizado
                        for tabla_variant in [tabla_nombre, tabla_normalizada, tabla_nombre.upper()]:
                            try:
                                pk_constraint = inspector.get_pk_constraint(tabla_variant, schema='public')
                                pk_columns = pk_constraint.get('constrained_columns', [])
                                if pk_columns:
                                    # Agregar la primera columna PK que termine en _id
                                    for pk_col in pk_columns:
                                        if pk_col.lower().endswith('_id'):
                                            if pk_col not in columnas_con_secuencia:
                                                columnas_con_secuencia.append(pk_col)
                                    break
                            except:
                                continue
                    except Exception as e:
                        logger.debug(f"Error obteniendo PK para {tabla_nombre}: {e}")
                
                # Método 3: Si aún no encontramos nada, usar pg_get_serial_sequence
                if not columnas_con_secuencia:
                    # Obtener todas las columnas que terminan en _id
                    query_cols = text("""
                        SELECT column_name
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                            AND LOWER(table_name) = LOWER(:tabla)
                            AND column_name LIKE '%_id'
                            AND data_type IN ('integer', 'bigint')
                    """)
                    cols_result = conn.execute(query_cols, {"tabla": tabla_nombre})
                    for col_row in cols_result:
                        col_name = col_row[0]
                        # Verificar si tiene secuencia usando pg_get_serial_sequence
                        # Intentar con diferentes variantes del nombre de tabla
                        for tabla_variant in [tabla_nombre.upper(), tabla_normalizada, tabla_nombre]:
                            try:
                                query_pg_seq = text(f"SELECT pg_get_serial_sequence('{tabla_variant}', '{col_name}')")
                                seq_name = conn.execute(query_pg_seq).scalar()
                                if seq_name:
                                    if col_name not in columnas_con_secuencia:
                                        columnas_con_secuencia.append(col_name)
                                    break
                            except:
                                continue
                
    except Exception as e:
        logger.warning(f"Error obteniendo columnas con secuencia para {tabla_nombre}: {e}")
    
    return columnas_con_secuencia


def obtener_id_maximo(engine, tabla_nombre: str, columna_id: str = None) -> int:
    """Obtiene el ID máximo actual de una tabla."""
    inspector = inspect(engine)
    
    # Si no se especifica la columna, obtenerla automáticamente
    if columna_id is None:
        columnas_con_secuencia = obtener_columnas_con_secuencia(engine, tabla_nombre)
        if not columnas_con_secuencia:
            # Intentar obtener PK
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
            if pk_columns:
                columna_id = pk_columns[0]
            else:
                return 0
        else:
            columna_id = columnas_con_secuencia[0]
    
    if not columna_id:
        return 0
    
    with engine.connect() as conn:
        # Intentar con diferentes variantes del nombre de tabla
        for tabla_variant in [tabla_nombre.upper(), tabla_nombre.lower(), tabla_nombre]:
            try:
                # Intentar con comillas primero
                try:
                    query_max = text(f'SELECT COALESCE(MAX("{columna_id}"), 0) FROM {tabla_variant}')
                    result_max = conn.execute(query_max)
                    return result_max.scalar() or 0
                except:
                    # Si falla con comillas, intentar sin comillas
                    query_max = text(f"SELECT COALESCE(MAX({columna_id}), 0) FROM {tabla_variant}")
                    result_max = conn.execute(query_max)
                    return result_max.scalar() or 0
            except:
                continue
    
    return 0


def obtener_nombre_secuencia(engine, tabla_nombre: str, columna_id: str) -> Optional[str]:
    """
    Obtiene el nombre de la secuencia de forma robusta.
    
    Args:
        engine: Engine de SQLAlchemy
        tabla_nombre: Nombre de la tabla
        columna_id: Nombre de la columna con secuencia
    
    Returns:
        Nombre de la secuencia (con schema) o None si no se encuentra
    """
    seq_name = None
    
    with engine.connect() as conn:
        # Método 1: Intentar obtener el nombre de la secuencia usando pg_get_serial_sequence
        for tabla_variant in [tabla_nombre.upper(), tabla_nombre.lower(), tabla_nombre]:
            try:
                query_seq = text(f"SELECT pg_get_serial_sequence('{tabla_variant}', '{columna_id}')")
                seq_name = conn.execute(query_seq).scalar()
                if seq_name:
                    break
            except Exception as e:
                logger.debug(f"Error obteniendo secuencia con variante {tabla_variant}: {e}")
                continue
        
        # Método 2: Si pg_get_serial_sequence no funciona, buscar secuencias por nombre
        if not seq_name:
            patterns = [
                f"{tabla_nombre.lower()}_seq",
                f"{tabla_nombre.lower()}_{columna_id.lower()}_seq",
                f"{tabla_nombre.upper()}_seq",
                f"{tabla_nombre.upper()}_{columna_id.upper()}_seq"
            ]
            for pattern in patterns:
                try:
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
                except Exception as e:
                    logger.debug(f"Error buscando secuencia con patrón {pattern}: {e}")
                    continue
    
    return seq_name


# ================================
# FUNCIONES DE VERIFICACIÓN
# ================================

def verificar_sincronizacion_secuencia(engine, tabla_nombre: str, columna_id: str = None) -> Tuple[bool, int, int, Optional[str]]:
    """
    Verifica si una secuencia está sincronizada con la tabla.
    
    Args:
        engine: Engine de SQLAlchemy
        tabla_nombre: Nombre de la tabla
        columna_id: Nombre de la columna con secuencia (si None, se detecta automáticamente)
    
    Returns:
        Tuple con (esta_sincronizada, max_id_tabla, last_value_secuencia, nombre_secuencia)
    """
    try:
        # Si no se especifica la columna, obtenerla automáticamente
        if columna_id is None:
            columnas_con_secuencia = obtener_columnas_con_secuencia(engine, tabla_nombre)
            if not columnas_con_secuencia:
                return False, 0, 0, None
            columna_id = columnas_con_secuencia[0]
        
        # Obtener ID máximo de la tabla
        max_id_tabla = obtener_id_maximo(engine, tabla_nombre, columna_id)
        
        # Obtener nombre de la secuencia
        seq_name = obtener_nombre_secuencia(engine, tabla_nombre, columna_id)
        if not seq_name:
            return False, max_id_tabla, 0, None
        
        # Obtener valor actual de la secuencia
        with engine.connect() as conn:
            try:
                query_current = text(f"SELECT last_value, is_called FROM {seq_name}")
                current_result = conn.execute(query_current).fetchone()
                last_value = current_result[0] if current_result else 0
                is_called = current_result[1] if current_result else True
                
                # Si is_called es False, el próximo nextval() devolverá last_value
                # Si is_called es True, el próximo nextval() devolverá last_value + 1
                if is_called:
                    proximo_valor = last_value + 1
                else:
                    proximo_valor = last_value
                
                # La secuencia está sincronizada si el próximo valor es mayor que max_id_tabla
                esta_sincronizada = proximo_valor > max_id_tabla
                
                return esta_sincronizada, max_id_tabla, last_value, seq_name
            except Exception as e:
                logger.debug(f"Error verificando secuencia {seq_name}: {e}")
                return False, max_id_tabla, 0, seq_name
                
    except Exception as e:
        logger.warning(f"Error verificando sincronización de secuencia para '{tabla_nombre}': {e}")
        return False, 0, 0, None


# ================================
# FUNCIONES DE SINCRONIZACIÓN
# ================================

def sincronizar_secuencia_tabla(engine, tabla_nombre: str, columna_id: str = None, forzar_resincronizacion: bool = False) -> Tuple[bool, Optional[str], int]:
    """
    Sincroniza la secuencia de una tabla específica.
    
    Args:
        engine: Engine de SQLAlchemy
        tabla_nombre: Nombre de la tabla
        columna_id: Nombre de la columna con secuencia (si None, se detecta automáticamente)
        forzar_resincronizacion: Si True, sincroniza incluso si parece estar sincronizada
    
    Returns:
        Tuple con (exito, nombre_secuencia, max_val_sincronizado)
    """
    try:
        with engine.connect() as conn:
            # Si no se especifica la columna, obtenerla automáticamente
            if columna_id is None:
                columnas_con_secuencia = obtener_columnas_con_secuencia(engine, tabla_nombre)
                if not columnas_con_secuencia:
                    logger.debug(f"No se encontraron columnas con secuencia para tabla '{tabla_nombre}'")
                    return False, None, 0
                columna_id = columnas_con_secuencia[0]  # Usar la primera columna con secuencia
            
            # Verificar sincronización antes de proceder (si no se fuerza)
            if not forzar_resincronizacion:
                esta_sincronizada, max_id_tabla, last_value, seq_name = verificar_sincronizacion_secuencia(engine, tabla_nombre, columna_id)
                if esta_sincronizada and seq_name:
                    logger.debug(f"Secuencia de '{tabla_nombre}' ya está sincronizada (MAX={max_id_tabla}, last_value={last_value})")
                    return True, seq_name, max_id_tabla
            
            # Obtener ID máximo de la tabla
            max_val = obtener_id_maximo(engine, tabla_nombre, columna_id)
            
            # Obtener nombre de la secuencia
            seq_name = obtener_nombre_secuencia(engine, tabla_nombre, columna_id)
            if not seq_name:
                logger.warning(f"No se encontró la secuencia para '{tabla_nombre}.{columna_id}'")
                return False, None, max_val
            
            # Verificar el valor actual de la secuencia antes de sincronizar
            try:
                query_current = text(f"SELECT last_value, is_called FROM {seq_name}")
                current_result = conn.execute(query_current).fetchone()
                current_val = current_result[0] if current_result else 0
                is_called = current_result[1] if current_result else True
            except Exception as e:
                logger.debug(f"Error obteniendo valor actual de secuencia {seq_name}: {e}")
                current_val = 0
                is_called = True
            
            # Asegurarnos de que max_val sea al menos el valor actual de la secuencia
            # Esto previene que nextval() genere valores menores que los ya existentes
            if max_val < current_val:
                logger.warning(f"Valor máximo de tabla ({max_val}) es menor que valor actual de secuencia ({current_val}). Usando {current_val}.")
                max_val = current_val
            
            # Sincronizar la secuencia - usar true para que el próximo nextval() devuelva max_val + 1
            # En PostgreSQL: setval(seq, val, false) -> próximo nextval() devuelve val
            #                setval(seq, val, true) -> próximo nextval() devuelve val + 1
            query_sync = text(f"SELECT setval('{seq_name}', {max_val}, true)")
            conn.execute(query_sync)
            conn.commit()
            logger.info(f"✓ Secuencia de '{tabla_nombre}' ({seq_name}) sincronizada: MAX tabla={max_val}, anterior={current_val}, próximo={max_val + 1}")
            return True, seq_name, max_val
                
    except Exception as e:
        logger.warning(f"Error sincronizando secuencia de '{tabla_nombre}': {e}")
        return False, None, 0


def asegurar_autoincrementos(engine, tablas_especificas: Optional[List[str]] = None) -> Dict[str, bool]:
    """
    Asegura que las secuencias de autoincremento estén sincronizadas.
    
    Args:
        engine: Engine de SQLAlchemy
        tablas_especificas: Lista opcional de tablas a sincronizar. Si None, sincroniza todas.
    
    Returns:
        Diccionario con estado de sincronización por tabla: {tabla: exito}
    """
    resultados = {}
    try:
        with engine.connect() as conn:
            if tablas_especificas:
                # Sincronizar solo las tablas especificadas
                for tabla in tablas_especificas:
                    exito, _, _ = sincronizar_secuencia_tabla(engine, tabla)
                    resultados[tabla] = exito
            else:
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
                tablas_procesadas = set()
                for row in result:
                    tabla = row[0]
                    columna = row[1]
                    
                    # Evitar procesar la misma tabla múltiples veces
                    if tabla in tablas_procesadas:
                        continue
                    
                    exito, _, _ = sincronizar_secuencia_tabla(engine, tabla, columna)
                    resultados[tabla] = exito
                    tablas_procesadas.add(tabla)
            
            conn.commit()
    except Exception as e:
        logger.warning(f"Error sincronizando secuencias: {e}")
    
    return resultados


# ================================
# FUNCIONES DE RECUPERACIÓN
# ================================

def obtener_ids_existentes(engine, tabla_nombre: str, cantidad: int = 1000, columna_id: str = None) -> List[int]:
    """
    Obtiene IDs existentes de una tabla.
    
    Útil cuando la inserción falla y necesitamos IDs para dependientes.
    
    Args:
        engine: Engine de SQLAlchemy
        tabla_nombre: Nombre de la tabla
        cantidad: Cantidad de IDs a obtener
        columna_id: Nombre de la columna ID (si None, se detecta automáticamente)
    
    Returns:
        Lista de IDs existentes
    """
    try:
        # Si no se especifica la columna, obtenerla automáticamente
        if columna_id is None:
            columnas_con_secuencia = obtener_columnas_con_secuencia(engine, tabla_nombre)
            if not columnas_con_secuencia:
                # Intentar obtener PK
                inspector = inspect(engine)
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
                if pk_columns:
                    columna_id = pk_columns[0]
                else:
                    return []
            else:
                columna_id = columnas_con_secuencia[0]
        
        if not columna_id:
            return []
        
        with engine.connect() as conn:
            # Intentar con diferentes variantes del nombre de tabla
            for tabla_variant in [tabla_nombre.upper(), tabla_nombre.lower(), tabla_nombre]:
                try:
                    # Intentar con comillas primero
                    try:
                        query = text(f'SELECT "{columna_id}" FROM {tabla_variant} ORDER BY "{columna_id}" LIMIT :cantidad')
                        result = conn.execute(query, {"cantidad": cantidad})
                        ids = [row[0] for row in result]
                        if ids:
                            return ids
                    except:
                        # Si falla con comillas, intentar sin comillas
                        query = text(f"SELECT {columna_id} FROM {tabla_variant} ORDER BY {columna_id} LIMIT :cantidad")
                        result = conn.execute(query, {"cantidad": cantidad})
                        ids = [row[0] for row in result]
                        if ids:
                            return ids
                except:
                    continue
        
        return []
    except Exception as e:
        logger.warning(f"Error obteniendo IDs existentes de '{tabla_nombre}': {e}")
        return []


def es_error_secuencia(error: Exception, tabla: str, columna_id: str = None) -> bool:
    """
    Detecta si un error es relacionado con secuencia desincronizada.
    
    Args:
        error: Excepción a analizar
        tabla: Nombre de la tabla
        columna_id: Nombre de la columna con secuencia (opcional)
    
    Returns:
        True si el error parece ser de secuencia desincronizada
    """
    mensaje_error = str(error).lower()
    
    # Verificar si es UniqueViolation
    if 'unique' not in mensaje_error and 'duplicate' not in mensaje_error and 'llave duplicada' not in mensaje_error:
        return False
    
    # Verificar si menciona la columna con secuencia (típicamente PK)
    if columna_id:
        if columna_id.lower() not in mensaje_error:
            return False
    
    # Verificar si el mensaje sugiere conflicto de ID (típicamente números)
    import re
    # Buscar patrones como "duplicate key value" seguido de números
    if re.search(r'duplicate.*key.*value|unique.*constraint', mensaje_error):
        return True
    
    return False


def manejar_error_secuencia(engine, error: Exception, tabla: str, cantidad_necesaria: int = 0, 
                            ids_referencias: Dict[str, List[int]] = None) -> Tuple[bool, Optional[List[int]], Optional[Dict[str, Any]]]:
    """
    Maneja errores de secuencia de forma inteligente.
    
    Detecta si el error es UniqueViolation relacionado con secuencia desincronizada.
    Si es así, intenta:
    a) Resincronizar la secuencia forzadamente
    b) Obtener IDs existentes de la tabla
    c) Retornar éxito con IDs existentes si hay suficientes
    
    Args:
        engine: Engine de SQLAlchemy
        error: Excepción que ocurrió
        tabla: Nombre de la tabla
        cantidad_necesaria: Cantidad de IDs necesarios (0 = usar cantidad por defecto)
        ids_referencias: Diccionario de IDs de referencias (para logging)
    
    Returns:
        Tuple con (exito, ids, error_info)
    """
    try:
        # Obtener columna con secuencia
        columnas_con_secuencia = obtener_columnas_con_secuencia(engine, tabla)
        if not columnas_con_secuencia:
            # No es un error de secuencia si no hay secuencia
            return False, None, None
        
        columna_id = columnas_con_secuencia[0]
        
        # Verificar si es error de secuencia
        if not es_error_secuencia(error, tabla, columna_id):
            return False, None, None
        
        logger.warning(f"Error de secuencia detectado en '{tabla}'. Intentando recuperación...")
        
        # Intentar resincronizar la secuencia forzadamente
        exito_sync, seq_name, max_val = sincronizar_secuencia_tabla(engine, tabla, columna_id, forzar_resincronizacion=True)
        if exito_sync:
            logger.info(f"Secuencia de '{tabla}' resincronizada. MAX={max_val}")
        
        # Obtener IDs existentes
        cantidad_a_obtener = cantidad_necesaria if cantidad_necesaria > 0 else 1000
        ids_existentes = obtener_ids_existentes(engine, tabla, cantidad_a_obtener, columna_id)
        
        if ids_existentes:
            cantidad_disponible = len(ids_existentes)
            logger.info(f"Se encontraron {cantidad_disponible} IDs existentes en '{tabla}'")
            
            # Si hay suficientes IDs, retornar éxito
            if cantidad_necesaria == 0 or cantidad_disponible >= cantidad_necesaria:
                logger.info(f"Usando {min(cantidad_disponible, cantidad_necesaria if cantidad_necesaria > 0 else cantidad_disponible)} IDs existentes de '{tabla}'")
                return True, ids_existentes[:cantidad_necesaria if cantidad_necesaria > 0 else cantidad_disponible], None
            else:
                logger.warning(f"No hay suficientes IDs existentes en '{tabla}' (necesarios: {cantidad_necesaria}, disponibles: {cantidad_disponible})")
                error_info = {
                    'tabla': tabla,
                    'tipo': 'insufficient_existing_ids',
                    'mensaje': f"No hay suficientes IDs existentes en '{tabla}' (necesarios: {cantidad_necesaria}, disponibles: {cantidad_disponible})",
                    'cantidad_necesaria': cantidad_necesaria,
                    'cantidad_disponible': cantidad_disponible
                }
                return False, ids_existentes, error_info
        else:
            logger.warning(f"No se encontraron IDs existentes en '{tabla}'")
            error_info = {
                'tabla': tabla,
                'tipo': 'no_existing_ids',
                'mensaje': f"No se encontraron IDs existentes en '{tabla}' para usar en dependientes"
            }
            return False, None, error_info
            
    except Exception as e:
        logger.error(f"Error en manejar_error_secuencia para '{tabla}': {e}")
        return False, None, None

