# Script de PowerShell para listar respaldos disponibles
# Uso: .\docker-scripts\list-backups.ps1 [opciones]

param(
    [string]$BackupPath = ".\backups",
    [switch]$Detailed = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Listado de Respaldo Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\list-backups.ps1 [opciones]"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -BackupPath RUTA - Directorio donde buscar respaldos (por defecto: .\backups)"
    Write-Host "  -Detailed        - Mostrar información detallada"
    Write-Host "  -Help            - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\list-backups.ps1"
    Write-Host "  .\docker-scripts\list-backups.ps1 -BackupPath C:\Backups"
    Write-Host "  .\docker-scripts\list-backups.ps1 -Detailed"
    exit 0
}

Write-Host "=== Listado de Respaldo Docker para INIA ===" -ForegroundColor Green
Write-Host "Directorio: $BackupPath" -ForegroundColor Yellow
Write-Host ""

# Verificar que el directorio existe
if (-not (Test-Path $BackupPath)) {
    Write-Host "El directorio de respaldos no existe: $BackupPath" -ForegroundColor Yellow
    Write-Host "Para crear un respaldo, usa: .\docker-scripts\backup.ps1" -ForegroundColor Yellow
    exit 0
}

# Buscar archivos de respaldo
$backupFiles = Get-ChildItem -Path $BackupPath -Filter "*.sql" -File
$compressedFiles = Get-ChildItem -Path $BackupPath -Filter "*.zip" -File

$allBackups = @()
$allBackups += $backupFiles
$allBackups += $compressedFiles

if ($allBackups.Count -eq 0) {
    Write-Host "No se encontraron archivos de respaldo en: $BackupPath" -ForegroundColor Yellow
    Write-Host "Para crear un respaldo, usa: .\docker-scripts\backup.ps1" -ForegroundColor Yellow
    exit 0
}

# Ordenar por fecha de creación (más reciente primero)
$allBackups = $allBackups | Sort-Object CreationTime -Descending

Write-Host "Respaldo encontrados: $($allBackups.Count)" -ForegroundColor Cyan
Write-Host ""

if ($Detailed) {
    # Mostrar información detallada
    Write-Host "Información detallada:" -ForegroundColor Yellow
    Write-Host ""
    
    $allBackups | ForEach-Object {
        $file = $_
        $size = [math]::Round($file.Length / 1MB, 2)
        $type = if ($file.Extension -eq ".zip") { "Comprimido" } else { "SQL" }
        
        Write-Host "📄 $($file.Name)" -ForegroundColor White
        Write-Host "   Tipo: $type" -ForegroundColor Gray
        Write-Host "   Tamaño: $size MB" -ForegroundColor Gray
        Write-Host "   Fecha: $($file.CreationTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
        Write-Host "   Ruta: $($file.FullName)" -ForegroundColor Gray
        
        # Mostrar información adicional para archivos comprimidos
        if ($file.Extension -eq ".zip") {
            try {
                Add-Type -AssemblyName System.IO.Compression.FileSystem
                $zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
                $sqlFiles = $zip.Entries | Where-Object { $_.Name.EndsWith(".sql") }
                if ($sqlFiles.Count -gt 0) {
                    Write-Host "   Contenido: $($sqlFiles.Count) archivo(s) SQL" -ForegroundColor Gray
                }
                $zip.Dispose()
            } catch {
                Write-Host "   Contenido: No se pudo leer" -ForegroundColor Red
            }
        }
        
        Write-Host ""
    }
} else {
    # Mostrar lista simple
    Write-Host "Respaldo disponibles:" -ForegroundColor Yellow
    Write-Host ""
    
    $allBackups | ForEach-Object {
        $file = $_
        $size = [math]::Round($file.Length / 1MB, 2)
        $type = if ($file.Extension -eq ".zip") { "📦" } else { "📄" }
        
        Write-Host "$type $($file.Name)" -ForegroundColor White -NoNewline
        Write-Host " ($size MB)" -ForegroundColor Gray -NoNewline
        Write-Host " - $($file.CreationTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Yellow
Write-Host "  Crear respaldo:     .\docker-scripts\backup.ps1" -ForegroundColor White
Write-Host "  Restaurar respaldo: .\docker-scripts\restore.ps1 -BackupFile `"ARCHIVO`"" -ForegroundColor White
Write-Host "  Ver información:    .\docker-scripts\list-backups.ps1 -Detailed" -ForegroundColor White

# Mostrar el respaldo más reciente
if ($allBackups.Count -gt 0) {
    $latest = $allBackups[0]
    Write-Host ""
    Write-Host "Respaldo más reciente: $($latest.Name)" -ForegroundColor Green
    Write-Host "Para restaurar: .\docker-scripts\restore.ps1 -BackupFile `"$($latest.FullName)`"" -ForegroundColor Yellow
}
