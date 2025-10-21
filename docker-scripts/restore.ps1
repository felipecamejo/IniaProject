# Script de PowerShell para restaurar la base de datos Docker
# Uso: .\docker-scripts\restore.ps1 [opciones]

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [switch]$Force = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Restauración Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\restore.ps1 -BackupFile ARCHIVO [opciones]"
    Write-Host ""
    Write-Host "Parámetros:"
    Write-Host "  -BackupFile ARCHIVO - Ruta al archivo de respaldo (.sql o .zip)"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -Force             - Forzar restauración sin confirmación"
    Write-Host "  -Help              - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\restore.ps1 -BackupFile `".\backups\inia_backup_20241201_120000.sql`""
    Write-Host "  .\docker-scripts\restore.ps1 -BackupFile `".\backups\inia_backup_20241201_120000.sql.zip`""
    Write-Host "  .\docker-scripts\restore.ps1 -BackupFile `".\backups\respaldo_manual.sql`" -Force"
    exit 0
}

Write-Host "=== Restauración de Base de Datos Docker para INIA ===" -ForegroundColor Green
Write-Host "Archivo de respaldo: $BackupFile" -ForegroundColor Yellow
Write-Host "Forzar restauración: $Force" -ForegroundColor Yellow
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

# Verificar que el archivo de respaldo existe
if (-not (Test-Path $BackupFile)) {
    Write-Host "Error: El archivo de respaldo no existe: $BackupFile" -ForegroundColor Red
    exit 1
}

# Verificar que la base de datos esté ejecutándose
$dbStatus = docker-compose ps database --format "{{.State}}"
if ($dbStatus -ne "running") {
    Write-Host "Error: La base de datos no está ejecutándose" -ForegroundColor Red
    Write-Host "Para iniciar la base de datos, usa: .\docker-scripts\start.ps1" -ForegroundColor Yellow
    exit 1
}

# Advertencia sobre la restauración
if (-not $Force) {
    Write-Host "⚠️  ADVERTENCIA: Esta operación reemplazará TODOS los datos actuales" -ForegroundColor Red
    Write-Host "   de la base de datos con los datos del respaldo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Archivo de respaldo: $BackupFile" -ForegroundColor Yellow
    Write-Host "Tamaño: $([math]::Round((Get-Item $BackupFile).Length / 1MB, 2)) MB" -ForegroundColor Yellow
    Write-Host "Fecha: $((Get-Item $BackupFile).CreationTime)" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "¿Estás seguro de que deseas continuar? (escribe 'SI' para confirmar)"
    if ($response -ne "SI") {
        Write-Host "Restauración cancelada" -ForegroundColor Yellow
        exit 0
    }
}

# Determinar si el archivo está comprimido
$isCompressed = $BackupFile.EndsWith(".zip")
$sqlFile = $BackupFile

# Extraer archivo si está comprimido
if ($isCompressed) {
    Write-Host "Extrayendo archivo comprimido..." -ForegroundColor Cyan
    
    $tempDir = Join-Path $env:TEMP "inia_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    try {
        # Usar .NET para extraer
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($BackupFile, $tempDir)
        
        # Buscar archivo .sql en el directorio extraído
        $sqlFiles = Get-ChildItem -Path $tempDir -Filter "*.sql" -Recurse
        if ($sqlFiles.Count -eq 0) {
            throw "No se encontró archivo .sql en el respaldo comprimido"
        } elseif ($sqlFiles.Count -gt 1) {
            Write-Host "Múltiples archivos .sql encontrados, usando el primero:" -ForegroundColor Yellow
            $sqlFiles | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Yellow }
        }
        
        $sqlFile = $sqlFiles[0].FullName
        Write-Host "✓ Archivo extraído: $($sqlFiles[0].Name)" -ForegroundColor Green
        
    } catch {
        Write-Host "✗ Error extrayendo el archivo comprimido: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Crear respaldo de seguridad antes de restaurar
Write-Host "Creando respaldo de seguridad antes de restaurar..." -ForegroundColor Cyan
$safetyBackup = ".\backups\safety_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

try {
    $backupCommand = "pg_dump -h localhost -p 5432 -U inia_user -d Inia --no-password --clean --if-exists"
    $env:PGPASSWORD = "inia_password"
    Invoke-Expression "$backupCommand" | Out-File -FilePath $safetyBackup -Encoding UTF8
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Respaldo de seguridad creado: $safetyBackup" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No se pudo crear respaldo de seguridad, continuando..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Error creando respaldo de seguridad: $($_.Exception.Message)" -ForegroundColor Yellow
} finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

# Detener servicios que dependen de la base de datos
Write-Host "Deteniendo servicios dependientes..." -ForegroundColor Cyan
docker-compose stop backend middleware

# Restaurar la base de datos
Write-Host "Restaurando base de datos..." -ForegroundColor Cyan

try {
    $restoreCommand = "psql -h localhost -p 5432 -U inia_user -d postgres --no-password -f `"$sqlFile`""
    $env:PGPASSWORD = "inia_password"
    
    # Ejecutar restauración
    Invoke-Expression $restoreCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Base de datos restaurada exitosamente" -ForegroundColor Green
    } else {
        throw "Error en el comando de restauración"
    }
} catch {
    Write-Host "✗ Error restaurando la base de datos: $($_.Exception.Message)" -ForegroundColor Red
    
    # Intentar restaurar desde el respaldo de seguridad
    if (Test-Path $safetyBackup) {
        Write-Host "Intentando restaurar desde respaldo de seguridad..." -ForegroundColor Yellow
        try {
            $restoreCommand = "psql -h localhost -p 5432 -U inia_user -d postgres --no-password -f `"$safetyBackup`""
            Invoke-Expression $restoreCommand
            Write-Host "✓ Restaurado desde respaldo de seguridad" -ForegroundColor Green
        } catch {
            Write-Host "✗ Error restaurando desde respaldo de seguridad" -ForegroundColor Red
        }
    }
    
    exit 1
} finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

# Reiniciar servicios
Write-Host "Reiniciando servicios..." -ForegroundColor Cyan
docker-compose up -d backend middleware

# Limpiar archivos temporales
if ($isCompressed -and (Test-Path $tempDir)) {
    Write-Host "Limpiando archivos temporales..." -ForegroundColor Cyan
    Remove-Item -Path $tempDir -Recurse -Force
}

# Verificar que los servicios estén funcionando
Write-Host "Verificando servicios..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

$backendStatus = docker-compose ps backend --format "{{.State}}"
$middlewareStatus = docker-compose ps middleware --format "{{.State}}"

if ($backendStatus -eq "running" -and $middlewareStatus -eq "running") {
    Write-Host "✓ Todos los servicios están ejecutándose correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Algunos servicios pueden no estar funcionando correctamente" -ForegroundColor Yellow
    Write-Host "   Backend: $backendStatus" -ForegroundColor Yellow
    Write-Host "   Middleware: $middlewareStatus" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Restauración Completada ===" -ForegroundColor Green
Write-Host "Respaldo de seguridad: $safetyBackup" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para verificar el estado:" -ForegroundColor Yellow
Write-Host "  .\docker-scripts\status.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Para ver logs:" -ForegroundColor Yellow
Write-Host "  .\docker-scripts\logs.ps1" -ForegroundColor White
