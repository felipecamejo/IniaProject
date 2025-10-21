# ========================================
# COMPLETE CONFIGURATION - INIA SYSTEM
# ========================================
# Master script that executes all configuration and setup files in sequence

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "help")]
    [string]$Mode = "all"
)

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor White
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "OK: $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "INFO: $Message" -ForegroundColor Cyan
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Execute-Script {
    param(
        [string]$ScriptPath,
        [string]$Description,
        [string]$Parameters = "",
        [string]$ProjectRoot = ""
    )
    
    Write-Info "Executing: $Description"
    Write-Host "Script: $ScriptPath" -ForegroundColor Gray
    
    # Validate that ScriptPath is not empty
    if ([string]::IsNullOrEmpty($ScriptPath)) {
        Write-Error "Script path is empty or null"
        return $false
    }
    
    if (-not (Test-Path $ScriptPath)) {
        Write-Error "Script not found: $ScriptPath"
        return $false
    }
    
    # Save current directory
    $currentDir = Get-Location
    
    try {
        # Execute the script from current directory (project root)
        if ($Parameters -and $ProjectRoot) {
            & $ScriptPath $Parameters -ProjectRoot $ProjectRoot
        } elseif ($Parameters) {
            & $ScriptPath $Parameters
        } elseif ($ProjectRoot) {
            & $ScriptPath -ProjectRoot $ProjectRoot
        } else {
            & $ScriptPath
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$Description completed successfully"
            return $true
        } else {
            Write-Error "$Description failed with exit code: $LASTEXITCODE"
            return $false
        }
    } catch {
        Write-Error "Error executing $Description : $($_.Exception.Message)"
        return $false
    } finally {
        # Restore original directory
        Set-Location $currentDir
    }
}

function Setup-Backend {
    Write-Header "BACKEND CONFIGURATION"
    
    # Check if Java is installed
    if (-not (Test-Command "java")) {
        Write-Warning "Java is not installed. Installing JMeter (includes Java)..."
        
        $scriptPath = Join-Path $scriptDir "setup_Backend.ps1"
        Write-Info "Backend script path: $scriptPath"
        
        return Execute-Script -ScriptPath $scriptPath -Description "JMeter/Java Configuration" -ProjectRoot $projectRoot
    } else {
        Write-Success "Java is already installed"
        return $true
    }
}

function Setup-Middleware {
    Write-Header "MIDDLEWARE CONFIGURATION"
    
    # Check if Python is installed
    if (-not (Test-Command "py")) {
        Write-Error "Python is not installed. Install Python 3.8+ and run again."
        return $false
    }
    
    $scriptPath = Join-Path $scriptDir "SetupMiddleware.ps1"
    Write-Info "Middleware script path: $scriptPath"
    
    return Execute-Script -ScriptPath $scriptPath -Description "Python Middleware Configuration" -ProjectRoot $projectRoot
}

function Setup-PWA {
    Write-Header "PWA CONFIGURATION"
    
    # Check if Node.js is installed
    if (-not (Test-Command "node")) {
        Write-Error "Node.js is not installed. Install Node.js 18+ and run again."
        return $false
    }
    
    # Check if npm is installed
    if (-not (Test-Command "npm")) {
        Write-Error "npm is not installed. Install npm and run again."
        return $false
    }
    
    $scriptPath = Join-Path $scriptDir "configPWA.ps1"
    Write-Info "PWA script path: $scriptPath"
    
    return Execute-Script -ScriptPath $scriptPath -Description "PWA Configuration" -Parameters "setup" -ProjectRoot $projectRoot
}

function Setup-Ngrok {
    Write-Header "NGROK CONFIGURATION"
    
    $scriptPath = Join-Path $scriptDir "SetupNgrok.ps1"
    Write-Info "Ngrok script path: $scriptPath"
    
    return Execute-Script -ScriptPath $scriptPath -Description "Ngrok Configuration" -ProjectRoot $projectRoot
}

function Build-PWA {
    Write-Header "BUILD PWA"
    
    # Check that PWA is configured
    if (-not (Test-Path "frontend/ngsw-config.json")) {
        Write-Error "PWA is not configured. Run PWA configuration first."
        return $false
    }
    
    $scriptPath = Join-Path $scriptDir "BuildPWA.ps1"
    Write-Info "Build PWA script path: $scriptPath"
    
    return Execute-Script -ScriptPath $scriptPath -Description "Build PWA" -Parameters "build" -ProjectRoot $projectRoot
}

