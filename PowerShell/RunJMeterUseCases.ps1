# Script para ejecutar pruebas de casos de uso con JMeter
# Uso: .\RunJMeterUseCases.ps1 [-Mode <gui|nogui|auto>] [-GenerateReport]

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

# Construir ruta del plan de prueba
# Por defecto usa la versión simple, cambiar a INIA_API_Use_Cases_Test.jmx para la versión completa
$testPlanFile = Join-Path $scriptsDir "INIA_API_Use_Cases_Test_Simple.jmx"

if (!(Test-Path $testPlanFile)) {
    Write-ColorOutput "Error: Plan de prueba no encontrado: $testPlanFile" "Red"
    exit 1
}

Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput "    Pruebas de Casos de Uso - JMeter          " "Cyan"
Write-ColorOutput "===============================================" "Cyan"
Write-ColorOutput ""
Write-ColorOutput "Plan de Prueba: INIA_API_Use_Cases_Test" "White"
Write-ColorOutput "Modo: $Mode" "White"
Write-ColorOutput "Base URL: $BaseUrl" "White"
Write-ColorOutput ""

# Generar nombre de archivo de resultados con timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resultsFile = Join-Path $resultsDir "INIA_API_Use_Cases_Test-$timestamp.jtl"

if ($Mode -eq "gui") {
    # Modo GUI - Solo abrir JMeter con el plan de prueba (sin ejecutar)
    Write-ColorOutput "Abriendo JMeter en modo GUI..." "Yellow"
    Write-ColorOutput "Archivo: $testPlanFile" "Cyan"
    
    # Cambiar al directorio del proyecto
    Push-Location $projectRoot
    
    try {
        # Abrir JMeter GUI con el plan de prueba cargado automáticamente
        Start-Process $jmeterBat -ArgumentList "-t", "`"$testPlanFile`"" -WorkingDirectory $projectRoot
        
        Write-ColorOutput ""
        Write-ColorOutput "JMeter GUI abierto con el plan de prueba cargado." "Green"
        Write-ColorOutput "El plan 'INIA_API_Use_Cases_Test' debería estar visible en la interfaz." "Cyan"
        Write-ColorOutput ""
        Write-ColorOutput "Para ejecutar las pruebas:" "Yellow"
        Write-ColorOutput "  1. Click en el botón 'Run' (▶️) o presiona Ctrl+R" "Cyan"
        Write-ColorOutput "  2. Ver resultados en 'View Results Tree' y 'Summary Report'" "Cyan"
    } finally {
        Pop-Location
    }
} elseif ($Mode -eq "auto") {
    # Modo AUTO - Abrir GUI, cargar plan y ejecutar automáticamente
    Write-ColorOutput "Modo AUTO: Abriendo JMeter GUI, cargando plan y ejecutando..." "Yellow"
    Write-ColorOutput "Archivo: $testPlanFile" "Cyan"
    
    # Cambiar al directorio del proyecto
    Push-Location $projectRoot
    
    try {
        # Primero ejecutar en modo no-GUI para obtener resultados
        Write-ColorOutput ""
        Write-ColorOutput "Ejecutando pruebas en modo No-GUI..." "Yellow"
        
        $jmeterArgs = @(
            "-n",
            "-t", "`"$testPlanFile`"",
            "-l", "`"$resultsFile`"",
            "-JBASE_URL=$BaseUrl"
        )
        
        Write-ColorOutput "Comando: jmeter $($jmeterArgs -join ' ')" "Cyan"
        Write-ColorOutput ""
        
        & $jmeterBat $jmeterArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput ""
            Write-ColorOutput "Pruebas de casos de uso completadas exitosamente!" "Green"
            Write-ColorOutput "Resultados guardados en: $resultsFile" "Green"
            
            # Generar reporte HTML
            if ($GenerateReport) {
                $reportDir = Join-Path $reportsDir "INIA_API_Use_Cases_Test-report-$timestamp"
                Write-ColorOutput ""
                Write-ColorOutput "Generando reporte HTML..." "Yellow"
                
                & $jmeterBat -g "`"$resultsFile`"" -o "`"$reportDir`""
                
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "Reporte HTML generado en: $reportDir" "Green"
                    Write-ColorOutput "Abre index.html en tu navegador para ver el reporte." "Cyan"
                }
            }
            
            # Ahora abrir JMeter GUI con el plan cargado para revisión
            Write-ColorOutput ""
            Write-ColorOutput "Abriendo JMeter GUI con el plan cargado para revisión..." "Yellow"
            Start-Process $jmeterBat -ArgumentList "-t", "`"$testPlanFile`"" -WorkingDirectory $projectRoot
            
            Write-ColorOutput ""
            Write-ColorOutput "JMeter GUI abierto. Puedes revisar el plan y ejecutarlo nuevamente si lo deseas." "Green"
        } else {
            Write-ColorOutput "Error al ejecutar las pruebas. Código de salida: $LASTEXITCODE" "Red"
            exit $LASTEXITCODE
        }
    } catch {
        Write-ColorOutput "Error al ejecutar JMeter: $($_.Exception.Message)" "Red"
        exit 1
    } finally {
        Pop-Location
    }
} else {
    # Modo No-GUI - Ejecutar automáticamente
    Write-ColorOutput "Ejecutando pruebas de casos de uso en modo No-GUI..." "Yellow"
    
    # Cambiar al directorio del proyecto
    Push-Location $projectRoot
    
    try {
        # Construir comando JMeter
        $jmeterArgs = @(
            "-n",
            "-t", "`"$testPlanFile`"",
            "-l", "`"$resultsFile`"",
            "-JBASE_URL=$BaseUrl"
        )
        
        # Ejecutar JMeter
        Write-ColorOutput "Comando: jmeter $($jmeterArgs -join ' ')" "Cyan"
        Write-ColorOutput ""
        
        & $jmeterBat $jmeterArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput ""
            Write-ColorOutput "Pruebas de casos de uso completadas exitosamente!" "Green"
            Write-ColorOutput "Resultados guardados en: $resultsFile" "Green"
            
            # Generar reporte HTML si se solicita
            if ($GenerateReport) {
                $reportDir = Join-Path $reportsDir "INIA_API_Use_Cases_Test-report-$timestamp"
                Write-ColorOutput ""
                Write-ColorOutput "Generando reporte HTML..." "Yellow"
                
                & $jmeterBat -g "`"$resultsFile`"" -o "`"$reportDir`""
                
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "Reporte HTML generado en: $reportDir" "Green"
                    Write-ColorOutput "Abre index.html en tu navegador para ver el reporte." "Cyan"
                } else {
                    Write-ColorOutput "Error al generar reporte HTML." "Red"
                }
            } else {
                Write-ColorOutput ""
                Write-ColorOutput "Para generar un reporte HTML, ejecuta:" "Yellow"
                Write-ColorOutput "  .\RunJMeterUseCases.ps1 -GenerateReport" "Cyan"
            }
        } else {
            Write-ColorOutput "Error al ejecutar las pruebas. Código de salida: $LASTEXITCODE" "Red"
            exit $LASTEXITCODE
        }
    } catch {
        Write-ColorOutput "Error al ejecutar JMeter: $($_.Exception.Message)" "Red"
        exit 1
    } finally {
        Pop-Location
    }
}

Write-ColorOutput ""
Write-ColorOutput "Script completado." "Green"

