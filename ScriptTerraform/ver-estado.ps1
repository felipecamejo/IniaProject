# VER ESTADO DE TERRAFORM
# Muestra recursos gestionados y outputs
# Uso: .\ScriptTerraform\ver-estado.ps1

Write-Host "Estado de Terraform" -ForegroundColor Cyan
Write-Host ""

# Configurar entorno
cd C:\Github\IniaProject\terraform
$env:Path += ";$env:USERPROFILE\terraform"

# Ver recursos
Write-Host "Recursos gestionados:" -ForegroundColor Yellow
Write-Host ""
terraform state list

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ver outputs
Write-Host "Outputs importantes:" -ForegroundColor Yellow
Write-Host ""
terraform output

Write-Host ""
