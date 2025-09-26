import os
import sys
import random
import string
import logging
from datetime import datetime, date, timedelta
from typing import Any, Dict, List, Optional, Set

try:
    from sqlalchemy import (
        create_engine,
        MetaData,
        Table,
        Integer,
        BigInteger,
        Float,
        Numeric,
        String,
        Text,
        Boolean,
        Date,
        DateTime,
        Time,
    )
    from sqlalchemy.engine import Engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.exc import SQLAlchemyError
except ModuleNotFoundError:
    print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
    raise

# Faker es opcional pero recomendado para mejores datos sintéticos
try:
    from faker import Faker
except ModuleNotFoundError:
    Faker = None  # type: ignore


logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def _try_import_connection_string() -> Optional[str]:
    """Intenta reutilizar la lógica de conexión existente en pandaAlchemy.py."""
    try:
        # Asegurar que el directorio actual está en sys.path para importar pandaAlchemy
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if current_dir not in sys.path:
            sys.path.insert(0, current_dir)
        import pandaAlchemy  # type: ignore

        if hasattr(pandaAlchemy, "build_connection_string"):
            return pandaAlchemy.build_connection_string()
    except Exception as exc:  # noqa: BLE001
        logger.debug(f"No se pudo reutilizar build_connection_string: {exc}")
    return None


def _fallback_connection_string() -> str:
    """Construye una cadena de conexión a PostgreSQL usando configuración hardcodeada."""
    # Configuración hardcodeada para que funcione directamente
    db_user = "postgres"
    db_password = "897888fg2"
    db_host = "localhost"
    db_port = "5432"
    db_name = "Inia"
    return f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


def get_engine() -> Engine:
    """Obtiene un Engine de SQLAlchemy reutilizando configuración existente si es posible."""
    conn = _try_import_connection_string() or _fallback_connection_string()
    try:
        return create_engine(conn, pool_pre_ping=True, future=True)
    except ModuleNotFoundError:
        logger.error("Driver de PostgreSQL no encontrado. Instala: pip install psycopg2-binary")
        raise


def _make_faker() -> Optional[Faker]:  # type: ignore[valid-type]
    if Faker is None:
        return None
    # Configurar Faker en español por defecto
    try:
        return Faker("es_ES")
    except Exception:
        return Faker()


def _random_string(length: int = 16) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(random.choice(alphabet) for _ in range(max(1, length)))


def _truncate(value: str, max_length: Optional[int]) -> str:
    if max_length is None or max_length <= 0:
        return value
    if len(value) <= max_length:
        return value
    return value[: max_length - 1]


def _get_enum_value_for_column(column_name: str) -> Optional[str]:
    """Genera valores apropiados para columnas enum basadas en el nombre de la columna."""
    col_name = str(column_name).lower()
    
    # Mapeo de enums basado en las entidades Java del proyecto INIA
    enum_mappings = {
        'rol': ['ADMIN', 'ANALISTA', 'OBSERVADOR'],
        'pretratamiento': ['NINGUNO', 'ESCARIFICADO', 'OTRO'],
        'tratamiento': ['BIOLOGICO', 'QUIMICO', 'NINGUNO'],
        'estado': ['ESTADO_X', 'ESTADO_Y'],
        'metodo': ['METODO_A', 'METODO_B', 'METODO_C'],
        'prefrio': ['PREFRIO', 'SIN_PREFRIO'],
        'viabilidad_tz': ['VIABLE_SIN_DEFECTOS', 'DEFECTOS_LEVES', 'DEFECTOS_MODERADOS', 'DEFECTOS_SEVEROS', 'NO_VIABLES'],
        'viabilidad_vigor_tz': ['VIGOR_ALTO', 'VIGOR_MEDIO', 'VIGOR_BAJO', 'LIMITE_CRITICO', 'NO_VIABLES']
    }
    
    # Buscar coincidencias en el nombre de la columna
    for key, values in enum_mappings.items():
        if key in col_name:
            return random.choice(values)
    
    return None


