# DESTRUIR INFRAESTRUCTURA
# Elimina TODOS los recursos de AWS
# Uso: .\ScriptTerraform\destruir-terraform.ps1

Write-Host "========================================" -ForegroundColor Red
Write-Host "  DESTRUIR INFRAESTRUCTURA" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "ADVERTENCIA: Se eliminaran TODOS los recursos" -ForegroundColor Yellow
Write-Host "  - Base de datos (datos perdidos)" -ForegroundColor White
Write-Host "  - Servidores y servicios" -ForegroundColor White
Write-Host "  - Redes y balanceadores" -ForegroundColor White
Write-Host ""

# Pedir confirmacion
Write-Host "Escribe 'DESTRUIR' para confirmar: " -NoNewline -ForegroundColor Yellow
$confirmacion = Read-Host

if ($confirmacion -ne "DESTRUIR") {
    Write-Host ""
    Write-Host "Cancelado" -ForegroundColor Green
    exit 0
}

Write-Host ""

# Configurar entorno
cd C:\Github\IniaProject\terraform
$env:Path += ";$env:USERPROFILE\terraform"

# Destruir
terraform destroy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Infraestructura eliminada" -ForegroundColor Green
    Write-Host "Costos detenidos" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Fallo al destruir" -ForegroundColor Red
    Write-Host ""
    exit 1
}
