import os
import csv
import argparse
from datetime import date, datetime

# Dependencia opcional para Excel
try:
    from openpyxl import Workbook
    from openpyxl.utils import get_column_letter
    OPENPYXL_AVAILABLE = True
except Exception:
    OPENPYXL_AVAILABLE = False

from MassiveInsertFiles import (
    create_engine, sessionmaker, text,
    build_connection_string,
    Lote, Maleza, Semilla, Usuario, Recibo,
    Dosn as DOSN, Cultivo, Germinacion, Pms as PMS, Pureza,
    PurezaPnotatum as PurezaPNotatum, Sanitario, Hongo, Tetrazolio,
    UsuarioLote, SanitarioHongo,
    GREEN, RED, CYAN, RESET, logger, logging
)


def log_ok(message: str):
    logger.info(f"{GREEN}✅ {message}{RESET}")


def log_fail(message: str):
    logger.error(f"{RED}❌ {message}{RESET}")


def log_step(message: str):
    logger.info(f"{CYAN}{message}{RESET}")


MODELS = {
    "lote": Lote,
    "maleza": Maleza,
    "semilla": Semilla,
    "usuario": Usuario,
    "recibo": Recibo,
    "dosn": DOSN,
    "cultivo": Cultivo,
    "germinacion": Germinacion,
    "pms": PMS,
    "pureza": Pureza,
    "pureza_pnotatum": PurezaPNotatum,
    "sanitario": Sanitario,
    "hongo": Hongo,
    "tetrazolio": Tetrazolio,
    "usuario_lote": UsuarioLote,
    "sanitario_hongo": SanitarioHongo,
}


def ensure_output_dir(path: str) -> str:
    os.makedirs(path, exist_ok=True)
    return os.path.abspath(path)


def serialize_value(value):
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        # ISO 8601, Excel-friendly
        return value.isoformat(sep=" ")
    if isinstance(value, bool):
        return "true" if value else "false"
    return value


