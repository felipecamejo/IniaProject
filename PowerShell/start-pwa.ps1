# Script para iniciar la aplicación Angular como PWA
# Incluye opciones para ngrok y testing con Lighthouse

Write-Host "=== INIA PWA Development Script ===" -ForegroundColor Green
Write-Host ""

# Verificar si ngrok está instalado
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "WARNING: ngrok no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g ngrok
}

# Verificar si lighthouse está instalado
$lighthouseInstalled = Get-Command lighthouse -ErrorAction SilentlyContinue
if (-not $lighthouseInstalled) {
    Write-Host "WARNING: lighthouse no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g lighthouse
}

Write-Host "Iniciando aplicación Angular en modo PWA..." -ForegroundColor Cyan
Write-Host ""

# Obtener directorio del script (PowerShell/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Navegar a la raíz del proyecto (un nivel arriba)
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

# Navegar al directorio frontend
Push-Location "frontend"

# Iniciar la aplicación en modo PWA
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; ng serve --configuration=pwa"

Write-Host "Esperando 10 segundos para que la aplicación inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Iniciando túnel ngrok..." -ForegroundColor Cyan
Write-Host ""

# Iniciar ngrok en una nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; ngrok http 4200"

# Restaurar directorio original
Pop-Location

Write-Host ""
Write-Host "Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs disponibles:" -ForegroundColor White
Write-Host "   • Local: http://localhost:4200" -ForegroundColor Gray
Write-Host "   • ngrok: https://[túnel-ngrok].ngrok.io" -ForegroundColor Gray
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor White
Write-Host "   • Lighthouse: npm run lighthouse" -ForegroundColor Gray
Write-Host "   • Build PWA: npm run build:pwa" -ForegroundColor Gray
Write-Host ""
Write-Host "Para probar PWA:" -ForegroundColor White
Write-Host "   1. Abre la URL de ngrok en Chrome" -ForegroundColor Gray
Write-Host "   2. F12 → Application → Verifica Service Worker" -ForegroundColor Gray
Write-Host "   3. F12 → Lighthouse → Ejecuta auditoría PWA" -ForegroundColor Gray
Write-Host "   4. Busca el botón 'Instalar' en la barra de direcciones" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
