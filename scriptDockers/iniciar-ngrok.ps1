# Script para iniciar ngrok y exponer los servicios Docker de INIA
# Ubicación: IniaProject/scriptDockers/iniciar-ngrok.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Iniciar NGROK para INIA Docker " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si ngrok está instalado
function Test-NgrokInstalled {
    try {
        $null = ngrok version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# Verificar ngrok
if (-not (Test-NgrokInstalled)) {
    Write-Host "ERROR: ngrok no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instala ngrok desde: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "O ejecuta: choco install ngrok" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "ngrok está instalado" -ForegroundColor Green
Write-Host ""

# Verificar que Docker esté corriendo
try {
    $null = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker no está ejecutándose" -ForegroundColor Red
        Write-Host "Inicia Docker Desktop primero" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Presiona Enter para salir"
        exit 1
    }
} catch {
    Write-Host "ERROR: Docker no está ejecutándose" -ForegroundColor Red
    Write-Host "Inicia Docker Desktop primero" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Docker está ejecutándose" -ForegroundColor Green
Write-Host ""

# Verificar que los servicios estén corriendo
$containers = docker compose ps --format json | ConvertFrom-Json
$runningContainers = $containers | Where-Object { $_.State -eq "running" }

if ($runningContainers.Count -eq 0) {
    Write-Host "ADVERTENCIA: No hay contenedores corriendo" -ForegroundColor Yellow
    Write-Host "Inicia los servicios primero con: docker compose up -d" -ForegroundColor Yellow
    Write-Host "O ejecuta: .\scriptDockers\iniciar-docker.ps1" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Opciones de túnel ngrok:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Frontend (puerto 80)" -ForegroundColor White
Write-Host "  2. Backend API (puerto 8080)" -ForegroundColor White
Write-Host "  3. Middleware API (puerto 9099)" -ForegroundColor White
Write-Host "  4. Todos los servicios (múltiples túneles)" -ForegroundColor White
Write-Host "  5. Cancelar" -ForegroundColor White
Write-Host ""
$opcion = Read-Host "Selecciona una opción (1-5)"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "Iniciando túnel ngrok para Frontend (puerto 80)..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "URLs disponibles:" -ForegroundColor Cyan
        Write-Host "  Local:  http://localhost" -ForegroundColor White
        Write-Host "  ngrok:  https://[túnel].ngrok.io" -ForegroundColor White
        Write-Host ""
        Write-Host "Presiona Ctrl+C para detener ngrok" -ForegroundColor Red
        Write-Host ""
        ngrok http 80
    }
    "2" {
        Write-Host ""
        Write-Host "Iniciando túnel ngrok para Backend API (puerto 8080)..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "URLs disponibles:" -ForegroundColor Cyan
        Write-Host "  Local:  http://localhost:8080/Inia" -ForegroundColor White
        Write-Host "  Swagger: http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
        Write-Host "  ngrok:  https://[túnel].ngrok.io" -ForegroundColor White
        Write-Host ""
        Write-Host "Presiona Ctrl+C para detener ngrok" -ForegroundColor Red
        Write-Host ""
        ngrok http 8080
    }
    "3" {
        Write-Host ""
        Write-Host "Iniciando túnel ngrok para Middleware API (puerto 9099)..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "URLs disponibles:" -ForegroundColor Cyan
        Write-Host "  Local:  http://localhost:9099" -ForegroundColor White
        Write-Host "  ngrok:  https://[túnel].ngrok.io" -ForegroundColor White
        Write-Host ""
        Write-Host "Presiona Ctrl+C para detener ngrok" -ForegroundColor Red
        Write-Host ""
        ngrok http 9099
    }
    "4" {
        Write-Host ""
        Write-Host "Iniciando múltiples túneles ngrok..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Se abrirán 3 ventanas de PowerShell, una para cada servicio:" -ForegroundColor Cyan
        Write-Host "  - Frontend (puerto 80)" -ForegroundColor White
        Write-Host "  - Backend (puerto 8080)" -ForegroundColor White
        Write-Host "  - Middleware (puerto 9099)" -ForegroundColor White
        Write-Host ""
        
        $confirm = Read-Host "¿Continuar? (S/N)"
        if ($confirm -eq "S" -or $confirm -eq "s") {
            # Iniciar ngrok para Frontend
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'NGROK - Frontend (puerto 80)' -ForegroundColor Cyan; ngrok http 80"
            
            Start-Sleep -Seconds 2
            
            # Iniciar ngrok para Backend
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'NGROK - Backend (puerto 8080)' -ForegroundColor Cyan; ngrok http 8080"
            
            Start-Sleep -Seconds 2
            
            # Iniciar ngrok para Middleware
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'NGROK - Middleware (puerto 9099)' -ForegroundColor Cyan; ngrok http 9099"
            
            Write-Host ""
            Write-Host "Túneles ngrok iniciados en ventanas separadas" -ForegroundColor Green
            Write-Host ""
            Write-Host "Para ver las URLs de cada túnel, revisa las ventanas de ngrok" -ForegroundColor Yellow
            Write-Host "O visita: http://localhost:4040 (interfaz web de ngrok)" -ForegroundColor Cyan
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "Operación cancelada" -ForegroundColor Yellow
            Write-Host ""
        }
    }
    "5" {
        Write-Host ""
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        Write-Host ""
    }
    default {
        Write-Host ""
        Write-Host "Opción inválida" -ForegroundColor Red
        Write-Host ""
    }
}

Read-Host "Presiona Enter para salir"

