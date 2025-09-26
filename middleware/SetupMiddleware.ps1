Write-Host "==> Setup del middleware para InsertTablesHere.py" -ForegroundColor Cyan
Write-Host "Instalando dependencias: SQLAlchemy, psycopg2-binary, faker, pandas" -ForegroundColor Gray

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Usar py (Python Launcher) que es más confiable en Windows
if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    Write-Error "Python no está instalado. Instálalo y vuelve a ejecutar."
    exit 1
}

Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

# 1) Crear venv si no existe
if (-not (Test-Path ".venv")) {
    Write-Host "Creando .venv..." -ForegroundColor Cyan
    py -m venv .venv
}

# 2) Activar venv
Write-Host "Activando .venv..." -ForegroundColor Cyan
. .\.venv\Scripts\Activate.ps1

# 3) Actualizar pip y herramientas básicas
Write-Host "Actualizando pip..." -ForegroundColor Cyan
py -m pip install --upgrade pip setuptools wheel

# 4) Instalar dependencias completas para InsertTablesHere.py
Write-Host "Instalando dependencias..." -ForegroundColor Cyan
pip install SQLAlchemy psycopg2-binary faker pandas

# 5) Verificación completa de dependencias
Write-Host "Verificando importaciones..." -ForegroundColor Cyan
$testCode = @"
import importlib, sys
mods = ["sqlalchemy", "psycopg2", "faker", "pandas"]
for m in mods:
    try:
        importlib.import_module(m)
        print(f"✓ {m} - OK")
    except ImportError as e:
        print(f"✗ {m} - ERROR: {e}")
        sys.exit(1)
print("✓ Todas las dependencias instaladas correctamente")
"@
$testCode | py
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Error en la verificación de dependencias"
    exit 1 
}

# 6) Prueba rápida del script InsertTablesHere.py
Write-Host "Probando InsertTablesHere.py..." -ForegroundColor Cyan
$testScript = @"
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Importar las funciones principales del script
    from InsertTablesHere import get_engine, _fallback_connection_string
    print("✓ InsertTablesHere.py se puede importar correctamente")
    
    # Probar la conexión a la base de datos
    try:
        engine = get_engine()
        print("✓ Conexión a la base de datos exitosa")
    except Exception as e:
        print(f"⚠ Advertencia: No se pudo conectar a la base de datos: {e}")
        print("  Asegúrate de que PostgreSQL esté ejecutándose y la base de datos 'Inia' exista")
    
except Exception as e:
    print(f"✗ Error importando InsertTablesHere.py: {e}")
    sys.exit(1)
"@

$testScript | py
if ($LASTEXITCODE -ne 0) { 
    Write-Warning "El script InsertTablesHere.py tiene problemas, pero las dependencias están instaladas"
}

Write-Host "`n=== SETUP COMPLETADO ===" -ForegroundColor Green
Write-Host "Para usar el middleware:" -ForegroundColor Yellow
Write-Host "1. Activa el entorno: .\.venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "2. Ejecuta el script: python .\InsertTablesHere.py --rows 5000" -ForegroundColor White
Write-Host "3. O usa el endpoint: POST /api/pandmiddleware/insertar-datos-masivos" -ForegroundColor White

Pop-Location

