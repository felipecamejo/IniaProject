# Script para ver logs de servicios Docker - Modo Testing ECS
# Ubicación: IniaProject/scriptDockers/logs-docker-ecs.ps1
# Uso: .\scriptDockers\logs-docker-ecs.ps1 [servicio] [--tail N]

param(
    [string]$Servicio = "",
    [int]$Tail = 100,
    [switch]$Follow = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Uso: .\scriptDockers\logs-docker-ecs.ps1 [opciones]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -Servicio <nombre>  Servicio especifico (backend, frontend, middleware, database)" -ForegroundColor White
    Write-Host "  -Tail <numero>      Numero de lineas a mostrar (default: 100)" -ForegroundColor White
    Write-Host "  -Follow             Seguir logs en tiempo real (equivalente a -f)" -ForegroundColor White
    Write-Host "  -Help               Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\scriptDockers\logs-docker-ecs.ps1" -ForegroundColor Gray
    Write-Host "  .\scriptDockers\logs-docker-ecs.ps1 -Servicio backend" -ForegroundColor Gray
    Write-Host "  .\scriptDockers\logs-docker-ecs.ps1 -Servicio frontend -Follow" -ForegroundColor Gray
    Write-Host "  .\scriptDockers\logs-docker-ecs.ps1 -Tail 50" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Logs INIA - Testing ECS        " -ForegroundColor Cyan
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
if (-not (Test-DockerRunning)) {
    Write-Host "ERROR: Docker Desktop no esta ejecutandose" -ForegroundColor Red
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Si no se especificó servicio, mostrar menú
if ([string]::IsNullOrWhiteSpace($Servicio)) {
    Write-Host "Servicios disponibles:" -ForegroundColor Yellow
    Write-Host "  1. Todos los servicios" -ForegroundColor White
    Write-Host "  2. Backend (Spring Boot)" -ForegroundColor White
    Write-Host "  3. Frontend (Angular + Nginx)" -ForegroundColor White
    Write-Host "  4. Middleware (FastAPI)" -ForegroundColor White
    Write-Host "  5. Database (PostgreSQL)" -ForegroundColor White
    Write-Host ""
    
    $opcion = Read-Host "Selecciona un servicio (1-5)"
    
    switch ($opcion) {
        "1" { $Servicio = "" }
        "2" { $Servicio = "backend" }
        "3" { $Servicio = "frontend" }
        "4" { $Servicio = "middleware" }
        "5" { $Servicio = "database" }
        default {
            Write-Host "Opcion invalida" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host ""
    $followOption = Read-Host "Seguir logs en tiempo real? (S/N)"
    if ($followOption -eq "S" -or $followOption -eq "s") {
        $Follow = $true
    }
}

# Construir comando docker compose logs
$composeFile = "-f docker-compose.ecs.yml --env-file .env"
$logCommand = "docker compose $composeFile logs"

if ($Follow) {
    $logCommand += " -f"
} else {
    $logCommand += " --tail $Tail"
}

if (-not [string]::IsNullOrWhiteSpace($Servicio)) {
    $logCommand += " $Servicio"
    Write-Host "Mostrando logs de: $Servicio" -ForegroundColor Cyan
} else {
    Write-Host "Mostrando logs de todos los servicios" -ForegroundColor Cyan
}

if ($Follow) {
    Write-Host "Modo: Seguir en tiempo real (Ctrl+C para salir)" -ForegroundColor Yellow
} else {
    Write-Host "Mostrando ultimas $Tail lineas" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Gray
Write-Host ""

# Ejecutar comando
Invoke-Expression $logCommand

Write-Host ""
Write-Host "==================================" -ForegroundColor Gray
Write-Host ""

if (-not $Follow) {
    Write-Host "Para seguir logs en tiempo real, ejecuta:" -ForegroundColor Yellow
    if ([string]::IsNullOrWhiteSpace($Servicio)) {
        Write-Host "  docker compose -f docker-compose.ecs.yml --env-file .env logs -f" -ForegroundColor White
    } else {
        Write-Host "  docker compose -f docker-compose.ecs.yml --env-file .env logs -f $Servicio" -ForegroundColor White
    }
    Write-Host ""
}

Read-Host "Presiona Enter para salir"
