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

from MasiveInsertFiles import (
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
        rows = session.query(model).all()
        with open(csv_path, mode="w", encoding="utf-8-sig", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(columns)
            for row in rows:
                values = [serialize_value(getattr(row, col)) for col in columns]
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

        rows = session.query(model).all()
        wb = Workbook()
        ws = wb.active
        ws.title = table[:31]  # límite de Excel
        # Escribir encabezados
        ws.append(columns)
        # Escribir filas
        for row in rows:
            values = [serialize_value(getattr(row, col)) for col in columns]
            ws.append(values)
        # Auto ancho simple
        for idx, col_name in enumerate(columns, start=1):
            max_len = max((len(str(ws.cell(row=r, column=idx).value)) if ws.cell(row=r, column=idx).value is not None else 0) for r in range(1, ws.max_row + 1))
            ws.column_dimensions[get_column_letter(idx)].width = min(max(10, max_len + 2), 60)
        wb.save(xlsx_path)
        log_ok(f"Archivo generado: {xlsx_path} ({len(rows)} filas)")
        return xlsx_path
    except Exception as e:
        log_fail(f"No se pudo exportar {table} a Excel: {e}")
        return ""


def export_selected_tables(tables: list, output_dir: str, fmt: str) -> None:
    connection_string = build_connection_string()
    engine = create_engine(connection_string)
    Session = sessionmaker(bind=engine)
    session = Session()
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
    finally:
        session.close()


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


