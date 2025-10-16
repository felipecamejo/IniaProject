# 🐳 Docker Setup para Proyecto INIA

## 🚀 Inicio Rápido

### 1. Verificar Requisitos
```bash
# Verificar Docker
docker --version
docker-compose --version
```

### 2. Construir y Ejecutar
```bash
# Construir todas las imágenes
.\docker-scripts\build.ps1

# Iniciar todos los servicios
.\docker-scripts\start.ps1
```

### 3. Acceder a la Aplicación
- **Frontend:** http://localhost
- **Backend API:** http://localhost:8080/Inia
- **Middleware API:** http://localhost:9099
- **Base de datos:** localhost:5432

## 📋 Scripts Disponibles

| Script | Descripción | Uso |
|--------|-------------|-----|
| `build.ps1` | Construir imágenes Docker | `.\docker-scripts\build.ps1 [servicio]` |
| `start.ps1` | Iniciar servicios | `.\docker-scripts\start.ps1` |
| `stop.ps1` | Detener servicios | `.\docker-scripts\stop.ps1` |
| `restart.ps1` | Reiniciar servicios | `.\docker-scripts\restart.ps1 [servicio]` |
| `logs.ps1` | Ver logs | `.\docker-scripts\logs.ps1 [servicio]` |
| `status.ps1` | Ver estado | `.\docker-scripts\status.ps1` |
| `backup.ps1` | Respaldo de BD | `.\docker-scripts\backup.ps1` |
| `restore.ps1` | Restaurar BD | `.\docker-scripts\restore.ps1 -BackupFile ARCHIVO` |
| `clean.ps1` | Limpiar recursos | `.\docker-scripts\clean.ps1 [opciones]` |

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Middleware    │
│   (Angular)     │    │   (Spring Boot) │    │   (Python)      │
│   Port: 80      │    │   Port: 8080    │    │   Port: 9099    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (PostgreSQL)  │
                    │   Port: 5432    │
                    └─────────────────┘
```

## 📚 Documentación Completa

Para información detallada, consulta: **[DOCKER.md](DOCKER.md)**

## ⚡ Comandos Útiles

```bash
# Ver estado de todos los servicios
.\docker-scripts\status.ps1

# Ver logs en tiempo real
.\docker-scripts\logs.ps1 -Follow

# Reiniciar solo el backend
.\docker-scripts\restart.ps1 backend

# Crear respaldo de la base de datos
.\docker-scripts\backup.ps1

# Limpiar recursos no utilizados
.\docker-scripts\clean.ps1 -Images
```

## 🔧 Solución de Problemas

### Puerto ya en uso
```bash
# Detener servicios
.\docker-scripts\stop.ps1

# Verificar puertos
netstat -ano | findstr :8080
```

### Error de permisos
```powershell
# Ejecutar como administrador o cambiar política
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Ver logs de errores
```bash
# Ver logs de un servicio específico
.\docker-scripts\logs.ps1 backend
.\docker-scripts\logs.ps1 database
```

---

**¿Necesitas ayuda?** Ejecuta cualquier script con `-Help` para ver la ayuda detallada.
