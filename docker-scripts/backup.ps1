# Script de PowerShell para respaldar la base de datos Docker
# Uso: .\docker-scripts\backup.ps1 [opciones]

param(
    [string]$OutputPath = ".\backups",
    [string]$FileName = "",
    [switch]$Compress = $true,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Respaldo Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\backup.ps1 [opciones]"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -OutputPath RUTA - Directorio donde guardar el respaldo (por defecto: .\backups)"
    Write-Host "  -FileName NOMBRE - Nombre del archivo de respaldo (por defecto: auto-generado)"
    Write-Host "  -Compress        - Comprimir el respaldo (por defecto: true)"
    Write-Host "  -Help            - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\backup.ps1"
    Write-Host "  .\docker-scripts\backup.ps1 -OutputPath C:\Backups"
    Write-Host "  .\docker-scripts\backup.ps1 -FileName respaldo_manual.sql"
    Write-Host "  .\docker-scripts\backup.ps1 -Compress:`$false"
    exit 0
}

Write-Host "=== Respaldo de Base de Datos Docker para INIA ===" -ForegroundColor Green
Write-Host "Directorio de salida: $OutputPath" -ForegroundColor Yellow
Write-Host "Comprimir: $Compress" -ForegroundColor Yellow
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

# Verificar que la base de datos esté ejecutándose
$dbStatus = docker-compose ps database --format "{{.State}}"
if ($dbStatus -ne "running") {
    Write-Host "Error: La base de datos no está ejecutándose" -ForegroundColor Red
    Write-Host "Para iniciar la base de datos, usa: .\docker-scripts\start.ps1" -ForegroundColor Yellow
    exit 1
}

# Crear directorio de respaldos si no existe
if (-not (Test-Path $OutputPath)) {
    Write-Host "Creando directorio de respaldos: $OutputPath" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Generar nombre de archivo si no se especifica
if ([string]::IsNullOrEmpty($FileName)) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $FileName = "inia_backup_$timestamp.sql"
}

# Ruta completa del archivo de respaldo
$backupFile = Join-Path $OutputPath $FileName

Write-Host "Creando respaldo de la base de datos..." -ForegroundColor Cyan
Write-Host "Archivo: $backupFile" -ForegroundColor Yellow

# Crear el respaldo usando pg_dump
try {
    $backupCommand = "pg_dump -h localhost -p 5432 -U inia_user -d Inia --no-password --verbose --clean --if-exists --create"
    
    # Ejecutar el comando de respaldo
    $env:PGPASSWORD = "inia_password"
    Invoke-Expression "$backupCommand" | Out-File -FilePath $backupFile -Encoding UTF8
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Respaldo creado exitosamente" -ForegroundColor Green
    } else {
        throw "Error en el comando pg_dump"
    }
} catch {
    Write-Host "✗ Error creando el respaldo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Limpiar variable de entorno
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

# Comprimir si se solicita
if ($Compress) {
    Write-Host "Comprimiendo respaldo..." -ForegroundColor Cyan
    
    $compressedFile = "$backupFile.zip"
    
    try {
        # Usar .NET para comprimir
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($OutputPath, $compressedFile)
        
        # Eliminar archivo original
        Remove-Item $backupFile -Force
        
        Write-Host "✓ Respaldo comprimido: $compressedFile" -ForegroundColor Green
        $backupFile = $compressedFile
    } catch {
        Write-Host "⚠️  Error comprimiendo el respaldo: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   El respaldo sin comprimir está disponible en: $backupFile" -ForegroundColor Yellow
    }
}

# Mostrar información del archivo creado
$fileInfo = Get-Item $backupFile
Write-Host ""
Write-Host "=== Respaldo Completado ===" -ForegroundColor Green
Write-Host "Archivo: $($fileInfo.FullName)" -ForegroundColor White
Write-Host "Tamaño: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host "Fecha: $($fileInfo.CreationTime)" -ForegroundColor White

# Mostrar comandos útiles
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Yellow
Write-Host "  Restaurar respaldo: .\docker-scripts\restore.ps1 -BackupFile `"$backupFile`"" -ForegroundColor White
Write-Host "  Listar respaldos:  Get-ChildItem $OutputPath" -ForegroundColor White
Write-Host "  Ver respaldos:     .\docker-scripts\list-backups.ps1" -ForegroundColor White