def _guess_value_for_column(
    faker: Optional[Faker],
    column,
    existing_fk_values: Optional[List[Any]] = None,
    unique_cache: Optional[Set[Any]] = None,
) -> Any:
    """Genera un valor sintético para una columna, respetando tipos básicos.

    - Si la columna es FK y hay valores parent disponibles, elige uno aleatorio.
    - Evita violar longitudes máximas en tipos de texto.
    - Para columnas no nulas, intenta no retornar None.
    """
    # Usar FK preexistentes si aplica
    if existing_fk_values:
        return random.choice(existing_fk_values)

    col_type = column.type
    col_name = str(column.name).lower()
    max_len = getattr(col_type, "length", None)

    # Verificar si es un enum primero
    enum_value = _get_enum_value_for_column(col_name)
    if enum_value:
        return enum_value

    # Algunos heurísticos por nombre de columna específicos del proyecto INIA
    if isinstance(col_type, (String, Text)):
        if faker:
            if "email" in col_name:
                value = faker.unique.email() if unique_cache is not None else faker.email()
            elif any(k in col_name for k in ["nombre", "name", "remitente", "cultivar", "origen"]):
                value = faker.unique.name() if unique_cache is not None else faker.name()
            elif any(k in col_name for k in ["descripcion", "observacion", "observaciones", "detalle", "comentarios"]):
                value = faker.sentence(nb_words=8)
            elif "estado" in col_name:
                value = random.choice(["ACTIVO", "INACTIVO", "PENDIENTE", "PROCESADO"])
            elif "especie" in col_name:
                value = random.choice(["Trigo", "Maíz", "Soja", "Girasol", "Sorgo"])
            elif "ficha" in col_name:
                value = f"FICHA-{random.randint(1000, 9999)}"
            elif "deposito" in col_name:
                value = random.choice(["Depósito A", "Depósito B", "Depósito C"])
            elif "analisis_solicitados" in col_name:
                value = random.choice(["Pureza", "Germinación", "PMS", "Sanitario", "Tetrazolio"])
            else:
                value = faker.text(max_nb_chars=max(8, (max_len or 50) - 1))
        else:
            value = _random_string(min(16, max_len or 16))
        return _truncate(value, max_len)

    if isinstance(col_type, (Integer, BigInteger)):
        # Rango razonable; si es boolean-like por nombre, tratamos aparte
        if "porcentaje" in col_name or "nro" in col_name or "numero" in col_name:
            return random.randint(0, 100)
        elif "temperatura" in col_name:
            return random.randint(15, 35)  # Temperatura en grados Celsius
        elif "horas" in col_name:
            return random.randint(1, 24)  # Horas
        elif "dias" in col_name:
            return random.randint(1, 30)  # Días
        elif "repeticion" in col_name:
            return random.randint(1, 5)  # Repeticiones
        elif "semillas" in col_name:
            return random.randint(50, 500)  # Número de semillas
        elif "concentracion" in col_name:
            return random.randint(1, 10)  # Concentración
        elif "grados" in col_name:
            return random.randint(20, 40)  # Grados
        return random.randint(0, 1_000_000)

    if isinstance(col_type, (Float, Numeric)):
        if "peso" in col_name:
            return round(random.uniform(0.1, 100.0), 3)  # Peso en gramos
        elif "humedad" in col_name:
            return round(random.uniform(5.0, 15.0), 2)  # Humedad porcentual
        elif "porcentaje" in col_name:
            return round(random.uniform(0.0, 100.0), 2)  # Porcentajes
        elif "temperatura" in col_name:
            return round(random.uniform(15.0, 35.0), 1)  # Temperatura decimal
        return round(random.uniform(0, 10_000), 3)

    if isinstance(col_type, Boolean):
        # Para campos activo, siempre true por defecto
        if "activo" in col_name:
            return True
        return random.choice([True, False])

    if isinstance(col_type, Date):
        base = date.today() - timedelta(days=random.randint(0, 3650))
        return base

    if isinstance(col_type, DateTime):
        base = datetime.now() - timedelta(days=random.randint(0, 3650), seconds=random.randint(0, 86400))
        return base

    if isinstance(col_type, Time):
        return (datetime.min + timedelta(seconds=random.randint(0, 86399))).time()

    # Fallback genérico como string
    return _truncate(_random_string(12), max_len if hasattr(col_type, "length") else None)