def export_table_csv(session, model, output_dir: str) -> str:
    table = model.__tablename__
    log_step(f"➡️ Exportando {table} a CSV...")
    columns = [c.name for c in model.__table__.columns]
    csv_path = os.path.join(output_dir, f"{table}.csv")
    try:
        # Verificar qué columnas realmente existen en la tabla
        columnas_reales = verificar_estructura_tabla(session, table)
        if not columnas_reales:
            log_fail(f"No se pudo verificar estructura de {table}")
            return ""
        
        # Filtrar columnas que realmente existen
        columnas_validas = [col for col in columns if col in columnas_reales]
        columnas_faltantes = set(columns) - set(columnas_validas)
        
        if columnas_faltantes:
            log_fail(f"Columnas faltantes en {table}: {columnas_faltantes}")
            log_step(f"Exportando solo columnas existentes: {columnas_validas}")
        
        if not columnas_validas:
            log_fail(f"No hay columnas válidas para exportar en {table}")
            return ""

        # Usar SQL directo para evitar problemas con el modelo
        query = text(f"SELECT {', '.join(columnas_validas)} FROM {table}")
        result = session.execute(query)
        rows = result.fetchall()
        
        with open(csv_path, mode="w", encoding="utf-8-sig", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(columnas_validas)
            for row in rows:
                values = [serialize_value(value) for value in row]
                writer.writerow(values)
        log_ok(f"Archivo generado: {csv_path} ({len(rows)} filas)")
        return csv_path
    except Exception as e:
        log_fail(f"No se pudo exportar {table}: {e}")
        return ""


def export_table_xlsx(session, model, output_dir: str) -> str:
    table = model.__tablename__
    columns = [c.name for c in model.__table__.columns]
    xlsx_path = os.path.join(output_dir, f"{table}.xlsx")
    log_step(f"➡️ Exportando {table} a Excel...")
    try:
        if not OPENPYXL_AVAILABLE:
            log_fail("openpyxl no está instalado; usando CSV como fallback")
            return export_table_csv(session, model, output_dir)

        # Verificar qué columnas realmente existen en la tabla
        columnas_reales = verificar_estructura_tabla(session, table)
        if not columnas_reales:
            log_fail(f"No se pudo verificar estructura de {table}")
            return ""
        
        # Filtrar columnas que realmente existen
        columnas_validas = [col for col in columns if col in columnas_reales]
        columnas_faltantes = set(columns) - set(columnas_validas)
        
        if columnas_faltantes:
            log_fail(f"Columnas faltantes en {table}: {columnas_faltantes}")
            log_step(f"Exportando solo columnas existentes: {columnas_validas}")
        
        if not columnas_validas:
            log_fail(f"No hay columnas válidas para exportar en {table}")
            return ""

        # Usar SQL directo para evitar problemas con el modelo
        query = text(f"SELECT {', '.join(columnas_validas)} FROM {table}")
        result = session.execute(query)
        rows = result.fetchall()
        
        wb = Workbook()
        ws = wb.active
        ws.title = table[:31]  # límite de Excel
        # Escribir encabezados
        ws.append(columnas_validas)
        # Escribir filas
        for row in rows:
            values = [serialize_value(value) for value in row]
            ws.append(values)
        # Auto ancho simple
        for idx, col_name in enumerate(columnas_validas, start=1):
            max_len = max((len(str(ws.cell(row=r, column=idx).value)) if ws.cell(row=r, column=idx).value is not None else 0) for r in range(1, ws.max_row + 1))
            ws.column_dimensions[get_column_letter(idx)].width = min(max(10, max_len + 2), 60)
        wb.save(xlsx_path)
        log_ok(f"Archivo generado: {xlsx_path} ({len(rows)} filas)")
        return xlsx_path
    except Exception as e:
        log_fail(f"No se pudo exportar {table} a Excel: {e}")
        return ""


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
        return [row[0] for row in result]
    except Exception as e:
        log_fail(f"Error verificando estructura de {tabla_nombre}: {e}")
        return []

def export_selected_tables(tables: list, output_dir: str, fmt: str) -> None:
    try:
        connection_string = build_connection_string()
        engine = create_engine(connection_string)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Probar la conexión
        session.execute(text("SELECT 1"))
        
        try:
            out_dir = ensure_output_dir(output_dir)
            exported = 0
            for name in tables:
                model = MODELS.get(name.lower())
                if not model:
                    log_fail(f"Tabla desconocida: {name}")
                    continue
                
                if fmt == "xlsx":
                    path = export_table_xlsx(session, model, out_dir)
                else:
                    path = export_table_csv(session, model, out_dir)
                if path:
                    exported += 1
            log_ok(f"Tablas exportadas correctamente: {exported}/{len(tables)}")
            
            if exported == 0:
                raise Exception("No se pudo exportar ninguna tabla")
                
        finally:
            session.close()
    except Exception as e:
        log_fail(f"Error en export_selected_tables: {e}")
        raise


def main():
    parser = argparse.ArgumentParser(description="Exporta tablas del proyecto INIA a Excel/CSV")
    parser.add_argument(
        "--tables",
        nargs="*",
        default=list(MODELS.keys()),
        help="Lista de tablas a exportar. Por defecto exporta todas"
    )
    parser.add_argument(
        "--out",
        default=os.path.join(os.path.dirname(__file__), "exports"),
        help="Directorio de salida para los archivos"
    )
    parser.add_argument(
        "--format",
        choices=["xlsx", "csv"],
        default="xlsx",
        help="Formato de salida (xlsx por defecto)"
    )
    args = parser.parse_args()

    log_step(f"Iniciando exportación en formato {args.format}…")
    export_selected_tables(args.tables, args.out, args.format)


if __name__ == "__main__":
    # Nivel INFO para ver mensajes de progreso
    logging.getLogger().setLevel(logging.INFO)
    main()


