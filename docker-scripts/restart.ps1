# Script de PowerShell para reiniciar los servicios Docker
# Uso: .\docker-scripts\restart.ps1 [servicio] [opciones]

param(
    [string]$Service = "all",
    [switch]$Build = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Reinicio Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\restart.ps1 [servicio] [opciones]"
    Write-Host ""
    Write-Host "Servicios disponibles:"
    Write-Host "  all        - Todos los servicios (por defecto)"
    Write-Host "  backend    - Solo backend Spring Boot"
    Write-Host "  frontend   - Solo frontend Angular"
    Write-Host "  middleware - Solo middleware Python"
    Write-Host "  database   - Solo base de datos (no recomendado)"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -Build     - Construir antes de reiniciar"
    Write-Host "  -Help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\restart.ps1"
    Write-Host "  .\docker-scripts\restart.ps1 backend -Build"
    Write-Host "  .\docker-scripts\restart.ps1 frontend"
    exit 0
}

Write-Host "=== Reiniciando Servicios Docker para INIA ===" -ForegroundColor Green
Write-Host "Servicio: $Service" -ForegroundColor Yellow
Write-Host "Construir antes: $Build" -ForegroundColor Yellow
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

# Advertencia especial para la base de datos
if ($Service.ToLower() -eq "database") {
    Write-Host "⚠️  ADVERTENCIA: Reiniciar la base de datos puede causar pérdida de datos" -ForegroundColor Red
    Write-Host "   Asegúrate de que no hay transacciones importantes en curso" -ForegroundColor Red
    Write-Host ""
    $response = Read-Host "¿Estás seguro de que deseas continuar? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        exit 0
    }
}

# Función para reiniciar un servicio específico
function Restart-Service {
    param([string]$ServiceName)
    
    Write-Host "Reiniciando $ServiceName..." -ForegroundColor Cyan
    
    # Detener el servicio
    docker-compose stop $ServiceName
    
    # Construir si es necesario
    if ($Build) {
        Write-Host "Construyendo $ServiceName..." -ForegroundColor Yellow
        docker-compose build $ServiceName
    }
    
    # Iniciar el servicio
    docker-compose up -d $ServiceName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $ServiceName reiniciado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "✗ Error reiniciando $ServiceName" -ForegroundColor Red
        exit 1
    }
}

# Reiniciar según el servicio especificado
switch ($Service.ToLower()) {
    "all" {
        Write-Host "Reiniciando todos los servicios..." -ForegroundColor Cyan
        
        # Detener todos los servicios
        docker-compose stop
        
        # Construir si es necesario
        if ($Build) {
            Write-Host "Construyendo todos los servicios..." -ForegroundColor Yellow
            docker-compose build
        }
        
        # Iniciar todos los servicios
        docker-compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Todos los servicios reiniciados exitosamente" -ForegroundColor Green
        } else {
            Write-Host "✗ Error reiniciando los servicios" -ForegroundColor Red
            exit 1
        }
    }
    "backend" {
        Restart-Service "backend"
    }
    "frontend" {
        Restart-Service "frontend"
    }
    "middleware" {
        Restart-Service "middleware"
    }
    "database" {
        Restart-Service "database"
    }
    default {
        Write-Host "Error: Servicio '$Service' no reconocido" -ForegroundColor Red
        Write-Host "Usa -Help para ver los servicios disponibles" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "=== Reinicio Completado ===" -ForegroundColor Green

# Mostrar estado después del reinicio
Write-Host ""
Write-Host "Verificando estado de los servicios..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

& .\docker-scripts\status.ps1

Write-Host ""
Write-Host "Para ver logs en tiempo real, usa: .\docker-scripts\logs.ps1 -Follow" -ForegroundColor Yellow
