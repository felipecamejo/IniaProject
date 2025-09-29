from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import shutil
import zipfile

# Importar lógica existente
from MasiveInsertFiles import insertar_datos_masivos, build_connection_string
from ExportExcel import export_selected_tables

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


@app.get("/exportar")
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
            export_selected_tables(tablas_list, tmp_dir, formato)

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

            return FileResponse(zip_path, media_type="application/zip", filename="export_inia.zip")
        finally:
            # No eliminamos tmp_dir aquí porque FileResponse necesita el archivo presente.
            # Un proceso externo puede limpiar el directorio temporal si es necesario.
            ...
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PY_MIDDLEWARE_PORT", "9099")))


