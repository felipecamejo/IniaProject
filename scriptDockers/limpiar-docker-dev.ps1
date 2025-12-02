# Script para limpiar recursos Docker - Modo Desarrollo
# Ubicación: IniaProject/scriptDockers/limpiar-docker-dev.ps1
# ADVERTENCIA: Esto eliminará contenedores, imágenes y volúmenes de desarrollo

Write-Host "============================================" -ForegroundColor Red
Write-Host "  LIMPIAR DOCKER - DESARROLLO            " -ForegroundColor Red
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
    Write-Host "ERROR: Docker Desktop no esta ejecutandose" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "  1. Inicia Docker Desktop" -ForegroundColor White
    Write-Host "  2. Espera a que este completamente iniciado" -ForegroundColor White
    Write-Host "  3. Vuelve a ejecutar este script" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Docker Desktop esta ejecutandose correctamente" -ForegroundColor Green
Write-Host ""

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "ADVERTENCIA CRITICA" -ForegroundColor Red
Write-Host ""
Write-Host "Esta operacion eliminara:" -ForegroundColor Yellow
Write-Host "  • Todos los contenedores de desarrollo de INIA" -ForegroundColor White
Write-Host "  • Todas las imagenes Docker del proyecto (desarrollo)" -ForegroundColor White
Write-Host "  • Todos los volumenes de desarrollo (BASE DE DATOS COMPLETA)" -ForegroundColor White
Write-Host "  • Todas las redes personalizadas de desarrollo" -ForegroundColor White
Write-Host "  • Cache de construccion" -ForegroundColor White
Write-Host ""
Write-Host "PERDERAS:" -ForegroundColor Red
Write-Host "  • Todos los usuarios" -ForegroundColor White
Write-Host "  • Todos los lotes" -ForegroundColor White
Write-Host "  • Todos los analisis" -ForegroundColor White
Write-Host "  • Todos los certificados" -ForegroundColor White
Write-Host "  • Toda la configuracion" -ForegroundColor White
Write-Host ""
Write-Host "Esto es util solo si:" -ForegroundColor Cyan
Write-Host "  • Quieres empezar completamente desde cero" -ForegroundColor White
Write-Host "  • Tienes problemas graves con Docker" -ForegroundColor White
Write-Host "  • Necesitas liberar mucho espacio en disco" -ForegroundColor White
Write-Host ""

$confirm1 = Read-Host "Estas ABSOLUTAMENTE seguro? Escribe 'LIMPIAR' para confirmar"

if ($confirm1 -ne "LIMPIAR") {
    Write-Host ""
    Write-Host "Operacion cancelada" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 0
}

Write-Host ""
$confirm2 = Read-Host "Ultima confirmacion. Escribe 'SI ELIMINAR TODO' para proceder"

if ($confirm2 -ne "SI ELIMINAR TODO") {
    Write-Host ""
    Write-Host "Operacion cancelada" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 0
}

Write-Host ""
Write-Host "Iniciando limpieza completa..." -ForegroundColor Red
Write-Host ""

# Paso 1: Detener y eliminar contenedores con volúmenes
Write-Host "[1/5] Deteniendo y eliminando contenedores con volumenes..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml down -v
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Contenedores y volumenes eliminados" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA al eliminar contenedores" -ForegroundColor Yellow
}
Write-Host ""

# Paso 2: Eliminar imágenes del proyecto (desarrollo)
Write-Host "[2/5] Eliminando imagenes del proyecto (desarrollo)..." -ForegroundColor Yellow
$images = docker images --filter "reference=*inia*" -q
if ($images) {
    docker rmi -f $images
    Write-Host "OK Imagenes del proyecto eliminadas" -ForegroundColor Green
} else {
    Write-Host "No hay imagenes del proyecto para eliminar" -ForegroundColor Gray
}
Write-Host ""

# Paso 3: Limpiar sistema Docker (solo recursos no usados)
Write-Host "[3/5] Limpiando sistema Docker (recursos no usados)..." -ForegroundColor Yellow
docker system prune -f
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Sistema Docker limpiado" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA al limpiar sistema" -ForegroundColor Yellow
}
Write-Host ""

# Paso 4: Limpiar cache de build
Write-Host "[4/5] Limpiando cache de construccion..." -ForegroundColor Yellow
docker builder prune -f
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Cache de construccion eliminado" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA al limpiar cache" -ForegroundColor Yellow
}
Write-Host ""

# Paso 5: Verificar limpieza
Write-Host "[5/5] Verificando limpieza..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Contenedores restantes:" -ForegroundColor Cyan
docker ps -a --filter "name=inia-*-dev"
Write-Host ""
Write-Host "Volumenes restantes:" -ForegroundColor Cyan
docker volume ls --filter "name=*dev*"
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
Write-Host "  1. Ejecuta: .\scriptDockers\recrear-docker-dev.ps1" -ForegroundColor White
Write-Host "  2. Selecciona la opcion de recrear todo" -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para salir"