function Setup-All {
    Write-Header "COMPLETE INIA SYSTEM CONFIGURATION"
    
    Write-Info "Starting complete system configuration..."
    Write-Host "This process will configure:" -ForegroundColor White
    Write-Host "  1. Backend (Java/JMeter)" -ForegroundColor Gray
    Write-Host "  2. Middleware (Python/FastAPI)" -ForegroundColor Gray
    Write-Host "  3. PWA (Angular/Service Worker)" -ForegroundColor Gray
    Write-Host "  4. Ngrok (HTTPS Tunnel)" -ForegroundColor Gray
    Write-Host "  5. Build PWA (Production build)" -ForegroundColor Gray
    Write-Host ""
    
    # 1. Configure Backend
    Write-Info "Step 1/5: Configuring Backend..."
    $backendResult = Setup-Backend
    if (-not $backendResult) {
        Write-Error "CONFIGURATION FAILED: Backend could not be configured"
        Write-Host "Stopping execution. Check previous errors." -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    
    # 2. Configure Middleware
    Write-Info "Step 2/5: Configuring Middleware..."
    $middlewareResult = Setup-Middleware
    if (-not $middlewareResult) {
        Write-Error "CONFIGURATION FAILED: Middleware could not be configured"
        Write-Host "Stopping execution. Check previous errors." -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    
    # 3. Configure PWA
    Write-Info "Step 3/5: Configuring PWA..."
    $pwaResult = Setup-PWA
    if (-not $pwaResult) {
        Write-Error "CONFIGURATION FAILED: PWA could not be configured"
        Write-Host "Stopping execution. Check previous errors." -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    
    # 4. Configure Ngrok
    Write-Info "Step 4/5: Configuring Ngrok..."
    $ngrokResult = Setup-Ngrok
    if (-not $ngrokResult) {
        Write-Error "CONFIGURATION FAILED: Ngrok could not be configured"
        Write-Host "Stopping execution. Check previous errors." -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    
    # 5. Build PWA
    Write-Info "Step 5/5: Building PWA..."
    $buildResult = Build-PWA
    if (-not $buildResult) {
        Write-Error "CONFIGURATION FAILED: PWA build could not be completed"
        Write-Host "Stopping execution. Check previous errors." -ForegroundColor Red
        exit 1
    }
    
    # Show success summary
    Write-Header "COMPLETE CONFIGURATION SUCCESSFUL"
    Write-Success "All INIA system components have been configured correctly"
    Write-Host ""
    Write-Host "The INIA system is ready to use:" -ForegroundColor White
    Write-Host "  - Backend: Java/JMeter configured" -ForegroundColor Gray
    Write-Host "  - Middleware: Python/FastAPI configured" -ForegroundColor Gray
    Write-Host "  - PWA: Angular with Service Worker configured" -ForegroundColor Gray
    Write-Host "  - Ngrok: HTTPS tunnel configured" -ForegroundColor Gray
    Write-Host "  - Build: PWA built for production" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  .\PowerShell\RunPWA.ps1 dev     # PWA development" -ForegroundColor Gray
    Write-Host "  .\PowerShell\run_middleware.ps1 server  # Middleware server" -ForegroundColor Gray
    Write-Host "  .\PowerShell\Run_Fronted.ps1    # Angular frontend" -ForegroundColor Gray
    Write-Host "  .\PowerShell\BuildPWA.ps1 serve # Serve PWA locally" -ForegroundColor Gray
}

function Show-Help {
    Write-Header "HELP - COMPLETE INIA SYSTEM CONFIGURATION"
    
    Write-Host "Usage: .\ConfigAll.ps1 [mode]" -ForegroundColor White
    Write-Host ""
    Write-Host "Available modes:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  all        - Complete configuration (RECOMMENDED)" -ForegroundColor Gray
    Write-Host "  help       - Show this help" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\ConfigAll.ps1        # Complete configuration" -ForegroundColor Gray
    Write-Host "  .\ConfigAll.ps1 all    # Complete configuration" -ForegroundColor Gray
    Write-Host "  .\ConfigAll.ps1 help   # Help" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Prerequisites:" -ForegroundColor Yellow
    Write-Host "  - Python 3.8+ (for middleware)" -ForegroundColor Gray
    Write-Host "  - Node.js 18+ (for PWA)" -ForegroundColor Gray
    Write-Host "  - npm (for PWA)" -ForegroundColor Gray
    Write-Host "  - Internet connection (for downloads)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Note: Java will be installed automatically if not present." -ForegroundColor White
    Write-Host ""
    Write-Host "Configuration order:" -ForegroundColor Cyan
    Write-Host "  1. Backend (Java/JMeter)" -ForegroundColor Gray
    Write-Host "  2. Middleware (Python/FastAPI)" -ForegroundColor Gray
    Write-Host "  3. PWA (Angular/Service Worker)" -ForegroundColor Gray
    Write-Host "  4. Ngrok (HTTPS Tunnel)" -ForegroundColor Gray
    Write-Host "  5. Build PWA (Production build)" -ForegroundColor Gray
}

# Get script directory (PowerShell/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Navigate to project root (one level up)
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

# Verify we are in the correct directory
if (-not (Test-Path "frontend/package.json")) {
    Write-Error "Frontend directory not found. Run from project root."
    exit 1
}

# Execute selected mode
switch ($Mode) {
    "all" { Setup-All }
    "help" { Show-Help }
    default { Show-Help }
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
