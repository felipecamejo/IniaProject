# Script para ejecutar pruebas simplificadas de casos de uso con JMeter
# Uso: .\RunJMeterSimple.ps1 [-Mode <gui|nogui|auto>] [-GenerateReport]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("gui", "nogui", "auto")]
    [string]$Mode = "auto",
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport = $true,
    
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:8080/Inia"
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

# Construir ruta del plan de prueba simplificado
$testPlanFile = Join-Path $scriptsDir "INIA_API_Use_Cases_Test_Simple.jmx"

if (!(Test-Path $testPlanFile)) {
    Write-ColorOutput "Error: Plan de prueba no encontrado: $testPlanFile" "Red"
    exit 1
}

Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput "    Pruebas Simplificadas - JMeter          " "Cyan"
Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput ""
Write-ColorOutput "Plan de Prueba: INIA_API_Use_Cases_Test_Simple" "White"
Write-ColorOutput "Modo: $Mode" "White"
Write-ColorOutput "Base URL: $BaseUrl" "White"
Write-ColorOutput ""

# Determinar modo de ejecución
if ($Mode -eq "auto") {
    # Auto: GUI si hay display, sino no-GUI
    if ($env:DISPLAY -or $env:TERM) {
        $Mode = "gui"
    } else {
        $Mode = "nogui"
    }
}

if ($Mode -eq "gui") {
    Write-ColorOutput "Abriendo JMeter en modo GUI..." "Yellow"
    Write-ColorOutput "Archivo: $testPlanFile" "Cyan"
    Write-ColorOutput ""
    
    # Abrir JMeter GUI con el plan de prueba cargado
    Start-Process "jmeter" -ArgumentList "-t", "`"$testPlanFile`""
    
    Write-ColorOutput "JMeter GUI abierto con el plan de prueba cargado." "Green"
    Write-ColorOutput "El plan 'INIA_API_Use_Cases_Test_Simple' debería estar visible en la interfaz." "Green"
    Write-ColorOutput ""
    Write-ColorOutput "Para ejecutar las pruebas:" "Yellow"
    Write-ColorOutput "  1. Click en el botón 'Run' (▶) o presiona Ctrl+R" "White"
    Write-ColorOutput "  2. Ver resultados en 'View Results Tree' y 'Summary Report'" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Script completado." "Green"
}
else {
    # Modo no-GUI
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $resultsFile = Join-Path $resultsDir "simple-test-results-$timestamp.jtl"
    $reportDir = Join-Path $reportsDir "simple-report-$timestamp"
    
    Write-ColorOutput "Ejecutando pruebas en modo no-GUI..." "Yellow"
    Write-ColorOutput "Resultados: $resultsFile" "Cyan"
    Write-ColorOutput ""
    
    # Ejecutar JMeter en modo no-GUI
    $jmeterArgs = @(
        "-n",
        "-t", "`"$testPlanFile`"",
        "-l", "`"$resultsFile`"",
        "-JBASE_URL=$BaseUrl"
    )
    
    if ($GenerateReport) {
        $jmeterArgs += "-e"
        $jmeterArgs += "-o"
        $jmeterArgs += "`"$reportDir`""
    }
    
    & $jmeterBat $jmeterArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput ""
        Write-ColorOutput "Pruebas completadas exitosamente!" "Green"
        Write-ColorOutput "Resultados guardados en: $resultsFile" "Cyan"
        
        if ($GenerateReport) {
            Write-ColorOutput "Reporte HTML generado en: $reportDir" "Cyan"
            Write-ColorOutput ""
            Write-ColorOutput "Para ver el reporte, abre en tu navegador:" "Yellow"
            Write-ColorOutput "  file:///$($reportDir -replace '\\', '/')/index.html" "White"
        }
    } else {
        Write-ColorOutput ""
        Write-ColorOutput "Error al ejecutar las pruebas. Código de salida: $LASTEXITCODE" "Red"
        exit $LASTEXITCODE
    }
}

