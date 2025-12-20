# LIMPIAR Y REINICIAR TERRAFORM
# Elimina archivos locales y reinicializa
# NO elimina recursos en AWS
# Uso: .\ScriptTerraform\limpiar-terraform.ps1

Write-Host "Limpiando Terraform..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Esto NO elimina recursos en AWS" -ForegroundColor Yellow
Write-Host "Solo limpia archivos locales" -ForegroundColor Yellow
Write-Host ""

# Pedir confirmacion
Write-Host "Continuar? (S/N): " -NoNewline -ForegroundColor Yellow
$respuesta = Read-Host

if ($respuesta -ne "S" -and $respuesta -ne "s") {
    Write-Host "Cancelado" -ForegroundColor Green
    exit 0
}

# Configurar entorno
cd C:\Github\IniaProject\terraform
$env:Path += ";$env:USERPROFILE\terraform"

# Limpiar archivos
Write-Host ""
Write-Host "Eliminando archivos locales..." -ForegroundColor Gray
Remove-Item -Recurse -Force .terraform -ErrorAction SilentlyContinue
Remove-Item -Force terraform.tfstate* -ErrorAction SilentlyContinue
Remove-Item -Force tfplan* -ErrorAction SilentlyContinue
Remove-Item -Force .terraform.lock.hcl -ErrorAction SilentlyContinue

Write-Host "Archivos eliminados" -ForegroundColor Green

# Reinicializar
Write-Host "Reinicializando..." -ForegroundColor Gray
terraform init

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Terraform limpio y reiniciado" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximo paso:" -ForegroundColor Cyan
    Write-Host "  .\ScriptTerraform\planear-terraform.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Fallo al reiniciar" -ForegroundColor Red
    Write-Host ""
    exit 1
}
