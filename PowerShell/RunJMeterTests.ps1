# Script para ejecutar pruebas de JMeter para la API INIA
# Uso: .\RunJMeterTests.ps1 [-TestPlan <nombre>] [-Mode <gui|nogui>] [-GenerateReport]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("INIA_API_Test_Plan", "INIA_API_Performance_Test")]
    [string]$TestPlan = "INIA_API_Test_Plan",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("gui", "nogui")]
    [string]$Mode = "nogui",
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:8080/Inia",
    
    [Parameter(Mandatory=$false)]
    [int]$Threads = 10,
    
    [Parameter(Mandatory=$false)]
    [int]$RampUp = 5,
    
    [Parameter(Mandatory=$false)]
    [int]$Loops = 5
)

# Función para escribir mensajes con color
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Verificar que JMeter esté instalado
function Test-JMeterInstalled {
    $jmeter = Get-Command jmeter -ErrorAction SilentlyContinue
    if ($jmeter) {
        Write-ColorOutput "JMeter encontrado: $($jmeter.Source)" "Green"
        return $true
    } else {
        Write-ColorOutput "JMeter no encontrado. Por favor, ejecuta primero: .\setup_Backend.ps1" "Red"
        return $false
    }
}

# Verificar que la API esté corriendo
function Test-APIRunning {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/seguridad/login" -Method POST -Body '{"email":"test","password":"test"}' -ContentType "application/json" -TimeoutSec 3 -ErrorAction SilentlyContinue
        Write-ColorOutput "API parece estar corriendo en $BaseUrl" "Green"
        return $true
    } catch {
        Write-ColorOutput "Advertencia: No se pudo conectar a la API en $BaseUrl" "Yellow"
        Write-ColorOutput "Asegúrate de que el backend esté corriendo antes de ejecutar las pruebas." "Yellow"
        $continue = Read-Host "¿Deseas continuar de todas formas? (s/N)"
        return ($continue -eq "s" -or $continue -eq "S")
    }
}

# Obtener ruta del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
$jmeterDir = Join-Path $projectRoot "jmeter"
$scriptsDir = Join-Path $jmeterDir "scripts"
$resultsDir = Join-Path $jmeterDir "results"
$reportsDir = Join-Path $jmeterDir "reports"

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

# Verificar instalación de JMeter
if (!(Test-JMeterInstalled)) {
    exit 1
}

# Verificar API (solo advertencia, no bloquea)
Test-APIRunning | Out-Null

# Construir ruta del plan de prueba
$testPlanFile = Join-Path $scriptsDir "$TestPlan.jmx"

if (!(Test-Path $testPlanFile)) {
    Write-ColorOutput "Error: Plan de prueba no encontrado: $testPlanFile" "Red"
    exit 1
}

Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput "    Ejecutando Pruebas JMeter - API INIA      " "Cyan"
Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput ""
Write-ColorOutput "Plan de Prueba: $TestPlan" "White"
Write-ColorOutput "Modo: $Mode" "White"
Write-ColorOutput "Base URL: $BaseUrl" "White"

if ($TestPlan -eq "INIA_API_Performance_Test") {
    Write-ColorOutput "Threads: $Threads" "White"
    Write-ColorOutput "Ramp Up: $RampUp segundos" "White"
    Write-ColorOutput "Loops: $Loops" "White"
}

Write-ColorOutput ""

# Generar nombre de archivo de resultados con timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resultsFile = Join-Path $resultsDir "$TestPlan-$timestamp.jtl"

if ($Mode -eq "gui") {
    # Modo GUI - Abrir JMeter con el plan de prueba
    Write-ColorOutput "Abriendo JMeter en modo GUI..." "Yellow"
    Write-ColorOutput "Archivo: $testPlanFile" "Cyan"
    
    # Abrir JMeter GUI con el plan de prueba
    Start-Process "jmeter" -ArgumentList "-t", "`"$testPlanFile`""
    
    Write-ColorOutput ""
    Write-ColorOutput "JMeter GUI abierto. Ejecuta las pruebas desde la interfaz." "Green"
} else {
    # Modo No-GUI
    Write-ColorOutput "Ejecutando pruebas en modo No-GUI..." "Yellow"
    
    # Construir comando JMeter
    $jmeterArgs = @(
        "-n",
        "-t", "`"$testPlanFile`"",
        "-l", "`"$resultsFile`"",
        "-JBASE_URL=$BaseUrl"
    )
    
    # Agregar argumentos específicos para pruebas de rendimiento
    if ($TestPlan -eq "INIA_API_Performance_Test") {
        $jmeterArgs += "-JTHREADS=$Threads"
        $jmeterArgs += "-JRAMP_UP=$RampUp"
        $jmeterArgs += "-JLOOPS=$Loops"
    }
    
    # Ejecutar JMeter
    Write-ColorOutput "Comando: jmeter $($jmeterArgs -join ' ')" "Cyan"
    Write-ColorOutput ""
    
    try {
        & jmeter $jmeterArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput ""
            Write-ColorOutput "Pruebas completadas exitosamente!" "Green"
            Write-ColorOutput "Resultados guardados en: $resultsFile" "Green"
            
            # Generar reporte HTML si se solicita
            if ($GenerateReport) {
                $reportDir = Join-Path $reportsDir "$TestPlan-report-$timestamp"
                Write-ColorOutput ""
                Write-ColorOutput "Generando reporte HTML..." "Yellow"
                
                & jmeter -g "`"$resultsFile`"" -o "`"$reportDir`""
                
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "Reporte HTML generado en: $reportDir" "Green"
                    Write-ColorOutput "Abre index.html en tu navegador para ver el reporte." "Cyan"
                } else {
                    Write-ColorOutput "Error al generar reporte HTML." "Red"
                }
            } else {
                Write-ColorOutput ""
                Write-ColorOutput "Para generar un reporte HTML, ejecuta:" "Yellow"
                Write-ColorOutput "  jmeter -g `"$resultsFile`" -o `"$reportsDir\$TestPlan-report-$timestamp`"" "Cyan"
            }
        } else {
            Write-ColorOutput "Error al ejecutar las pruebas. Código de salida: $LASTEXITCODE" "Red"
            exit $LASTEXITCODE
        }
    } catch {
        Write-ColorOutput "Error al ejecutar JMeter: $($_.Exception.Message)" "Red"
        exit 1
    }
}

Write-ColorOutput ""
Write-ColorOutput "Script completado." "Green"

