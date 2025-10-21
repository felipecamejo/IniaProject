# Script de PowerShell para detener los servicios Docker
# Uso: .\docker-scripts\stop.ps1 [opciones]

param(
    [switch]$RemoveVolumes = $false,
    [switch]$RemoveImages = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Detención Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\stop.ps1 [opciones]"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -RemoveVolumes - Eliminar volúmenes (¡CUIDADO! Borra la base de datos)"
    Write-Host "  -RemoveImages  - Eliminar imágenes Docker"
    Write-Host "  -Help          - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\stop.ps1                    # Detener servicios"
    Write-Host "  .\docker-scripts\stop.ps1 -RemoveVolumes     # Detener y borrar datos"
    Write-Host "  .\docker-scripts\stop.ps1 -RemoveImages      # Detener y borrar imágenes"
    exit 0
}

Write-Host "=== Deteniendo Servicios Docker para INIA ===" -ForegroundColor Green
Write-Host "Eliminar volúmenes: $RemoveVolumes" -ForegroundColor Yellow
Write-Host "Eliminar imágenes: $RemoveImages" -ForegroundColor Yellow
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
    exit 0
}

Write-Host "Servicios ejecutándose:" -ForegroundColor Cyan
$runningContainers | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }

# Advertencia sobre volúmenes
if ($RemoveVolumes) {
    Write-Host ""
    Write-Host "⚠️  ADVERTENCIA: Se eliminarán TODOS los datos de la base de datos" -ForegroundColor Red
    Write-Host "   Esto incluye todos los registros, usuarios y configuraciones" -ForegroundColor Red
    Write-Host ""
    $response = Read-Host "¿Estás seguro de que deseas continuar? (escribe 'SI' para confirmar)"
    if ($response -ne "SI") {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        exit 0
    }
}

# Detener servicios
Write-Host ""
Write-Host "Deteniendo servicios..." -ForegroundColor Cyan

$stopArgs = @("down")
if ($RemoveVolumes) {
    $stopArgs += "-v"
}

& docker-compose @stopArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Servicios detenidos exitosamente" -ForegroundColor Green
} else {
    Write-Host "✗ Error deteniendo los servicios" -ForegroundColor Red
    exit 1
}

# Eliminar imágenes si se solicita
if ($RemoveImages) {
    Write-Host ""
    Write-Host "Eliminando imágenes..." -ForegroundColor Cyan
    
    $images = @(
        "iniaproject_backend",
        "iniaproject_frontend", 
        "iniaproject_middleware"
    )
    
    foreach ($image in $images) {
        Write-Host "Eliminando imagen: $image" -ForegroundColor Yellow
        docker rmi $image 2>$null
    }
    
    # Limpiar imágenes no utilizadas
    Write-Host "Limpiando imágenes no utilizadas..." -ForegroundColor Yellow
    docker image prune -f
    
    Write-Host "✓ Imágenes eliminadas" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Detención Completada ===" -ForegroundColor Green

if ($RemoveVolumes) {
    Write-Host "⚠️  Los datos de la base de datos han sido eliminados" -ForegroundColor Red
    Write-Host "   La próxima vez que inicies, se creará una base de datos nueva" -ForegroundColor Yellow
} else {
    Write-Host "Los datos de la base de datos se han conservado" -ForegroundColor Green
    Write-Host "Para iniciar nuevamente, usa: .\docker-scripts\start.ps1" -ForegroundColor Yellow
}
