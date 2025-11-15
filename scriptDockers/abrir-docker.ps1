# Script simple para iniciar Docker y abrir el navegador automáticamente
# Ubicación: IniaProject/scriptDockers/abrir-docker.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  INIA Docker - Inicio Rápido   " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
try {
    $null = docker version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker Desktop no está ejecutándose" -ForegroundColor Red
        Write-Host "Inicia Docker Desktop primero" -ForegroundColor Yellow
        Read-Host "Presiona Enter para salir"
        exit 1
    }
} catch {
    Write-Host "ERROR: Docker Desktop no está ejecutándose" -ForegroundColor Red
    Write-Host "Inicia Docker Desktop primero" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Docker está ejecutándose" -ForegroundColor Green
Write-Host ""

# Navegar al directorio raíz
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Verificar si los servicios ya están corriendo
$containers = docker compose ps -q
if (-not $containers) {
    Write-Host "Iniciando servicios Docker..." -ForegroundColor Yellow
    docker compose up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: No se pudieron iniciar los servicios" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    
    Write-Host "Servicios iniciados" -ForegroundColor Green
    Write-Host ""
    Write-Host "Esperando a que los servicios estén listos..." -ForegroundColor Yellow
    Write-Host "(Esto puede tardar 1-2 minutos en la primera vez)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "Servicios ya están corriendo" -ForegroundColor Green
    Write-Host ""
}

# Esperar a que el backend esté listo
$maxWait = 180  # 3 minutos máximo
$waited = 0
$backendReady = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 5
    $waited += 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/Inia" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401 -or $response.StatusCode -eq 403) {
            $backendReady = $true
            break
        }
    } catch {
        # Backend aún no está listo
    }
    
    if ($waited % 30 -eq 0) {
        Write-Host "  Esperando... ($waited segundos)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Abriendo navegador...           " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Abrir Frontend
Start-Sleep -Seconds 2
try {
    Start-Process "http://localhost"
    Write-Host "✓ Frontend abierto: http://localhost" -ForegroundColor Green
} catch {
    Write-Host "⚠ No se pudo abrir el Frontend" -ForegroundColor Yellow
    Write-Host "  Abre manualmente: http://localhost" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Abrir Swagger
try {
    Start-Process "http://localhost:8080/swagger-ui/index.html"
    Write-Host "✓ Swagger UI abierto" -ForegroundColor Green
} catch {
    Write-Host "⚠ No se pudo abrir Swagger" -ForegroundColor Yellow
    Write-Host "  Abre manualmente: http://localhost:8080/swagger-ui/index.html" -ForegroundColor Gray
}

Write-Host ""
Write-Host "URLs disponibles:" -ForegroundColor Cyan
Write-Host "  Frontend:     http://localhost" -ForegroundColor White
Write-Host "  Swagger UI:   http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
Write-Host "  Backend API:  http://localhost:8080/Inia" -ForegroundColor White
Write-Host "  Middleware:   http://localhost:9099" -ForegroundColor White
Write-Host ""
Write-Host "Usuario admin: admin@inia.com / admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para detener los servicios: docker compose down" -ForegroundColor Gray
Write-Host "O ejecuta: .\scriptDockers\detener-docker.ps1" -ForegroundColor Gray
Write-Host ""

Read-Host "Presiona Enter para salir"

