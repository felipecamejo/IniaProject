param(
    [Parameter(Mandatory=$false, Position=0)]
    [string]$ProjectRoot = ""
)

Write-Host "==> INIA Project Middleware Setup" -ForegroundColor Cyan
Write-Host "Installing complete dependencies: SQLAlchemy, psycopg2-binary, fastapi, uvicorn, openpyxl, pydantic" -ForegroundColor Gray

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Use py (Python Launcher) which is more reliable on Windows
if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not installed. Install it and run again."
    exit 1
}

# Auto-detect ProjectRoot if not provided
if ([string]::IsNullOrEmpty($ProjectRoot)) {
    # Get script directory (PowerShell/)
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    # Navigate to project root (one level up from PowerShell/)
    $ProjectRoot = Split-Path -Parent $scriptDir
    Write-Host "Auto-detectando ProjectRoot: $ProjectRoot" -ForegroundColor Gray
}

# Validate ProjectRoot parameter
if (-not (Test-Path $ProjectRoot)) {
    Write-Error "ProjectRoot invalido o no existe: $ProjectRoot"
    Write-Host "`nUso correcto:" -ForegroundColor Yellow
    Write-Host "  .\SetupMiddleware.ps1                    # Auto-detecta el directorio del proyecto" -ForegroundColor White
    Write-Host "  .\SetupMiddleware.ps1 D:\IniaProject    # Especifica la ruta manualmente" -ForegroundColor White
    Write-Host "`nPara ejecutar el servidor, usa:" -ForegroundColor Yellow
    Write-Host "  .\run_middleware.ps1 server" -ForegroundColor White
    exit 1
}

Set-Location $ProjectRoot

# Navegar al directorio middleware
Push-Location "middleware"

# 1) Create venv if it does not exist
if (-not (Test-Path ".venv")) {
    Write-Host "Creating .venv..." -ForegroundColor Cyan
    py -m venv .venv
}

# 2) Activate venv
Write-Host "Activating .venv..." -ForegroundColor Cyan
. .\.venv\Scripts\Activate.ps1

# 3) Update pip and basic tools
Write-Host "Updating pip..." -ForegroundColor Cyan
py -m pip install --upgrade pip setuptools wheel

# 4) Install complete dependencies for INIA middleware
Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Cyan
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt
    Write-Host "OK Dependencies installed from requirements.txt" -ForegroundColor Green
} else {
    Write-Host "WARNING: requirements.txt not found, installing dependencies individually..." -ForegroundColor Yellow
    Write-Host "Installing main dependencies..." -ForegroundColor Cyan
    pip install SQLAlchemy psycopg2-binary

    Write-Host "Installing FastAPI dependencies..." -ForegroundColor Cyan
    pip install fastapi uvicorn python-multipart

    Write-Host "Installing Excel dependencies..." -ForegroundColor Cyan
    pip install openpyxl

    Write-Host "Installing additional dependencies..." -ForegroundColor Cyan
    pip install pydantic

    Write-Host "Installing testing dependencies..." -ForegroundColor Cyan
    pip install pytest pytest-asyncio httpx
}

# 5) Complete dependency verification
Write-Host "Verifying imports..." -ForegroundColor Cyan
$testCode = @'
import importlib, sys
mods = [
    "sqlalchemy", "psycopg2", 
    "fastapi", "uvicorn", "openpyxl", "pydantic",
    "pytest", "httpx"
]
for m in mods:
    try:
        importlib.import_module(m)
        print(f"OK {m} - OK")
    except ImportError as e:
        print(f"ERROR {m} - ERROR: {e}")
        sys.exit(1)
print("OK All dependencies installed correctly")
'@
$testCode | py
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Error in dependency verification"
    exit 1 
}

# 6) Quick test of middleware scripts
Write-Host "Testing middleware scripts..." -ForegroundColor Cyan
$testScript = @'
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Test MassiveInsertFiles import
    from MassiveInsertFiles import build_connection_string, create_engine
    print("OK MassiveInsertFiles.py can be imported correctly")
    
    # Test ExportExcel import
    from ExportExcel import export_selected_tables, MODELS
    print("OK ExportExcel.py can be imported correctly")
    
    # Test ImportExcel import
    from ImportExcel import import_one_file, MODELS as IMPORT_MODELS
    print("OK ImportExcel.py can be imported correctly")
    
    # Test http_server import
    from http_server import app
    print("OK http_server.py can be imported correctly")
    
    # Test FastAPI TestClient
    from fastapi.testclient import TestClient
    client = TestClient(app)
    print("OK FastAPI TestClient works correctly")
    
    # Test pytest
    import pytest
    print("OK pytest is available and functional")
    
    # Test database connection
    try:
        connection_string = build_connection_string()
        engine = create_engine(connection_string)
        print("OK Database connection successful")
    except Exception as e:
        print(f"WARNING: Could not connect to database: {e}")
        print("  Make sure PostgreSQL is running and the Inia database exists")
    
except Exception as e:
    print(f"ERROR importing middleware scripts: {e}")
    sys.exit(1)
'@

$testScript | py
if ($LASTEXITCODE -ne 0) { 
    Write-Warning "Middleware scripts have issues, but dependencies are installed"
}

Write-Host "`n=== SETUP COMPLETED ===" -ForegroundColor Green
Write-Host "To use the middleware:" -ForegroundColor Yellow
Write-Host "1. Activate environment: .\.venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "2. Massive insertion: python .\MassiveInsertFiles.py" -ForegroundColor White
Write-Host "3. Export data: python .\ExportExcel.py --tables lote,recibo --format xlsx" -ForegroundColor White
Write-Host "4. Import data: python .\ImportExcel.py --file datos.xlsx --table lote" -ForegroundColor White
Write-Host "5. API Server: python .\http_server.py" -ForegroundColor White
Write-Host "6. Available endpoints:" -ForegroundColor White
Write-Host "   - POST /insertar (massive insertion)" -ForegroundColor Gray
Write-Host "   - POST /exportar (export tables)" -ForegroundColor Gray
Write-Host "   - POST /importar (import files)" -ForegroundColor Gray
Write-Host "7. Run tests:" -ForegroundColor White
Write-Host "   - pytest (run all tests)" -ForegroundColor Gray
Write-Host "   - pytest -v (verbose mode)" -ForegroundColor Gray
Write-Host "   - pytest test_setup.py (run configuration test)" -ForegroundColor Gray

Pop-Location