def _is_autogenerated_pk(column) -> bool:
    if not column.primary_key:
        return False
    # Si tiene autoincrement o default/servidor, lo omitimos en el insert
    if getattr(column, "autoincrement", False):
        return True
    if column.default is not None or column.server_default is not None:
        return True
    return False


def _collect_unique_columns(table: Table) -> Set[str]:
    unique_cols: Set[str] = set()
    # Unique por columna
    for column in table.columns:
        if getattr(column, "unique", False):
            unique_cols.add(column.name)
    # Unique constraints
    for constraint in table.constraints:
        if getattr(constraint, "__class__", type). __name__ == "UniqueConstraint":
            for col in constraint.columns:
                unique_cols.add(col.name)
    return unique_cols


def _fetch_parent_values(engine: Engine, fk_column) -> List[Any]:
    """Obtiene valores existentes de la columna PK referenciada por una FK."""
    try:
        # Tomar el primer destino (la mayoría de FK simples tienen 1)
        fk = next(iter(fk_column.foreign_keys))
        target_col = fk.column
        target_table = target_col.table
        # Consultar hasta 10_000 valores (suficiente para muestrear)
        query = target_table.select().with_only_columns(target_col).limit(10000)  # type: ignore[arg-type]
        with engine.connect() as conn:
            rows = conn.execute(query).fetchall()
        return [row[0] for row in rows]
    except StopIteration:
        return []
    except SQLAlchemyError as exc:
        logger.debug(f"No se pudieron leer valores parent: {exc}")
        return []


def _bulk_insert(engine: Engine, table: Table, rows: List[Dict[str, Any]], chunk_size: int = 1000) -> int:
    total = 0
    if not rows:
        return 0
    try:
        with engine.begin() as conn:
            for i in range(0, len(rows), chunk_size):
                chunk = rows[i : i + chunk_size]
                conn.execute(table.insert(), chunk)
                total += len(chunk)
        return total
    except SQLAlchemyError as exc:
        logger.error(f"Error insertando en {table.name}: {exc}")
        raise


