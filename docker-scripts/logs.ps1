# Script de PowerShell para ver logs de los servicios Docker
# Uso: .\docker-scripts\logs.ps1 [servicio] [opciones]

param(
    [string]$Service = "all",
    [switch]$Follow = $false,
    [int]$Lines = 100,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Logs Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\logs.ps1 [servicio] [opciones]"
    Write-Host ""
    Write-Host "Servicios disponibles:"
    Write-Host "  all        - Todos los servicios (por defecto)"
    Write-Host "  backend    - Solo backend Spring Boot"
    Write-Host "  frontend   - Solo frontend Angular"
    Write-Host "  middleware - Solo middleware Python"
    Write-Host "  database   - Solo base de datos PostgreSQL"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -Follow    - Seguir logs en tiempo real"
    Write-Host "  -Lines N   - Mostrar últimas N líneas (por defecto: 100)"
    Write-Host "  -Help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\logs.ps1"
    Write-Host "  .\docker-scripts\logs.ps1 backend -Follow"
    Write-Host "  .\docker-scripts\logs.ps1 middleware -Lines 50"
    exit 0
}

Write-Host "=== Logs de Servicios Docker para INIA ===" -ForegroundColor Green
Write-Host "Servicio: $Service" -ForegroundColor Yellow
Write-Host "Seguir logs: $Follow" -ForegroundColor Yellow
Write-Host "Líneas: $Lines" -ForegroundColor Yellow
Write-Host ""

# Verificar que Docker esté ejecutándose
try {
    docker version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está ejecutándose"
    }
} catch {
    Write-Host "Error: Docker no está ejecutándose o no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar servicios ejecutándose
$runningContainers = docker-compose ps --services --filter "status=running"
if (-not $runningContainers) {
    Write-Host "No hay servicios ejecutándose" -ForegroundColor Yellow
    Write-Host "Para iniciar los servicios, usa: .\docker-scripts\start.ps1" -ForegroundColor Yellow
    exit 0
}

# Función para mostrar logs de un servicio
function Show-Logs {
    param([string]$ServiceName)
    
    Write-Host "=== Logs de $ServiceName ===" -ForegroundColor Cyan
    Write-Host ""
    
    $logArgs = @("logs")
    if ($Follow) {
        $logArgs += "-f"
    }
    $logArgs += "--tail=$Lines"
    $logArgs += $ServiceName
    
    & docker-compose @logArgs
}

# Mostrar logs según el servicio especificado
switch ($Service.ToLower()) {
    "all" {
        Write-Host "Mostrando logs de todos los servicios..." -ForegroundColor Cyan
        Write-Host ""
        
        $logArgs = @("logs")
        if ($Follow) {
            $logArgs += "-f"
        }
        $logArgs += "--tail=$Lines"
        
        & docker-compose @logArgs
    }
    "backend" {
        Show-Logs "backend"
    }
    "frontend" {
        Show-Logs "frontend"
    }
    "middleware" {
        Show-Logs "middleware"
    }
    "database" {
        Show-Logs "database"
    }
    default {
        Write-Host "Error: Servicio '$Service' no reconocido" -ForegroundColor Red
        Write-Host "Usa -Help para ver los servicios disponibles" -ForegroundColor Yellow
        exit 1
    }
}

if (-not $Follow) {
    Write-Host ""
    Write-Host "Para seguir los logs en tiempo real, usa: -Follow" -ForegroundColor Yellow
    Write-Host "Para ver logs de un servicio específico, especifica el nombre del servicio" -ForegroundColor Yellow
}
