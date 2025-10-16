# Script de PowerShell para limpiar recursos Docker
# Uso: .\docker-scripts\clean.ps1 [opciones]

param(
    [switch]$All = $false,
    [switch]$Images = $false,
    [switch]$Containers = $false,
    [switch]$Volumes = $false,
    [switch]$Networks = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Limpieza Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\clean.ps1 [opciones]"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -All        - Limpiar todo (imágenes, contenedores, volúmenes, redes)"
    Write-Host "  -Images     - Eliminar imágenes no utilizadas"
    Write-Host "  -Containers - Eliminar contenedores detenidos"
    Write-Host "  -Volumes    - Eliminar volúmenes no utilizados"
    Write-Host "  -Networks   - Eliminar redes no utilizadas"
    Write-Host "  -Help       - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\clean.ps1 -Images"
    Write-Host "  .\docker-scripts\clean.ps1 -All"
    Write-Host "  .\docker-scripts\clean.ps1 -Containers -Volumes"
    exit 0
}

Write-Host "=== Limpieza de Recursos Docker para INIA ===" -ForegroundColor Green
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

# Si no se especifica ninguna opción, mostrar ayuda
if (-not $All -and -not $Images -and -not $Containers -and -not $Volumes -and -not $Networks) {
    Write-Host "No se especificó ninguna opción de limpieza" -ForegroundColor Yellow
    Write-Host "Usa -Help para ver las opciones disponibles" -ForegroundColor Yellow
    exit 0
}

# Función para limpiar imágenes
function Clean-Images {
    Write-Host "Limpiando imágenes no utilizadas..." -ForegroundColor Cyan
    
    # Mostrar imágenes antes de limpiar
    $imagesBefore = docker images -q
    $imageCount = ($imagesBefore | Measure-Object).Count
    
    Write-Host "Imágenes antes de limpiar: $imageCount" -ForegroundColor Yellow
    
    # Limpiar imágenes no utilizadas
    docker image prune -f
    
    # Mostrar imágenes después de limpiar
    $imagesAfter = docker images -q
    $imageCountAfter = ($imagesAfter | Measure-Object).Count
    
    Write-Host "Imágenes después de limpiar: $imageCountAfter" -ForegroundColor Yellow
    Write-Host "✓ Imágenes limpiadas" -ForegroundColor Green
}

# Función para limpiar contenedores
function Clean-Containers {
    Write-Host "Limpiando contenedores detenidos..." -ForegroundColor Cyan
    
    # Mostrar contenedores antes de limpiar
    $containersBefore = docker ps -a -q
    $containerCount = ($containersBefore | Measure-Object).Count
    
    Write-Host "Contenedores antes de limpiar: $containerCount" -ForegroundColor Yellow
    
    # Limpiar contenedores detenidos
    docker container prune -f
    
    # Mostrar contenedores después de limpiar
    $containersAfter = docker ps -a -q
    $containerCountAfter = ($containersAfter | Measure-Object).Count
    
    Write-Host "Contenedores después de limpiar: $containerCountAfter" -ForegroundColor Yellow
    Write-Host "✓ Contenedores limpiados" -ForegroundColor Green
}

# Función para limpiar volúmenes
function Clean-Volumes {
    Write-Host "Limpiando volúmenes no utilizados..." -ForegroundColor Cyan
    
    # Advertencia sobre volúmenes
    Write-Host "⚠️  ADVERTENCIA: Esto eliminará volúmenes no utilizados" -ForegroundColor Red
    Write-Host "   Asegúrate de que no hay datos importantes en volúmenes huérfanos" -ForegroundColor Red
    Write-Host ""
    $response = Read-Host "¿Continuar con la limpieza de volúmenes? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Limpieza de volúmenes cancelada" -ForegroundColor Yellow
        return
    }
    
    # Mostrar volúmenes antes de limpiar
    $volumesBefore = docker volume ls -q
    $volumeCount = ($volumesBefore | Measure-Object).Count
    
    Write-Host "Volúmenes antes de limpiar: $volumeCount" -ForegroundColor Yellow
    
    # Limpiar volúmenes no utilizados
    docker volume prune -f
    
    # Mostrar volúmenes después de limpiar
    $volumesAfter = docker volume ls -q
    $volumeCountAfter = ($volumesAfter | Measure-Object).Count
    
    Write-Host "Volúmenes después de limpiar: $volumeCountAfter" -ForegroundColor Yellow
    Write-Host "✓ Volúmenes limpiados" -ForegroundColor Green
}

# Función para limpiar redes
function Clean-Networks {
    Write-Host "Limpiando redes no utilizadas..." -ForegroundColor Cyan
    
    # Mostrar redes antes de limpiar
    $networksBefore = docker network ls -q
    $networkCount = ($networksBefore | Measure-Object).Count
    
    Write-Host "Redes antes de limpiar: $networkCount" -ForegroundColor Yellow
    
    # Limpiar redes no utilizadas
    docker network prune -f
    
    # Mostrar redes después de limpiar
    $networksAfter = docker network ls -q
    $networkCountAfter = ($networksAfter | Measure-Object).Count
    
    Write-Host "Redes después de limpiar: $networkCountAfter" -ForegroundColor Yellow
    Write-Host "✓ Redes limpiadas" -ForegroundColor Green
}

# Función para limpieza completa
function Clean-All {
    Write-Host "Realizando limpieza completa del sistema Docker..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los recursos no utilizados" -ForegroundColor Red
    Write-Host "   Incluyendo imágenes, contenedores, volúmenes y redes" -ForegroundColor Red
    Write-Host ""
    $response = Read-Host "¿Estás seguro de que deseas continuar? (escribe 'SI' para confirmar)"
    if ($response -ne "SI") {
        Write-Host "Limpieza completa cancelada" -ForegroundColor Yellow
        exit 0
    }
    
    # Detener servicios INIA si están ejecutándose
    Write-Host "Deteniendo servicios INIA..." -ForegroundColor Yellow
    docker-compose down 2>$null
    
    # Limpieza completa del sistema
    Write-Host "Ejecutando limpieza completa..." -ForegroundColor Cyan
    docker system prune -a --volumes -f
    
    Write-Host "✓ Limpieza completa realizada" -ForegroundColor Green
}

# Ejecutar limpieza según las opciones especificadas
if ($All) {
    Clean-All
} else {
    if ($Images) {
        Clean-Images
        Write-Host ""
    }
    
    if ($Containers) {
        Clean-Containers
        Write-Host ""
    }
    
    if ($Volumes) {
        Clean-Volumes
        Write-Host ""
    }
    
    if ($Networks) {
        Clean-Networks
        Write-Host ""
    }
}

# Mostrar resumen final
Write-Host "=== Limpieza Completada ===" -ForegroundColor Green
Write-Host ""
Write-Host "Para ver el estado actual del sistema:" -ForegroundColor Yellow
Write-Host "  .\docker-scripts\status.ps1 -Detailed" -ForegroundColor White
Write-Host ""
Write-Host "Para reconstruir el proyecto:" -ForegroundColor Yellow
Write-Host "  .\docker-scripts\build.ps1" -ForegroundColor White
Write-Host "  .\docker-scripts\start.ps1" -ForegroundColor White
