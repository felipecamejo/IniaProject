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

# Activate virtual environment if it exists
if (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    . .\.venv\Scripts\Activate.ps1
} else {
    Write-Warning "Virtual environment not found. Make sure to run SetupMiddleware.ps1 first."
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
        Write-Host "  stop                      - Stop middleware API server on port 9099" -ForegroundColor White
        Write-Host "  help                      - Show this help" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\run_middleware.ps1 server    # Start or restart the server" -ForegroundColor Gray
        Write-Host "  .\run_middleware.ps1 stop     # Stop the server" -ForegroundColor Gray
        Write-Host "  .\run_middleware.ps1 help    # Show help" -ForegroundColor Gray
        Write-Host ""
        Write-Host "The server will be available at:" -ForegroundColor Yellow
        Write-Host "  http://localhost:9099" -ForegroundColor White
        Write-Host "  http://localhost:9099/docs - API documentation" -ForegroundColor White
    }
}

# Restore original directory
Pop-Location
