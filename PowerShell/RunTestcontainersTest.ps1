# Script para ejecutar TestcontainersConnectionTest
# Busca Maven en ubicaciones comunes y ejecuta el test

param(
    [string]$TestClass = "ti.proyectoinia.config.TestcontainersConnectionTest"
)

$ErrorActionPreference = "Stop"

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

function Write-Info($message) {
    Write-ColorOutput Cyan "[INFO] $message"
}

# Buscar Maven en ubicaciones comunes
function Find-Maven {
    Write-Info "Buscando Maven..."
    
    # 1. Verificar si está en PATH
    try {
        $mvn = Get-Command mvn -ErrorAction SilentlyContinue
        if ($mvn) {
            Write-Success "Maven encontrado en PATH: $($mvn.Source)"
            return $mvn.Source
        }
    } catch {
        # Continuar buscando
    }
    
    # 2. Buscar en ubicaciones comunes de Windows
    $commonPaths = @(
        "$env:ProgramFiles\Apache\maven\bin\mvn.cmd",
        "$env:ProgramFiles(x86)\Apache\maven\bin\mvn.cmd",
        "$env:LOCALAPPDATA\Programs\Apache\maven\bin\mvn.cmd",
        "C:\Program Files\Apache\maven\bin\mvn.cmd",
        "C:\Program Files (x86)\Apache\maven\bin\mvn.cmd",
        "C:\apache-maven\bin\mvn.cmd",
        "C:\maven\bin\mvn.cmd"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            Write-Success "Maven encontrado en: $path"
            return $path
        }
    }
    
    # 3. Buscar en variables de entorno
    $mavenHome = $env:MAVEN_HOME
    if ($mavenHome -and (Test-Path "$mavenHome\bin\mvn.cmd")) {
        Write-Success "Maven encontrado en MAVEN_HOME: $mavenHome\bin\mvn.cmd"
        return "$mavenHome\bin\mvn.cmd"
    }
    
    Write-Error "Maven no encontrado"
    Write-Info "Opciones:"
    Write-Info "1. Instalar Maven: choco install maven -y"
    Write-Info "2. Descargar desde: https://maven.apache.org/download.cgi"
    Write-Info "3. Ejecutar desde el IDE (IntelliJ IDEA o VS Code)"
    return $null
}

Write-Output ""
Write-ColorOutput Cyan "=========================================="
Write-ColorOutput Cyan "Ejecutar TestcontainersConnectionTest"
Write-ColorOutput Cyan "=========================================="
Write-Output ""

# Verificar Docker
Write-Info "Verificando Docker..."
try {
    $dockerPs = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker está corriendo"
    } else {
        Write-Error "Docker no está corriendo"
        Write-Info "Inicia Docker Desktop antes de continuar"
        exit 1
    }
} catch {
    Write-Error "Docker no está disponible"
    exit 1
}

# Buscar Maven
$mavenPath = Find-Maven
if (-not $mavenPath -or $mavenPath -eq "") {
    Write-Output ""
    Write-ColorOutput Yellow "=========================================="
    Write-ColorOutput Yellow "Maven no encontrado en el sistema"
    Write-ColorOutput Yellow "=========================================="
    Write-Output ""
    Write-Info "Puedes ejecutar el test desde tu IDE:"
    Write-Info "1. Abre: src/test/java/ti/proyectoinia/config/TestcontainersConnectionTest.java"
    Write-Info "2. Click derecho en la clase o método"
    Write-Info "3. Selecciona 'Run Test' o 'Debug Test'"
    Write-Output ""
    Write-Info "O instala Maven:"
    Write-Info "  choco install maven -y"
    Write-Info "  O descarga desde: https://maven.apache.org/download.cgi"
    Write-Output ""
    exit 1
}

# Ejecutar el test
Write-Output ""
Write-Info "Ejecutando test: $TestClass"
Write-Info "Comando: $mavenPath test -Dtest=$TestClass"
Write-Output ""

try {
    & $mavenPath test -Dtest=$TestClass
    $exitCode = $LASTEXITCODE
} catch {
    Write-Error "Error al ejecutar Maven: $_"
    $exitCode = 1
}

if ($LASTEXITCODE -eq 0) {
    Write-Output ""
    Write-Success "Test ejecutado correctamente"
} else {
    Write-Output ""
    Write-Error "El test falló o no se encontró"
    Write-Info "Verifica que el nombre del test sea correcto"
    Write-Info "Nombre usado: $TestClass"
}

