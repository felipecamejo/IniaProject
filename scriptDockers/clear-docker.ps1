# Script para limpiar completamente Docker (INIA)
# Ubicación: IniaProject/scriptDockers/clear-docker.ps1
# ADVERTENCIA: Esto eliminará TODO (contenedores, imágenes, volúmenes, redes)

Write-Host "============================================" -ForegroundColor Red
Write-Host "  LIMPIAR COMPLETAMENTE DOCKER (INIA)      " -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red
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
    Write-Host "ERROR: Docker Desktop no está ejecutándose" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "  1. Inicia Docker Desktop" -ForegroundColor White
    Write-Host "  2. Espera a que esté completamente iniciado" -ForegroundColor White
    Write-Host "  3. Vuelve a ejecutar este script" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Docker Desktop está ejecutándose correctamente" -ForegroundColor Green
Write-Host ""

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "⚠️  ADVERTENCIA CRÍTICA ⚠️" -ForegroundColor Red
Write-Host ""
Write-Host "Esta operación eliminará:" -ForegroundColor Yellow
Write-Host "  • Todos los contenedores de INIA" -ForegroundColor White
Write-Host "  • Todas las imágenes Docker del proyecto" -ForegroundColor White
Write-Host "  • Todos los volúmenes (BASE DE DATOS COMPLETA)" -ForegroundColor White
Write-Host "  • Todas las redes personalizadas" -ForegroundColor White
Write-Host "  • Cache de construcción" -ForegroundColor White
Write-Host ""
Write-Host "PERDERÁS:" -ForegroundColor Red
Write-Host "  • Todos los usuarios" -ForegroundColor White
Write-Host "  • Todos los lotes" -ForegroundColor White
Write-Host "  • Todos los análisis" -ForegroundColor White
Write-Host "  • Todos los certificados" -ForegroundColor White
Write-Host "  • Toda la configuración" -ForegroundColor White
Write-Host ""
Write-Host "Esto es útil solo si:" -ForegroundColor Cyan
Write-Host "  • Quieres empezar completamente desde cero" -ForegroundColor White
Write-Host "  • Tienes problemas graves con Docker" -ForegroundColor White
Write-Host "  • Necesitas liberar mucho espacio en disco" -ForegroundColor White
Write-Host ""

$confirm1 = Read-Host "¿Estás ABSOLUTAMENTE seguro? Escribe 'LIMPIAR' para confirmar"

if ($confirm1 -ne "LIMPIAR") {
    Write-Host ""
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 0
}

Write-Host ""
$confirm2 = Read-Host "Última confirmación. Escribe 'SI ELIMINAR TODO' para proceder"

if ($confirm2 -ne "SI ELIMINAR TODO") {
    Write-Host ""
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 0
}

Write-Host ""
Write-Host "Iniciando limpieza completa..." -ForegroundColor Red
Write-Host ""

# Paso 1: Detener y eliminar contenedores con volúmenes
Write-Host "[1/5] Deteniendo y eliminando contenedores con volúmenes..." -ForegroundColor Yellow
docker compose down -v
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Contenedores y volúmenes eliminados" -ForegroundColor Green
} else {
    Write-Host "⚠ Advertencia al eliminar contenedores" -ForegroundColor Yellow
}
Write-Host ""

# Paso 2: Eliminar imágenes del proyecto
Write-Host "[2/5] Eliminando imágenes del proyecto..." -ForegroundColor Yellow
$images = docker images --filter "reference=*inia*" -q
if ($images) {
    docker rmi -f $images
    Write-Host "✓ Imágenes del proyecto eliminadas" -ForegroundColor Green
} else {
    Write-Host "ℹ No hay imágenes del proyecto para eliminar" -ForegroundColor Gray
}
Write-Host ""

# Paso 3: Limpiar sistema Docker (contenedores, imágenes no usadas, redes, cache)
Write-Host "[3/5] Limpiando sistema Docker..." -ForegroundColor Yellow
docker system prune -af --volumes
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Sistema Docker limpiado" -ForegroundColor Green
} else {
    Write-Host "⚠ Advertencia al limpiar sistema" -ForegroundColor Yellow
}
Write-Host ""

# Paso 4: Limpiar cache de build
Write-Host "[4/5] Limpiando cache de construcción..." -ForegroundColor Yellow
docker builder prune -af
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Cache de construcción eliminado" -ForegroundColor Green
} else {
    Write-Host "⚠ Advertencia al limpiar cache" -ForegroundColor Yellow
}
Write-Host ""

# Paso 5: Verificar limpieza
Write-Host "[5/5] Verificando limpieza..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Contenedores restantes:" -ForegroundColor Cyan
docker ps -a
Write-Host ""
Write-Host "Volúmenes restantes:" -ForegroundColor Cyan
docker volume ls
Write-Host ""
Write-Host "Espacio recuperado:" -ForegroundColor Cyan
docker system df
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "  LIMPIEZA COMPLETA FINALIZADA             " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Todo ha sido eliminado exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "Para volver a usar el proyecto:" -ForegroundColor Yellow
Write-Host "  1. Ejecuta: .\scriptDockers\recrear-docker.ps1" -ForegroundColor White
Write-Host "  2. Selecciona la opción de recrear todo" -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para salir"

