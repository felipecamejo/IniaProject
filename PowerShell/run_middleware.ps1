# Script to start/restart the Python middleware server
# Usage: .\run_middleware.ps1 [command]

param(
    [Parameter(Position=0)]
    [ValidateSet("server", "stop", "help")]
    [string]$Command = "help"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Get script directory (PowerShell/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Navigate to project root (one level up)
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

# Navigate to middleware directory
Push-Location "middleware"

# Verify we're in the correct directory
if (-not (Test-Path "http_server.py")) {
    Write-Error "http_server.py not found in middleware/ directory"
    Pop-Location
    exit 1
}

# Function to check if setup is needed
function Test-SetupNeeded {
    $needsSetup = $false
    $reasons = @()
    
    # Check if virtual environment exists
    if (-not (Test-Path ".venv\Scripts\Activate.ps1")) {
        $needsSetup = $true
        $reasons += "Virtual environment not found"
        return @{
            Needed = $needsSetup
            Reasons = $reasons
        }
    }
    
    # Check if requirements.txt exists
    if (-not (Test-Path "requirements.txt")) {
        $needsSetup = $true
        $reasons += "requirements.txt not found"
    }
    
    # Check if key dependencies are installed (if venv exists)
    # Temporarily activate venv to test dependencies
    $originalEnv = $env:VIRTUAL_ENV
    try {
        . .\.venv\Scripts\Activate.ps1 -ErrorAction SilentlyContinue
        $testDeps = @'
import sys
try:
    import fastapi
    import uvicorn
    import sqlalchemy
    print("OK")
except ImportError as e:
    print(f"ERROR: {e}")
    sys.exit(1)
'@
        $result = $testDeps | python 2>&1
        if ($LASTEXITCODE -ne 0 -or $result -notmatch "OK") {
            $needsSetup = $true
            $reasons += "Dependencies not installed or incomplete"
        }
    } catch {
        $needsSetup = $true
        $reasons += "Could not verify dependencies: $_"
    } finally {
        # Deactivate if we activated it
        if ($env:VIRTUAL_ENV -and $env:VIRTUAL_ENV -ne $originalEnv) {
            deactivate -ErrorAction SilentlyContinue
        }
    }
    
    return @{
        Needed = $needsSetup
        Reasons = $reasons
    }
}

# Function to run setup automatically
function Invoke-SetupMiddleware {
    Write-Host "`n=== SETUP REQUIRED ===" -ForegroundColor Yellow
    Write-Host "The middleware environment needs to be set up." -ForegroundColor Yellow
    Write-Host "Running SetupMiddleware.ps1 automatically...`n" -ForegroundColor Cyan
    
    # Save current location (middleware directory)
    $currentLocation = Get-Location
    
    # Navigate back to project root
    Pop-Location
    
    # Get the SetupMiddleware.ps1 script path
    $setupScript = Join-Path $projectRoot "PowerShell\SetupMiddleware.ps1"
    
    if (-not (Test-Path $setupScript)) {
        Write-Error "SetupMiddleware.ps1 not found at: $setupScript"
        exit 1
    }
    
    # Run the setup script (it will handle its own directory navigation)
    try {
        $originalLocation = Get-Location
        & $setupScript
        $setupExitCode = $LASTEXITCODE
        
        # SetupMiddleware.ps1 does Pop-Location at the end, so we're back at project root
        # Navigate back to middleware directory and push it again for consistency
        Push-Location "middleware"
        
        if ($setupExitCode -ne 0) {
            Write-Error "Setup failed. Please run SetupMiddleware.ps1 manually and fix any issues."
            Pop-Location
            exit 1
        }
        
        Write-Host "`nSetup completed successfully!`n" -ForegroundColor Green
    } catch {
        Write-Error "Error running SetupMiddleware.ps1: $_"
        # Try to restore location
        if (Test-Path (Join-Path $projectRoot "middleware")) {
            Push-Location "middleware"
        }
        exit 1
    }
}

# Check if setup is needed
$setupCheck = Test-SetupNeeded
if ($setupCheck.Needed) {
    Write-Host "`nSetup check:" -ForegroundColor Cyan
    foreach ($reason in $setupCheck.Reasons) {
        Write-Host "  - $reason" -ForegroundColor Yellow
    }
    
    # Ask user if they want to run setup automatically (only if not in server command)
    if ($Command -eq "server") {
        Write-Host "`nRunning setup automatically before starting server...`n" -ForegroundColor Cyan
        Invoke-SetupMiddleware
    } else {
        Write-Host "`nTo set up the environment, run:" -ForegroundColor Yellow
        Write-Host "  .\PowerShell\SetupMiddleware.ps1" -ForegroundColor White
        Write-Host "`nOr run 'server' command to set up automatically." -ForegroundColor Yellow
        Pop-Location
        exit 1
    }
}

# Activate virtual environment
if (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    . .\.venv\Scripts\Activate.ps1
} else {
    Write-Error "Virtual environment not found after setup. Please run SetupMiddleware.ps1 manually."
    Pop-Location
    exit 1
}

# ================================
# SERVER MANAGEMENT FUNCTIONS
# ================================

function Test-PortInUse {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
        return $connection
    } catch {
        return $false
    }
}

function Stop-ServerOnPort {
    param([int]$Port)
    
    Write-Host "Checking if server is running on port $Port..." -ForegroundColor Yellow
    
    # Find processes using the port
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        foreach ($processId in $processes) {
            try {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    $processName = $process.ProcessName
                    Write-Host "Stopping process $processName (PID: $processId) on port $Port..." -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Seconds 1
                    Write-Host "Process stopped successfully" -ForegroundColor Green
                }
            } catch {
                Write-Warning "Could not stop process $processId : $($_.Exception.Message)"
            }
        }
        
        # Wait a moment for the port to be released
        Start-Sleep -Seconds 2
        
        # Verify the port is free
        if (Test-PortInUse -Port $Port) {
            Write-Warning "Port $Port is still in use. Try stopping it manually."
            return $false
        } else {
            Write-Host "Port $Port released successfully" -ForegroundColor Green
            return $true
        }
    } else {
        Write-Host "No processes using port $Port" -ForegroundColor Green
        return $true
    }
}

