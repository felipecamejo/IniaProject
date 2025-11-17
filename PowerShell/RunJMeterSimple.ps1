# Script para abrir JMeter GUI
# Uso: .\RunJMeterSimple.ps1 [-Mode <gui|auto>]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("gui", "auto")]
    [string]$Mode = "auto"
)

# Función para escribir mensajes con color
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Obtener ruta del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
$jmeterDir = Join-Path $projectRoot "jmeter"
$scriptsDir = Join-Path $jmeterDir "scripts"
$resultsDir = Join-Path $jmeterDir "results"
$reportsDir = Join-Path $jmeterDir "reports"

# Configurar variables de entorno
$env:Path += ";C:\JMeter\JMeter\bin"
$env:JMETER_HOME = "C:\JMeter\JMeter"

# Verificar que JMeter esté instalado
$jmeterBat = Join-Path $env:JMETER_HOME "bin\jmeter.bat"
if (!(Test-Path $jmeterBat)) {
    Write-ColorOutput "JMeter no encontrado en: $jmeterBat" "Red"
    Write-ColorOutput "Por favor, ejecuta primero: .\PowerShell\setup_Backend.ps1" "Yellow"
    exit 1
}

# Verificar que existan los directorios
if (!(Test-Path $jmeterDir)) {
    Write-ColorOutput "Error: Directorio jmeter no encontrado en: $jmeterDir" "Red"
    exit 1
}

if (!(Test-Path $scriptsDir)) {
    Write-ColorOutput "Error: Directorio scripts no encontrado en: $scriptsDir" "Red"
    exit 1
}

# Crear directorios de resultados si no existen
if (!(Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null
    Write-ColorOutput "Directorio de resultados creado: $resultsDir" "Green"
}

if (!(Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null
    Write-ColorOutput "Directorio de reportes creado: $reportsDir" "Green"
}

Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput "    Abrir JMeter GUI                        " "Cyan"
Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput ""
Write-ColorOutput "Modo: $Mode" "White"
Write-ColorOutput ""

# Determinar modo de ejecución
if ($Mode -eq "auto") {
    # Auto: siempre GUI
    $Mode = "gui"
}

if ($Mode -eq "gui") {
    Write-ColorOutput "Abriendo JMeter en modo GUI..." "Yellow"
    Write-ColorOutput ""
    
    # Abrir JMeter GUI sin cargar ningún plan
    Start-Process "jmeter"
    
    Write-ColorOutput "JMeter GUI abierto." "Green"
    Write-ColorOutput ""
    Write-ColorOutput "Para cargar un plan de prueba:" "Yellow"
    Write-ColorOutput "  1. File → Open → Selecciona un archivo .jmx" "White"
    Write-ColorOutput "  2. O arrastra un archivo .jmx a la ventana de JMeter" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Script completado." "Green"
}
else {
    Write-ColorOutput "Este script solo abre JMeter en modo GUI." "Yellow"
    Write-ColorOutput "Para ejecutar pruebas en modo no-GUI, usa otro script como RunJMeterCrearUsuarios.ps1" "White"
    exit 0
}

