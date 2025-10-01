from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse, Response
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import shutil
import zipfile

# Importar lógica existente
from MassiveInsertFiles import insertar_datos_masivos, build_connection_string, create_engine, sessionmaker, asegurar_autoincrementos
from ExportExcel import export_selected_tables
from ImportExcel import import_one_file as py_import_one_file, MODELS as IMPORT_MODELS, detect_format_from_path

app = FastAPI(title="INIA Python Middleware", version="1.0.0")


class InsertRequest(BaseModel):
    # Por ahora solo gatillar la inserción masiva según lógica existente
    # Se puede extender con parámetros más adelante
    pass


@app.post("/insertar")
def insertar():
    try:
        ok = insertar_datos_masivos()
        if not ok:
            raise HTTPException(status_code=500, detail="Error en inserción masiva")
        return JSONResponse({"status": "ok"})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/exportar")
def exportar(
    tablas: str = Query(default="", description="Lista separada por comas de tablas a exportar"),
    formato: str = Query(default="xlsx", pattern="^(xlsx|csv)$"),
):
    try:
        tablas_list = [t.strip() for t in tablas.split(",") if t.strip()] if tablas else []
        if not tablas_list:
            # por defecto exportar todas las tablas definidas en ExportExcel.MODELS
            from ExportExcel import MODELS
            tablas_list = list(MODELS.keys())

        tmp_dir = tempfile.mkdtemp(prefix="inia_export_")
        try:
            # Verificar que el directorio se creó correctamente
            if not os.path.exists(tmp_dir):
                raise HTTPException(status_code=500, detail="No se pudo crear directorio temporal")
            
            # Ejecutar exportación
            export_selected_tables(tablas_list, tmp_dir, formato)

            # Verificar que se generaron archivos
            files_generated = [f for f in os.listdir(tmp_dir) if f.endswith(('.xlsx', '.csv'))]
            if not files_generated:
                raise HTTPException(status_code=500, detail="No se generaron archivos de exportación")

            # Empaquetar en zip
            zip_path = os.path.join(tmp_dir, "export.zip")
            with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                for root, _, files in os.walk(tmp_dir):
                    for f in files:
                        if f == "export.zip":
                            continue
                        full = os.path.join(root, f)
                        arcname = os.path.relpath(full, tmp_dir)
                        zf.write(full, arcname)

            # Verificar que el zip se creó
            if not os.path.exists(zip_path):
                raise HTTPException(status_code=500, detail="No se pudo crear archivo ZIP")

            # Leer el archivo zip como bytes y retornarlo
            with open(zip_path, "rb") as f:
                zip_bytes = f.read()
            
            if len(zip_bytes) == 0:
                raise HTTPException(status_code=500, detail="Archivo ZIP generado está vacío")
            
            # Limpiar archivos temporales
            shutil.rmtree(tmp_dir, ignore_errors=True)
            
            # Devolver el archivo ZIP como respuesta binaria
            return Response(
                content=zip_bytes,
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=export.zip"}
            )
        except HTTPException:
            # Re-lanzar HTTPException sin modificar
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise
        except Exception as e:
            # Limpiar en caso de error y convertir a HTTPException
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=f"Error durante exportación: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/importar")
async def importar(
    table: str = Form(..., description="Tabla destino"),
    upsert: bool = Form(False),
    keep_ids: bool = Form(False),
    file: UploadFile = File(..., description="Archivo CSV/XLSX"),
):
    try:
        table_key = (table or "").strip().lower()
        model = IMPORT_MODELS.get(table_key)
        if not model:
            raise HTTPException(status_code=400, detail=f"Tabla desconocida: {table}")

        # Guardar archivo temporalmente
        suffix = ""
        if file.filename:
            _, ext = os.path.splitext(file.filename)
            suffix = ext
        tmp_fd, tmp_path = tempfile.mkstemp(prefix="inia_import_", suffix=suffix)
        os.close(tmp_fd)
        try:
            with open(tmp_path, "wb") as out:
                content = await file.read()
                out.write(content)

            fmt = detect_format_from_path(tmp_path)
            if fmt not in ("csv", "xlsx"):
                raise HTTPException(status_code=400, detail="Formato no soportado. Use CSV o XLSX")

            # Preparar conexión SQLAlchemy
            conn_str = build_connection_string()
            engine = create_engine(conn_str)
            Session = sessionmaker(bind=engine)
            session = Session()
            try:
                # Asegurar autoincrementos antes y después
                try:
                    asegurar_autoincrementos(engine)
                except Exception:
                    # Continuar aunque falle (no crítico para todas las tablas)
                    ...

                inserted, updated = py_import_one_file(session, model, tmp_path, fmt, upsert, keep_ids)

                try:
                    asegurar_autoincrementos(engine)
                except Exception:
                    ...

                return JSONResponse({
                    "status": "ok",
                    "table": model.__tablename__,
                    "inserted": inserted,
                    "updated": updated,
                })
            finally:
                session.close()
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                ...
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PY_MIDDLEWARE_PORT", "9099")))


