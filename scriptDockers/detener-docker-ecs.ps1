# Script para detener INIA Docker - Modo Testing ECS
# Ubicación: IniaProject/scriptDockers/detener-docker-ecs.ps1
# Uso: .\scriptDockers\detener-docker-ecs.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Deteniendo INIA - Testing ECS  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar Docker
function Test-DockerRunning {
    try {
        $null = docker version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# Verificar Docker Desktop
Write-Host "Verificando Docker Desktop..." -ForegroundColor Yellow

if (-not (Test-DockerRunning)) {
    Write-Host "Docker Desktop no esta ejecutandose" -ForegroundColor Yellow
    Write-Host "No hay servicios Docker que detener" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 0
}

Write-Host "Docker Desktop esta ejecutandose" -ForegroundColor Green
Write-Host ""

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
Write-Host "Directorio: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Mostrar servicios en ejecución
Write-Host "Servicios actuales (testing ECS):" -ForegroundColor Yellow
docker compose -f docker-compose.ecs.yml --env-file .env ps
Write-Host ""

# Preguntar confirmación
$confirm = Read-Host "Detener todos los servicios de testing ECS? (S/N)"
if ($confirm -eq "S" -or $confirm -eq "s") {
    Write-Host ""
    Write-Host "Deteniendo servicios..." -ForegroundColor Yellow
    docker compose -f docker-compose.ecs.yml --env-file .env down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Servicios detenidos exitosamente" -ForegroundColor Green
        Write-Host "Los datos de la base de datos se han conservado" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Para iniciar nuevamente: .\scriptDockers\iniciar-docker-ecs.ps1" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "ERROR al detener servicios" -ForegroundColor Red
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "Operacion cancelada" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "Presiona Enter para salir"
