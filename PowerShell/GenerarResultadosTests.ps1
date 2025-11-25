# Script para generar archivo de resultados de tests con fecha actual
# Uso: .\PowerShell\GenerarResultadosTests.ps1

param(
    [string]$Nombre = "",
    [string]$Ambiente = "Desarrollo",
    [string]$Version = "1.0.0"
)

# Obtener fecha actual
$fecha = Get-Date -Format "yyyy-MM-dd"
$hora = Get-Date -Format "HH:mm"

# Generar nombre del archivo
$nombreArchivo = "RESULTADOS-TESTS-$fecha.md"

# Si el archivo ya existe, preguntar si se desea sobrescribir
if (Test-Path $nombreArchivo) {
    $respuesta = Read-Host "El archivo $nombreArchivo ya existe. ¿Desea sobrescribirlo? (S/N)"
    if ($respuesta -ne "S" -and $respuesta -ne "s") {
        Write-Host "Operación cancelada." -ForegroundColor Yellow
        exit
    }
}

# Leer plantilla
$plantilla = Get-Content "PLANTILLA-RESULTADOS-TESTS.md" -Raw

# Reemplazar placeholders
$plantilla = $plantilla -replace "\[YYYY-MM-DD\]", $fecha
$plantilla = $plantilla -replace "\[Nombre\]", $Nombre
$plantilla = $plantilla -replace "\[Desarrollo/Producción/Testing\]", $Ambiente
$plantilla = $plantilla -replace "\[Versión\]", $Version
$plantilla = $plantilla -replace "\[YYYY-MM-DD HH:MM\]", "$fecha $hora"

# Escribir archivo
$plantilla | Out-File -FilePath $nombreArchivo -Encoding UTF8

Write-Host "Archivo de resultados generado: $nombreArchivo" -ForegroundColor Green
Write-Host "Puede editarlo con: notepad $nombreArchivo" -ForegroundColor Cyan

# Preguntar si desea abrir el archivo
$abrir = Read-Host "¿Desea abrir el archivo ahora? (S/N)"
if ($abrir -eq "S" -or $abrir -eq "s") {
    notepad $nombreArchivo
}