function Start-Server {
    param([int]$Port = 9099)
    
    # Check and stop existing server
    if (Test-PortInUse -Port $Port) {
        Write-Host "`nServer detected on port $Port. Restarting..." -ForegroundColor Yellow
        Stop-ServerOnPort -Port $Port
    }
    
    Write-Host "`nStarting middleware API server on port $Port..." -ForegroundColor Green
    Write-Host "Available endpoints:" -ForegroundColor Yellow
    Write-Host "  POST /insertar - Mass insertion" -ForegroundColor White
    Write-Host "  POST /exportar - Export tables" -ForegroundColor White
    Write-Host "  POST /importar - Import files" -ForegroundColor White
    Write-Host "  http://localhost:$Port/docs - Interactive API documentation" -ForegroundColor White
    Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Cyan
    
    # Start the server
    try {
        python http_server.py
    } catch {
        Write-Error "Error starting server: $_"
        Pop-Location
        exit 1
    }
}

# ================================
# MAIN COMMANDS
# ================================

switch ($Command) {
    "server" {
        Start-Server -Port 9099
    }
    
    "stop" {
        Write-Host "Stopping server on port 9099..." -ForegroundColor Yellow
        if (Stop-ServerOnPort -Port 9099) {
            Write-Host "Server stopped successfully" -ForegroundColor Green
        } else {
            Write-Host "Could not stop server completely" -ForegroundColor Red
            exit 1
        }
    }
    
    "help" {
        Write-Host "=== MIDDLEWARE SERVER - AVAILABLE COMMANDS ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage: .\run_middleware.ps1 [command]" -ForegroundColor White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Yellow
        Write-Host "  server                    - Start/Restart middleware API server" -ForegroundColor White
        Write-Host "                            (Automatically runs setup if needed)" -ForegroundColor Gray
        Write-Host "  stop                      - Stop middleware API server on port 9099" -ForegroundColor White
        Write-Host "  help                      - Show this help" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\run_middleware.ps1 server    # Start or restart the server" -ForegroundColor Gray
        Write-Host "                                  (Will auto-setup if environment not ready)" -ForegroundColor DarkGray
        Write-Host "  .\run_middleware.ps1 stop     # Stop the server" -ForegroundColor Gray
        Write-Host "  .\run_middleware.ps1 help    # Show help" -ForegroundColor Gray
        Write-Host ""
        Write-Host "The server will be available at:" -ForegroundColor Yellow
        Write-Host "  http://localhost:9099" -ForegroundColor White
        Write-Host "  http://localhost:9099/docs - API documentation" -ForegroundColor White
        Write-Host ""
        Write-Host "Note: The 'server' command will automatically check and run" -ForegroundColor Cyan
        Write-Host "      SetupMiddleware.ps1 if the environment is not configured." -ForegroundColor Cyan
    }
}

# Restore original directory
Pop-Location
