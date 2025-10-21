# 🚀 SCRIPTS PWA COMPLETOS - SISTEMA INIA

## 📋 Resumen de Scripts Disponibles

Tu Sistema INIA ahora tiene **4 scripts PowerShell** para gestionar completamente la PWA:

### **1. 🎯 RunPWA.ps1 (RECOMENDADO - Script Principal)**
**Script simplificado para uso diario**

```powershell
# Comando principal (más fácil de usar)
.\RunPWA.ps1 dev      # Desarrollo con ngrok (RECOMENDADO)
.\RunPWA.ps1 prod     # Producción local
.\RunPWA.ps1 build    # Solo build
.\RunPWA.ps1 test     # Testing completo
.\RunPWA.ps1 help     # Ayuda
```

**Características:**
- ✅ Configuración automática si no está configurado
- ✅ Interfaz simplificada
- ✅ Modo desarrollo por defecto
- ✅ Integración completa con otros scripts

### **2. ⚙️ configPWA.ps1 (Configuración Detallada)**
**Script para configuración y desarrollo avanzado**

```powershell
.\configPWA.ps1 setup      # Configuración inicial
.\configPWA.ps1 dev        # Desarrollo con ngrok
.\configPWA.ps1 test       # Verificación
.\configPWA.ps1 ngrok      # Solo ngrok
.\configPWA.ps1 lighthouse # Auditoría
.\configPWA.ps1 help       # Ayuda
```

**Características:**
- ✅ Configuración manual detallada
- ✅ Instalación de dependencias
- ✅ Personalización de manifest
- ✅ Testing y auditorías

### **3. 🔨 BuildPWA.ps1 (Build y Despliegue)**
**Script especializado para producción**

```powershell
.\BuildPWA.ps1 build   # Construir PWA
.\BuildPWA.ps1 verify  # Verificar archivos
.\BuildPWA.ps1 serve   # Servir localmente
.\BuildPWA.ps1 deploy  # Preparar despliegue
.\BuildPWA.ps1 clean   # Limpiar builds
.\BuildPWA.ps1 help    # Ayuda
```

**Características:**
- ✅ Build optimizado para producción
- ✅ Verificación de archivos PWA
- ✅ Servidor local para testing
- ✅ Preparación para despliegue

### **4. 🌐 SetupNgrok.ps1 (Configuración ngrok)**
**Script específico para ngrok**

```powershell
.\SetupNgrok.ps1    # Configurar ngrok con token
```

**Características:**
- ✅ Configuración automática del token
- ✅ Instalación de ngrok si es necesario
- ✅ Verificación de configuración

## 🎯 Flujo de Uso Recomendado

### **Para Desarrollo y Testing (Más Fácil):**
```powershell
# 1. Ejecutar PWA (configuración automática)
.\RunPWA.ps1 dev

# 2. Abrir URL de ngrok en Chrome
# 3. Probar PWA (instalar, offline, etc.)
```

### **Para Producción:**
```powershell
# 1. Build de producción
.\RunPWA.ps1 build

# 2. Probar build localmente
.\RunPWA.ps1 prod

# 3. Preparar para despliegue
.\BuildPWA.ps1 deploy
```

### **Para Configuración Manual:**
```powershell
# 1. Configuración inicial
.\configPWA.ps1 setup

# 2. Desarrollo
.\configPWA.ps1 dev

# 3. Testing
.\configPWA.ps1 test
```

## 📱 URLs Disponibles

### **Modo Desarrollo (ngrok):**
- **Local**: `http://localhost:4200`
- **ngrok**: `https://[túnel-único].ngrok.io` (HTTPS automático)

### **Modo Producción Local:**
- **Servidor**: `http://localhost:8080`

## 🔧 Características PWA Implementadas

### **✅ Service Worker:**
- Cache automático de recursos
- Funcionamiento offline
- Actualizaciones automáticas

### **✅ Web App Manifest:**
- Nombre: "INIA - Sistema de Análisis de Semillas"
- Short name: "INIA"
- Iconos: 8 tamaños (72x72 a 512x512)
- Tema: Azul (#1976d2)
- Modo: Standalone

### **✅ Instalabilidad:**
- Se puede instalar en dispositivos móviles
- Se puede instalar en escritorio
- Aparece en menú de aplicaciones

### **✅ ngrok Configurado:**
- Token: `2yK9mpFEZXa9gvXRS2IHS6baOgL_7ABJwf2GPr1zMA28yPgLd`
- HTTPS automático
- Túnel único por sesión

## 🧪 Testing PWA

### **Verificaciones Básicas:**
- [ ] Service Worker registrado y activo
- [ ] Manifest válido y cargado
- [ ] Iconos PWA disponibles
- [ ] Botón "Instalar" visible
- [ ] Funciona sin conexión a internet
- [ ] Responsive en móviles
- [ ] Lighthouse score > 90

### **Verificaciones Avanzadas:**
- [ ] Se instala en dispositivo móvil
- [ ] Se instala en escritorio
- [ ] Aparece en menú de aplicaciones
- [ ] Cache funciona correctamente
- [ ] Actualizaciones automáticas

## 📁 Archivos PWA

### **Configuración:**
```
D:\IniaProject\
├── RunPWA.ps1           # Script principal (RECOMENDADO)
├── configPWA.ps1        # Configuración detallada
├── BuildPWA.ps1         # Build y despliegue
├── SetupNgrok.ps1       # Configuración ngrok
└── Documentation.md     # Documentación completa
```

### **Frontend PWA:**
```
D:\IniaProject\frontend\
├── ngsw-config.json              # Configuración Service Worker
├── public\manifest.webmanifest   # Manifest PWA
├── public\icons\                 # Iconos PWA (8 tamaños)
└── src\app\app.config.ts         # Configuración Angular
```

### **Build PWA:**
```
D:\IniaProject\frontend\dist\inia-frontend\
├── ngsw-worker.js         # Service Worker
├── manifest.webmanifest   # Manifest PWA
├── index.html             # Página principal
└── icons\                 # Iconos PWA
```

## 🚀 Comandos de Inicio Rápido

### **Para empezar ahora mismo:**
```powershell
.\RunPWA.ps1 dev
```

### **Para testing completo:**
```powershell
.\RunPWA.ps1 test
```

### **Para producción:**
```powershell
.\RunPWA.ps1 build
.\RunPWA.ps1 prod
```

## 📚 Documentación

- **Completa**: `Documentation.md`
- **ngrok**: `NGROK-CONFIGURADO.md`
- **Scripts**: `PWA-SCRIPTS-COMPLETOS.md` (este archivo)

---

## 🎉 ¡Tu PWA está Lista!

**Comando para empezar:** `.\RunPWA.ps1 dev`

**Características:**
- ✅ PWA completamente configurada
- ✅ ngrok con token válido
- ✅ Scripts automatizados
- ✅ Documentación completa
- ✅ Testing y build listos

**¡Tu Sistema INIA ahora es una PWA completa y profesional!** 🚀