def _insert_usuario_lote_data(engine: Engine, table: Table) -> int:
    """Inserta datos en la tabla de unión USUARIO_LOTE."""
    try:
        # Obtener IDs existentes de usuarios y lotes
        from sqlalchemy import text
        with engine.connect() as conn:
            usuarios = conn.execute(text("SELECT usuario_id FROM usuario WHERE usuario_activo = true")).fetchall()
            lotes = conn.execute(text("SELECT lote_id FROM lote WHERE lote_activo = true")).fetchall()
        
        if not usuarios or not lotes:
            logger.warning("No hay usuarios o lotes para crear relaciones")
            return 0
        
        # Crear relaciones aleatorias
        rows = []
        max_relations = min(100, len(usuarios) * len(lotes) // 10)  # Máximo 100 relaciones
        
        for _ in range(max_relations):
            usuario_id = random.choice(usuarios)[0]
            lote_id = random.choice(lotes)[0]
            # Evitar duplicados
            if {'usuario_id': usuario_id, 'lote_id': lote_id} not in rows:
                rows.append({'usuario_id': usuario_id, 'lote_id': lote_id})
        
        return _bulk_insert(engine, table, rows)
    except SQLAlchemyError as exc:
        logger.error(f"Error insertando en tabla de unión USUARIO_LOTE: {exc}")
        return 0


def _insert_sanitario_hongo_data(engine: Engine, table: Table) -> int:
    """Inserta datos en la tabla de unión SANITARIO_HONGO."""
    try:
        # Obtener IDs existentes de sanitarios y hongos
        from sqlalchemy import text
        with engine.connect() as conn:
            sanitarios = conn.execute(text("SELECT sanitario_id FROM sanitario WHERE sanitario_activo = true")).fetchall()
            hongos = conn.execute(text("SELECT hongo_id FROM hongo WHERE hongo_activo = true")).fetchall()
        
        if not sanitarios or not hongos:
            logger.warning("No hay sanitarios o hongos para crear relaciones")
            return 0
        
        # Obtener el siguiente ID disponible
        next_id = 1
        with engine.connect() as conn:
            result = conn.execute(text("SELECT MAX(sanitario_hongo_id) FROM sanitario_hongo"))
            max_id = result.fetchone()[0]
            if max_id is not None:
                next_id = max_id + 1
        
        # Crear relaciones aleatorias
        rows = []
        max_relations = min(50, len(sanitarios) * len(hongos) // 10)  # Reducir a 50 relaciones máximo
        
        for i in range(max_relations):
            sanitario_id = random.choice(sanitarios)[0]
            hongo_id = random.choice(hongos)[0]
            repeticion = random.randint(1, 5)
            valor = random.randint(0, 100)
            incidencia = random.randint(0, 100)
            
            # Evitar duplicados
            relation = {'sanitario_id': sanitario_id, 'hongo_id': hongo_id, 'repeticion': repeticion}
            if relation not in [{'sanitario_id': r['sanitario_id'], 'hongo_id': r['hongo_id'], 'repeticion': r['repeticion']} for r in rows]:
                # Incluir el ID manualmente si la tabla lo requiere
                row_data = {
                    'sanitario_id': sanitario_id,
                    'hongo_id': hongo_id,
                    'repeticion': repeticion,
                    'valor': valor,
                    'incidencia': incidencia
                }
                
                # Verificar si la tabla tiene una columna ID que necesite ser especificada
                if 'sanitario_hongo_id' in [col.name for col in table.columns]:
                    row_data['sanitario_hongo_id'] = next_id + i  # ID secuencial único
                
                rows.append(row_data)
        
        return _bulk_insert(engine, table, rows)
    except SQLAlchemyError as exc:
        logger.error(f"Error insertando en tabla de unión SANITARIO_HONGO: {exc}")
        return 0


def _handle_join_tables(engine: Engine, metadata: MetaData) -> None:
    """Maneja la inserción en tablas de unión después de las tablas principales."""
    join_tables = {
        'usuario_lote': _insert_usuario_lote_data,
        'sanitario_hongo': _insert_sanitario_hongo_data
    }
    
    for table_name, insert_function in join_tables.items():
        if table_name in metadata.tables:
            table = metadata.tables[table_name]
            logger.info(f"Insertando datos en tabla de unión: {table_name}")
            inserted = insert_function(engine, table)
            logger.info(f"Tabla de unión {table_name}: {inserted} filas insertadas.")


def generate_rows_for_table(engine: Engine, table: Table, num_rows: int) -> int:
    """Genera e inserta num_rows filas sintéticas para una tabla.

    Respeta PK autogeneradas y rellena FKs con valores existentes.
    """
    faker = _make_faker()

    # Cache de columnas únicas para minimizar violaciones
    unique_columns = _collect_unique_columns(table)
    unique_trackers: Dict[str, Set[Any]] = {col: set() for col in unique_columns}

    # Mapa FK -> valores parent para elección aleatoria
    fk_values_map: Dict[str, List[Any]] = {}
    for column in table.columns:
        if column.foreign_keys:
            fk_values_map[column.name] = _fetch_parent_values(engine, column)

    rows: List[Dict[str, Any]] = []
    for _ in range(num_rows):
        row: Dict[str, Any] = {}
        for column in table.columns:
            # Omitir columnas autogeneradas (p. ej. PK serial)
            if _is_autogenerated_pk(column):
                continue

            value: Any
            existing_fk_values = fk_values_map.get(column.name) or []

            # Nulabilidad: ocasionalmente dejar nulo si es permitido
            allow_null = bool(getattr(column, "nullable", True))

            # Generar valor
            unique_cache = unique_trackers.get(column.name)
            if allow_null and random.random() < 0.05 and column.name not in unique_columns:
                value = None
            else:
                value = _guess_value_for_column(faker, column, existing_fk_values, unique_cache)

            # Mantener unicidad simple por columna, si corresponde
            if column.name in unique_columns:
                attempts = 0
                while value in unique_trackers[column.name] and attempts < 10:
                    value = _guess_value_for_column(faker, column, existing_fk_values, unique_trackers[column.name])
                    attempts += 1
                unique_trackers[column.name].add(value)

            row[column.name] = value

        rows.append(row)

    inserted = _bulk_insert(engine, table, rows)
    return inserted


def seed_all_tables(num_rows: int = 5000, only_tables: Optional[List[str]] = None, skip_tables: Optional[List[str]] = None) -> None:
    engine = get_engine()
    metadata = MetaData()
    logger.info("Reflejando metadatos de la base de datos...")
    metadata.reflect(bind=engine)

    all_tables = list(metadata.sorted_tables)  # ordenadas por dependencias FK
    if not all_tables:
        logger.warning("No se encontraron tablas en la base de datos.")
        return

    only_set = set(t.lower() for t in (only_tables or []))
    skip_set = set(t.lower() for t in (skip_tables or []))
    
    # Tablas de unión que se manejan por separado
    join_tables = {'usuario_lote', 'sanitario_hongo'}
    skip_set.update(join_tables)

    # Insertar en tablas principales primero
    for table in all_tables:
        name_lower = table.name.lower()
        if only_set and name_lower not in only_set:
            continue
        if name_lower in skip_set:
            logger.info(f"Saltando tabla {table.name} (en lista de exclusión)")
            continue

        # Determinar el número de filas a insertar
        rows_to_insert = num_rows
        if name_lower == "usuario":
            rows_to_insert = 20  # Solo 20 usuarios como se especifica
            logger.info(f"Tabla {table.name} detectada - limitando a {rows_to_insert} registros")

        logger.info(f"Insertando {rows_to_insert} filas en {table.name}...")
        try:
            inserted = generate_rows_for_table(engine, table, rows_to_insert)
            logger.info(f"Tabla {table.name}: {inserted} filas insertadas.")
        except SQLAlchemyError:
            logger.error(f"Fallo al insertar filas en {table.name}. Continuando con la siguiente tabla.")
            continue

    # Manejar tablas de unión al final
    logger.info("Procesando tablas de unión...")
    _handle_join_tables(engine, metadata)

    logger.info("Siembra completada.")


def _parse_args(argv: List[str]):
    import argparse

    parser = argparse.ArgumentParser(
        description="Insertar datos sintéticos en todas las tablas (por defecto 5000 filas por tabla)."
    )
    parser.add_argument("--rows", "-r", type=int, default=5000, help="Cantidad de filas por tabla")
    parser.add_argument(
        "--only",
        nargs="*",
        help="Nombres de tablas a incluir (si se especifica, solo estas)",
    )
    parser.add_argument(
        "--skip",
        nargs="*",
        help="Nombres de tablas a excluir",
    )
    return parser.parse_args(argv)


if __name__ == "__main__":
    args = _parse_args(sys.argv[1:])
    try:
        seed_all_tables(num_rows=args.rows, only_tables=args.only, skip_tables=args.skip)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Error en inserción masiva: {exc}")
        sys.exit(1)
    sys.exit(0)


