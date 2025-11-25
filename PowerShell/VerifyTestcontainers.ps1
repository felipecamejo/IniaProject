# Script para verificar que Testcontainers está listo para ejecutar tests
# Verifica Docker y las dependencias necesarias

param(
    [switch]$RunTest,
    [string]$TestClass = "TestcontainersConnectionTest"
)

$ErrorActionPreference = "Stop"

# Colores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) {
    Write-ColorOutput Green "[OK] $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[ERROR] $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "[WARN] $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "[INFO] $message"
}

Write-Output ""
Write-ColorOutput Cyan "=========================================="
Write-ColorOutput Cyan "Verificación de Testcontainers - INIA"
Write-ColorOutput Cyan "=========================================="
Write-Output ""

# 1. Verificar Docker
Write-Info "Verificando Docker..."
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker está instalado: $dockerVersion"
    } else {
        Write-Error "Docker no está instalado o no está en el PATH"
        Write-Info "Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
        exit 1
    }
} catch {
    Write-Error "No se pudo verificar Docker: $_"
    Write-Info "Asegúrate de que Docker Desktop esté instalado"
    exit 1
}

# 2. Verificar que Docker está corriendo
Write-Info "Verificando que Docker está corriendo..."
try {
    $dockerPs = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker está corriendo"
    } else {
        Write-Error "Docker no está corriendo"
        Write-Info "Inicia Docker Desktop y espera a que esté completamente iniciado"
        Write-Info "Busca el ícono de Docker en la bandeja del sistema"
        exit 1
    }
} catch {
    Write-Error "No se pudo verificar el estado de Docker: $_"
    Write-Info "Inicia Docker Desktop y vuelve a intentar"
    exit 1
}

# 3. Verificar imagen de PostgreSQL
Write-Info "Verificando imagen de PostgreSQL..."
try {
    $postgresImage = docker images postgres:16-alpine 2>&1
    if ($LASTEXITCODE -eq 0 -and $postgresImage -match "postgres") {
        Write-Success "Imagen postgres:16-alpine está disponible"
    } else {
        Write-Warning "Imagen postgres:16-alpine no está disponible"
        Write-Info "Descargando imagen postgres:16-alpine..."
        docker pull postgres:16-alpine
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Imagen descargada correctamente"
        } else {
            Write-Error "No se pudo descargar la imagen"
            exit 1
        }
    }
} catch {
    Write-Error "Error al verificar imagen: $_"
    exit 1
}

# 4. Verificar Maven
Write-Info "Verificando Maven..."
try {
    $mvnVersion = mvn --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Maven está instalado"
    } else {
        Write-Error "Maven no está instalado o no está en el PATH"
        Write-Info "Instala Maven desde: https://maven.apache.org/download.cgi"
        exit 1
    }
} catch {
    Write-Error "No se pudo verificar Maven: $_"
    exit 1
}

# 5. Verificar que estamos en el directorio correcto
Write-Info "Verificando directorio del proyecto..."
if (Test-Path "pom.xml") {
    Write-Success "Directorio del proyecto correcto"
} else {
    Write-Error "No se encontró pom.xml. Ejecuta este script desde la raíz del proyecto"
    exit 1
}

# 6. Verificar dependencias de Maven
Write-Info "Verificando dependencias de Maven..."
try {
    $mvnDependencyCheck = mvn dependency:tree -Dincludes=org.testcontainers:* 2>&1 | Select-String "testcontainers"
    if ($mvnDependencyCheck) {
        Write-Success "Dependencias de Testcontainers encontradas"
    } else {
        Write-Warning "No se encontraron dependencias de Testcontainers en el árbol de dependencias"
        Write-Info "Ejecutando 'mvn clean install' para descargar dependencias..."
        mvn clean install -DskipTests
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependencias descargadas"
        } else {
            Write-Error "Error al descargar dependencias"
            exit 1
        }
    }
} catch {
    Write-Warning "No se pudo verificar dependencias: $_"
}

Write-Output ""
Write-ColorOutput Green "=========================================="
Write-Success "Todas las verificaciones pasaron"
Write-ColorOutput Green "=========================================="
Write-Output ""

# 7. Ejecutar test si se solicita
if ($RunTest) {
    Write-Info "Ejecutando test de verificación: $TestClass"
    Write-Output ""
    
    try {
        mvn test -Dtest=$TestClass
        if ($LASTEXITCODE -eq 0) {
            Write-Output ""
            Write-ColorOutput Green "=========================================="
            Write-Success "Test ejecutado correctamente"
            Write-ColorOutput Green "=========================================="
        } else {
            Write-Output ""
            Write-ColorOutput Red "=========================================="
            Write-Error "El test falló. Revisa los logs arriba"
            Write-ColorOutput Red "=========================================="
            exit 1
        }
    } catch {
        Write-Error "Error al ejecutar test: $_"
        exit 1
    }
} else {
    Write-Info "Para ejecutar el test de verificación, usa:"
    Write-Info "  .\PowerShell\VerifyTestcontainers.ps1 -RunTest"
    Write-Info ""
    Write-Info "O ejecuta manualmente:"
    Write-Info "  mvn test -Dtest=TestcontainersConnectionTest"
}

Write-Output ""

