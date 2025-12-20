# Scripts de Terraform

Scripts simples para gestionar infraestructura en AWS.

## Scripts Disponibles

| Script | Descripción | Cuándo usar |
|--------|-------------|-------------|
| `inicializar-terraform.ps1` | Prepara Terraform | Primera vez o después de limpiar |
| `planear-terraform.ps1` | Ver cambios sin aplicar | Antes de crear/modificar |
| `aplicar-terraform.ps1` | Crear/actualizar recursos | Para aplicar cambios |
| `destruir-terraform.ps1` | Eliminar TODO | Para detener costos |
| `limpiar-terraform.ps1` | Limpiar archivos locales | Si hay errores de estado |
| `ver-estado.ps1` | Ver recursos y outputs | Para consultar información |

---

## Uso Paso a Paso

### 1️⃣ Primera Vez - Crear Infraestructura

```powershell
# Paso 1: Inicializar
.\ScriptTerraform\inicializar-terraform.ps1

# Paso 2: Ver plan
.\ScriptTerraform\planear-terraform.ps1

# Paso 3: Aplicar
.\ScriptTerraform\aplicar-terraform.ps1
# Escribe: yes

# Paso 4: Subir aplicación
.\scriptDockers\subir-imagenes-ecr.ps1 -All
```

**Tiempo:** 10-15 minutos  
**Costo:** ~$109/mes

---

### 2️⃣ Actualizar Infraestructura

```powershell
# Editar configuración
notepad terraform\terraform.tfvars

# Ver cambios
.\ScriptTerraform\planear-terraform.ps1

# Aplicar
.\ScriptTerraform\aplicar-terraform.ps1
# Escribe: yes
```

---

### 3️⃣ Destruir Todo (Detener Costos)

```powershell
.\ScriptTerraform\destruir-terraform.ps1
# Escribe: DESTRUIR
```

**Tiempo:** 5-10 minutos  
**Costo después:** $0/mes

---

### 4️⃣ Ver Estado Actual

```powershell
.\ScriptTerraform\ver-estado.ps1
```

---

### 5️⃣ Limpiar y Reiniciar

```powershell
.\ScriptTerraform\limpiar-terraform.ps1
# Escribe: S
```

Usar si hay errores o archivos corruptos.

---

## Variables de Entorno

Todos los scripts configuran automáticamente:

```powershell
cd C:\Github\IniaProject\terraform
$env:Path += ";$env:USERPROFILE\terraform"
```

No necesitas configurar nada manualmente.

---

## Comandos Terraform Ejecutados

| Script | Comando |
|--------|---------|
| `inicializar-terraform.ps1` | `terraform init` |
| `planear-terraform.ps1` | `terraform plan` |
| `aplicar-terraform.ps1` | `terraform apply` |
| `destruir-terraform.ps1` | `terraform destroy` |
| `limpiar-terraform.ps1` | `rm .terraform/*` + `terraform init` |
| `ver-estado.ps1` | `terraform state list` + `terraform output` |

---

## Errores Comunes

### "terraform no se reconoce"

**Solución:**
```powershell
# Cerrar PowerShell
# Abrir nuevo PowerShell
terraform version
```

### "Failed to install provider"

**Solución:**
```powershell
.\ScriptTerraform\limpiar-terraform.ps1
```

### "Resource already exists"

**Solución:**
```powershell
.\ScriptTerraform\destruir-terraform.ps1
.\ScriptTerraform\inicializar-terraform.ps1
.\ScriptTerraform\aplicar-terraform.ps1
```

---

## Flujo Completo

```
CREAR                    ACTUALIZAR              DESTRUIR
  ↓                         ↓                       ↓
inicializar            planear                 destruir
  ↓                         ↓
planear                 aplicar
  ↓
aplicar
```

---

## Costos Estimados

| Acción | Costo Mensual |
|--------|---------------|
| `aplicar-terraform.ps1` | ~$109/mes |
| `destruir-terraform.ps1` | $0/mes |

Para evitar costos, ejecuta `destruir-terraform.ps1` cuando termines.

---

## Notas

- Todos los scripts incluyen configuración de entorno automática
- Los cambios requieren confirmación (escribir `yes` o `DESTRUIR`)
- Destruir elimina TODOS los datos permanentemente
- Ver estado es seguro, no modifica nada
