# Scripts AWS - Proyecto INIA

Scripts PowerShell para gestionar recursos de AWS con AWS CLI.

## Scripts Disponibles

- **eliminar-recursos-aws.ps1** - Eliminar TODOS los recursos AWS del proyecto
- **eliminar-rds.ps1** - Eliminar SOLO la base de datos RDS
- **verificar-eliminacion-aws.ps1** - Verificar estado de eliminacion en tiempo real

## eliminar-recursos-aws.ps1

Script para eliminar PERMANENTEMENTE todos los recursos de AWS del proyecto INIA usando AWS CLI.

### Uso

```powershell
# Con confirmacion (RECOMENDADO)
.\awsScripts\eliminar-recursos-aws.ps1

# Sin confirmacion (PELIGROSO)
.\awsScripts\eliminar-recursos-aws.ps1 -AutoApprove

# Ver ayuda
.\awsScripts\eliminar-recursos-aws.ps1 -Help
```

### Que Elimina

El script elimina en orden con mejoras automaticas:

1. **ECS Services** - Para servicios y los elimina
2. **ECS Cluster** - Espera a que servicios terminen, elimina completamente
3. **RDS Database** - **Desactiva Deletion Protection automaticamente**, elimina (DATOS PERDIDOS)
4. **Target Groups** - 3 target groups del ALB
5. **Application Load Balancer** - Load balancer principal, espera eliminacion completa
6. **ECR Repositories** - Repositorios e imagenes Docker
7. **CloudWatch Logs** - Todos los logs del proyecto
8. **Secrets Manager** - Secrets de credenciales
9. **VPC Endpoints** - Endpoints privados, espera eliminacion completa
10. **Security Groups** - Limpia reglas, multiples intentos, eliminacion completa
11. **VPC Components** - Internet Gateways, NAT Gateways, Route Tables, Subnets, Network ACLs
12. **VPC** - Virtual Private Cloud completa

**MEJORAS v2.0:**
- Desactiva automaticamente Deletion Protection en RDS
- Elimina recursos COMPLETAMENTE (no los deja inactivos)
- Esperas automaticas para dependencias (ALB, VPC Endpoints)
- Multiples intentos para Security Groups con dependencias
- Mejor manejo de errores y mensajes detallados

### Prerequisitos

1. **AWS CLI instalado**
   ```powershell
   aws --version
   ```

2. **Credenciales configuradas**
   ```powershell
   aws configure
   # O verificar:
   aws sts get-caller-identity
   ```

3. **Permisos necesarios:**
   - ECS: Full access
   - RDS: Delete instances
   - EC2: VPC, Security Groups, Load Balancers
   - ECR: Delete repositories
   - CloudWatch: Delete logs
   - Secrets Manager: Delete secrets

### Confirmaciones de Seguridad

El script requiere **2 confirmaciones** antes de eliminar:

1. Escribir exactamente: `ELIMINAR`
2. Escribir exactamente: `BORRAR TODO`
3. Espera 10 segundos adicionales para cancelar

Puedes usar `-AutoApprove` para omitir confirmaciones (NO RECOMENDADO)

### Deletion Protection Automatica

El script **desactiva automaticamente** la protección de eliminación en RDS:

1. **Detecta** si RDS tiene Deletion Protection activada
2. **Desactiva** la protección con `--no-deletion-protection`
3. **Elimina** la instancia RDS completamente

Antes tenías que hacerlo manualmente en AWS Console. Ahora es automatico.

### Tiempo Estimado

- **Ejecucion del script:** 3-5 minutos
- **RDS Database:** 5-10 minutos adicionales (en background)
- **Total:** ~15 minutos para eliminacion completa

### Recursos que NO Elimina

Por limitaciones de AWS CLI:

- **IAM Roles** creados por Terraform
  - `inia-prod-ecs-task-execution-role`
  - `inia-prod-ecs-task-role`
  - Eliminarlos manualmente o con Terraform

- **S3 Bucket** de Terraform state
  - `inia-terraform-state`
  - Eliminarlo manualmente si ya no lo necesitas

- **DynamoDB Table** de Terraform locks
  - `inia-terraform-locks`
  - Eliminarlo manualmente si ya no lo necesitas

### Ejemplo de Salida

```
========================================
  ELIMINAR Recursos AWS - Proyecto INIA
========================================

[1/13] Validando prerequisitos...
  AWS CLI: OK
  AWS Account: 126588786097

ADVERTENCIA CRITICA:
  Este script ELIMINARA PERMANENTEMENTE...

Para continuar, escribe exactamente: ELIMINAR
Confirmacion: ELIMINAR

Segunda confirmacion. Escribe exactamente: BORRAR TODO
Confirmacion: BORRAR TODO

[2/13] Eliminando ECS Services...
  Eliminando servicio: inia-prod-backend-service
  Servicios ECS eliminados

[3/13] Eliminando ECS Cluster...
  Verificando servicios...
  Cluster ECS marcado para eliminacion COMPLETA

[4/13] Eliminando RDS Database...
  Estado actual: available
  Deletion Protection ACTIVA - Desactivando...
  Deletion Protection DESACTIVADA
  Eliminando instancia RDS...
  RDS Database marcada para eliminacion COMPLETA
  (Tomara 5-10 minutos en eliminarse completamente)

...

[11/13] Eliminando VPC Endpoints...
  Eliminando endpoint: vpce-xxxxx
  Esperando eliminacion completa de endpoints...
  VPC Endpoints eliminados completamente

[12/13] Eliminando Security Groups...
  Paso 1: Limpiando reglas de ingress y egress...
  Paso 2: Eliminando Security Groups...
    Intento 1 de 3
      Eliminado: sg-xxxxx
  Security Groups eliminados completamente

[13/13] Eliminando VPC y componentes...
  Paso 1: Eliminando Internet Gateways...
  Paso 2: Verificando NAT Gateways...
  Paso 3: Eliminando Route Tables...
  Paso 4: Eliminando Subnets...
  Paso 5: Eliminando Network ACLs...
  Paso 6: Eliminando VPC...
    VPC ELIMINADA COMPLETAMENTE

========================================
  Eliminacion Completada
========================================

MEJORAS APLICADAS:
  - Deletion Protection desactivada automaticamente en RDS
  - Eliminacion completa de recursos (no solo inactivos)
  - Esperas automaticas para dependencias
  - Multiples intentos para Security Groups
```

### Verificacion Post-Eliminacion

Despues de ejecutar el script, verifica en AWS Console:

```powershell
# Verificar ECR
aws ecr describe-repositories --region us-east-1

# Verificar ECS
aws ecs list-clusters --region us-east-1

# Verificar VPC
aws ec2 describe-vpcs --region us-east-1 --filters "Name=tag:Name,Values=inia-prod-vpc"

# Verificar RDS
aws rds describe-db-instances --region us-east-1
```

### Casos de Uso

#### Caso 1: Limpiar Despues de Pruebas

```powershell
# Despues de probar deployment
.\awsScripts\eliminar-recursos-aws.ps1

# Confirmar eliminacion
# Esperar 15 minutos

# Verificar costos en AWS Console
```

#### Caso 2: Empezar desde Cero

```powershell
# 1. Eliminar recursos
.\awsScripts\eliminar-recursos-aws.ps1

# 2. Limpiar estado de Terraform
cd terraform
Remove-Item terraform.tfstate*

# 3. Reiniciar Terraform
terraform init

# 4. Aplicar de nuevo
terraform apply
```

#### Caso 3: Eliminar Rapidamente (CUIDADO)

```powershell
# Solo si estas SEGURO
.\awsScripts\eliminar-recursos-aws.ps1 -AutoApprove
```

### Troubleshooting

#### Error: AWS CLI no instalado

```powershell
# Instalar AWS CLI
# https://aws.amazon.com/cli/
```

#### Error: Credenciales invalidas

```powershell
# Configurar credenciales
aws configure
```

#### Error: Permisos insuficientes

```
ERROR: User is not authorized to perform: ecs:DeleteService
```

**Solucion:** Verificar que el usuario IAM tenga permisos necesarios, incluyendo:
- `rds:ModifyDBInstance` - Para desactivar Deletion Protection
- `rds:DeleteDBInstance` - Para eliminar RDS
- `ec2:DeleteVpcEndpoints` - Para eliminar VPC Endpoints
- Permisos completos en EC2, ECS, ELB

#### RDS Deletion Protection (RESUELTO AUTOMATICAMENTE)

Antes era un problema comun:
```
ERROR: Cannot delete RDS instance with deletion protection enabled
```

**Ahora el script lo resuelve automaticamente:**
- Detecta Deletion Protection activada
- La desactiva automaticamente
- Procede con la eliminacion

No necesitas hacer nada manual en AWS Console.

#### Recursos no se eliminan

Algunos recursos pueden tener **protecciones** activadas:
- RDS con deletion protection: **Ahora resuelto automaticamente**
- S3 Buckets con versionado: Vaciar primero manualmente

### Alternativas

#### Opcion 1: Usar Terraform Destroy

Si Terraform tiene el estado sincronizado:

```powershell
cd terraform
terraform destroy
```

**Ventajas:**
- Elimina TODO incluyendo IAM roles
- Mas seguro (usa el estado)
- Registra cambios

#### Opcion 2: Manual en AWS Console

Eliminar uno por uno:
1. ECS Services
2. ECS Cluster
3. RDS Database
4. Load Balancer
5. Target Groups
6. VPC (elimina todo dentro automaticamente)

### Costos

**Eliminar recursos detiene los costos de:**
- ECS Fargate: ~$40/mes
- RDS: ~$15/mes
- ALB: ~$20/mes
- VPC Endpoints: ~$28/mes

**Total ahorro:** ~$109/mes

### Notas Importantes

1. **Backups de RDS**
   - El script usa `--skip-final-snapshot`
   - NO se crea snapshot final
   - TODOS los datos se pierden

2. **Imagenes Docker**
   - Se eliminan de ECR
   - Puedes tenerlas localmente con:
     ```powershell
     docker images | grep inia
     ```

3. **Estado de Terraform**
   - Este script NO actualiza `terraform.tfstate`
   - Terraform seguira pensando que los recursos existen
   - Ejecuta `terraform refresh` o elimina el estado

4. **Recursos Huerfanos**
   - Algunos recursos pueden quedar huerfanos
   - Verificar en AWS Console:
     - CloudWatch Alarms
     - SNS Topics
     - CloudFormation Stacks

### Diferencias con Terraform Destroy

| Aspecto | AWS CLI Script | Terraform Destroy |
|---------|---------------|-------------------|
| Estado Terraform | NO actualiza | Si actualiza |
| IAM Roles | NO elimina | Si elimina |
| Velocidad | Mas rapido | Mas lento |
| Seguridad | Menos seguro | Mas seguro |
| Uso | Emergencias | Normal |

### Cuando Usar Este Script

**Usar cuando:**
- Estado de Terraform corrupto
- Recursos creados manualmente
- Necesitas eliminar rapido
- Terraform destroy falla
- Testing/desarrollo rapido

**NO usar cuando:**
- Produccion
- Terraform funciona bien
- Necesitas backup de datos
- Otros dependen del ambiente

---

## eliminar-rds.ps1

Script especializado para eliminar SOLO la base de datos RDS, con opción de crear snapshot de backup.

### Uso

```powershell
# Eliminar sin backup (PELIGROSO)
.\awsScripts\eliminar-rds.ps1

# Eliminar creando backup (RECOMENDADO)
.\awsScripts\eliminar-rds.ps1 -CreateSnapshot

# Con nombre de snapshot personalizado
.\awsScripts\eliminar-rds.ps1 -CreateSnapshot -SnapshotName "backup-2024-12-20"

# Sin confirmacion (PELIGROSO)
.\awsScripts\eliminar-rds.ps1 -AutoApprove

# Ver ayuda
.\awsScripts\eliminar-rds.ps1 -Help
```

### Características

- **Verificación inteligente:** Verifica si la instancia existe antes de intentar eliminarla
- **Información detallada:** Muestra estado, clase, motor, almacenamiento, endpoint
- **Deletion Protection:** Desactiva automáticamente si está activada
- **Snapshot opcional:** Permite crear backup final antes de eliminar
- **Confirmación segura:** Requiere escribir el nombre exacto de la instancia
- **Monitoreo:** Proporciona múltiples formas de verificar el progreso

### Que Hace

1. **Valida prerequisitos:** AWS CLI y credenciales
2. **Verifica instancia:** Obtiene información completa de RDS
3. **Muestra detalles:** Estado, configuración, endpoint
4. **Desactiva protección:** Deletion Protection si está activada
5. **Elimina instancia:** Con o sin snapshot según opción
6. **Guía monitoreo:** Indica cómo verificar el progreso

### Información Mostrada

```
Instancia RDS encontrada:

  Identificador:         inia-prod-db
  Estado:                available
  Deletion Protection:   True
  Clase:                 db.t3.micro
  Motor:                 postgres 14.9
  Almacenamiento:        20 GB
  Endpoint:              inia-prod-db.xxxxx.us-east-1.rds.amazonaws.com
```

### Con Snapshot (Recomendado)

```powershell
.\awsScripts\eliminar-rds.ps1 -CreateSnapshot
```

**Ventajas:**
- Crea backup completo antes de eliminar
- Puedes restaurar la base de datos después
- Nombre automático con timestamp
- Comando de restauración incluido

**Desventajas:**
- Toma más tiempo (depende del tamaño de la BD)
- Snapshot genera costo de almacenamiento (~$0.095/GB/mes)

### Sin Snapshot (Más Rápido)

```powershell
.\awsScripts\eliminar-rds.ps1
```

**Ventajas:**
- Eliminación más rápida
- No genera costos adicionales
- Limpia backups automáticos

**Desventajas:**
- NO SE PUEDE RECUPERAR
- Pérdida permanente de datos

### Confirmación Requerida

El script requiere escribir el nombre exacto de la instancia:

```
Para continuar, escribe el nombre de la instancia: inia-prod-db
Confirmacion: inia-prod-db

Ultima oportunidad. Presiona Ctrl+C en los proximos 5 segundos para cancelar...
```

### Ejemplo de Salida

```
========================================
  ELIMINAR RDS Database - Proyecto INIA
========================================

Validando prerequisitos...
  AWS CLI: OK
  AWS Account: 126588786097

Verificando instancia RDS...

Instancia RDS encontrada:
  Identificador:         inia-prod-db
  Estado:                available
  Deletion Protection:   True
  Clase:                 db.t3.micro
  Motor:                 postgres 14.9
  Almacenamiento:        20 GB
  Endpoint:              inia-prod-db.xxxxx.us-east-1.rds.amazonaws.com

ADVERTENCIA:
  Esta operacion eliminara PERMANENTEMENTE:
    - Base de datos: inia-prod-db
    - TODOS los datos almacenados

[1/2] Desactivando Deletion Protection...
  Deletion Protection ACTIVA - Desactivando...
  Deletion Protection DESACTIVADA exitosamente

[2/2] Eliminando instancia RDS...
  Creando snapshot final: inia-prod-db-final-2024-12-20-183045

  RDS Database marcada para ELIMINACION COMPLETA

  Estado: DELETING
  Tiempo estimado: 5-10 minutos

  Snapshot creado: inia-prod-db-final-2024-12-20-183045

========================================
  Proceso Iniciado Exitosamente
========================================

Monitorear progreso:
  .\awsScripts\verificar-eliminacion-aws.ps1 -Watch
```

### Restaurar desde Snapshot

Si creaste un snapshot, puedes restaurar:

```powershell
aws rds restore-db-instance-from-db-snapshot `
  --db-instance-identifier inia-prod-db-restored `
  --db-snapshot-identifier inia-prod-db-final-2024-12-20-183045 `
  --region us-east-1
```

### Casos de Uso

#### Caso 1: Eliminar Temporalmente para Ahorrar Costos

```powershell
# Crear backup
.\awsScripts\eliminar-rds.ps1 -CreateSnapshot

# Más tarde, restaurar desde snapshot
aws rds restore-db-instance-from-db-snapshot ...
```

#### Caso 2: Limpiar Completamente

```powershell
# Sin backup (más rápido)
.\awsScripts\eliminar-rds.ps1
```

#### Caso 3: Eliminar y Recrear Limpia

```powershell
# 1. Eliminar RDS existente
.\awsScripts\eliminar-rds.ps1

# 2. Esperar a que termine
.\awsScripts\verificar-eliminacion-aws.ps1 -Watch

# 3. Recrear con Terraform
cd terraform
terraform apply
```

### Troubleshooting

#### RDS No Existe

```
La instancia RDS 'inia-prod-db' NO EXISTE

Posibles razones:
  - Ya fue eliminada previamente
  - El nombre es incorrecto
  - Esta en otra region
```

**Solución:** Verificar con `aws rds describe-db-instances --region us-east-1`

#### Deletion Protection No Se Desactiva

```
ERROR: No se pudo desactivar Deletion Protection
```

**Solución Manual:**
1. AWS Console → RDS
2. Seleccionar instancia
3. Modify → Desmarcar "Enable deletion protection"
4. Apply immediately
5. Ejecutar script de nuevo

#### Error de Permisos

```
ERROR: User is not authorized to perform: rds:ModifyDBInstance
```

**Solución:** Usuario IAM necesita permisos:
- `rds:ModifyDBInstance`
- `rds:DeleteDBInstance`
- `rds:CreateDBSnapshot` (si usas -CreateSnapshot)

### Diferencias con eliminar-recursos-aws.ps1

| Aspecto | eliminar-rds.ps1 | eliminar-recursos-aws.ps1 |
|---------|------------------|---------------------------|
| Alcance | Solo RDS | Todos los recursos |
| Snapshot | Opción disponible | Siempre skip-final-snapshot |
| Velocidad | Rápido | 3-5 minutos |
| Información | Detallada de RDS | General de todos |
| Uso típico | Eliminar solo BD | Limpiar todo |

### Costos

**Eliminando RDS ahorra:**
- db.t3.micro: ~$15-25/mes
- db.t3.small: ~$30-40/mes
- db.t3.medium: ~$60-80/mes

**Si creas snapshot:**
- Almacenamiento: ~$0.095/GB/mes
- Ejemplo 20GB: ~$2/mes

---

## verificar-eliminacion-aws.ps1

Script para monitorear en tiempo real el estado de eliminacion de recursos AWS, especialmente los que tardan mas tiempo como RDS y ALB.

### Uso

```powershell
# Verificacion unica
.\awsScripts\verificar-eliminacion-aws.ps1

# Modo continuo (actualiza automaticamente)
.\awsScripts\verificar-eliminacion-aws.ps1 -Watch

# Actualizar cada 15 segundos
.\awsScripts\verificar-eliminacion-aws.ps1 -Watch -Interval 15

# Ver ayuda
.\awsScripts\verificar-eliminacion-aws.ps1 -Help
```

### Que Verifica

El script monitorea 8 tipos de recursos:

1. **RDS Database** - Base de datos PostgreSQL (5-10 min)
   - Estado: available, deleting, deleted
   - Deletion Protection activada/desactivada
   - Progreso de eliminacion

2. **Application Load Balancer** - Load balancer (2-3 min)
   - Estado: active, provisioning, failed
   - Progreso de eliminacion

3. **ECS Cluster** - Cluster y servicios (1-2 min)
   - Servicios activos
   - Tasks en ejecucion
   - Estado del cluster

4. **VPC y Componentes** - Red (1-2 min)
   - Subnets existentes
   - Security Groups
   - VPC Endpoints
   - VPC ID

5. **ECR Repositories** - Repositorios Docker (< 1 min)
   - backend, frontend, middleware
   - Cantidad de repos existentes

6. **Target Groups** - Grupos del ALB (< 1 min)
   - Cantidad de target groups

7. **Secrets Manager** - Secrets (< 1 min)
   - Cantidad de secrets

8. **CloudWatch Log Groups** - Logs (< 1 min)
   - Cantidad de log groups

### Ejemplo de Salida

```
========================================
  Estado de Eliminacion AWS - INIA
========================================

AWS Account: 126588786097
Region: us-east-1
Hora: 15:23:45
Actualizando cada 30 segundos (Ctrl+C para salir)

Verificando recursos...

  RDS Database (PostgreSQL)
  [==================----------------------]  45%
    Estado: DELETING
    DeletionProtection : False

  Application Load Balancer
  [========================================] 100%
    Estado: ELIMINADO

  ECS Cluster
  [========================================] 100%
    Estado: ELIMINADO

  VPC y Componentes
  [========================================] 100%
    Estado: ELIMINADO

  ECR Repositories
  [========================================] 100%
    Estado: ELIMINADO

  Target Groups
  [========================================] 100%
    Estado: ELIMINADO

  Secrets Manager
  [========================================] 100%
    Estado: ELIMINADO

  CloudWatch Log Groups
  [========================================] 100%
    Estado: ELIMINADO

========================================
  Progreso Total
========================================

  [==================================------]  85%

  Recursos restantes: 1
  Tiempo estimado: ~5 min 30 seg

  RDS Database en proceso de eliminacion
  Esto puede tomar 5-10 minutos...

Proxima actualizacion en 30 segundos...
```

### Casos de Uso

#### Caso 1: Monitorear Eliminacion

```powershell
# 1. Ejecutar script de eliminacion
.\awsScripts\eliminar-recursos-aws.ps1

# 2. En otra terminal, monitorear progreso
.\awsScripts\verificar-eliminacion-aws.ps1 -Watch
```

#### Caso 2: Verificacion Rapida

```powershell
# Ver estado actual sin esperar
.\awsScripts\verificar-eliminacion-aws.ps1
```

#### Caso 3: Monitoreo Frecuente

```powershell
# Actualizar cada 10 segundos
.\awsScripts\verificar-eliminacion-aws.ps1 -Watch -Interval 10
```

### Caracteristicas

- **Progreso Visual:** Barras de progreso para cada recurso
- **Actualizacion Automatica:** Modo watch para monitoreo continuo
- **Tiempo Estimado:** Calcula tiempo restante de eliminacion
- **Informacion Detallada:** Muestra detalles de cada recurso
- **Advertencias:** Alerta sobre Deletion Protection u otros problemas
- **Colores:** Verde (eliminado), Amarillo (eliminando), Rojo (pendiente)

### Tiempos de Eliminacion Tipicos

| Recurso | Tiempo Aproximado |
|---------|-------------------|
| RDS Database | 5-10 minutos |
| Load Balancer | 2-3 minutos |
| ECS Cluster | 1-2 minutos |
| VPC | 1-2 minutos |
| ECR Repositories | < 1 minuto |
| Target Groups | < 1 minuto |
| Secrets Manager | < 1 minuto |
| CloudWatch Logs | < 1 minuto |

### Interpretacion de Estados

#### RDS Database

```
available        - Base de datos activa (no se ha iniciado eliminacion)
deleting        - Eliminacion en progreso (puede tomar 10 min)
deleted         - Completamente eliminada
```

#### Application Load Balancer

```
active          - Load balancer activo (no eliminado)
provisioning    - Creandose o modificandose
failed          - Fallo (requiere atencion)
ELIMINADO       - Ya no existe
```

#### ECS Cluster

```
ACTIVE          - Cluster activo
Services: N     - N servicios corriendo
Tasks: N        - N tareas en ejecucion
ELIMINADO       - Ya no existe
```

### Troubleshooting

#### RDS no se elimina

```
ADVERTENCIA: RDS tiene Deletion Protection activada
```

**Solucion:**
1. Ir a AWS Console → RDS
2. Seleccionar la instancia
3. Modify → Desactivar Deletion Protection
4. Apply changes
5. Volver a ejecutar script de eliminacion

#### Recursos quedan huerfanos

Si algunos recursos aparecen como existentes pero no se eliminan:

```powershell
# Verificar detalles en AWS CLI
aws rds describe-db-instances --region us-east-1
aws elbv2 describe-load-balancers --region us-east-1
aws ecs list-clusters --region us-east-1
```

#### Progreso se detiene

Si el progreso no avanza despues de 15 minutos:

1. Presiona Ctrl+C para detener el watch
2. Verifica AWS Console manualmente
3. Ejecuta el script de verificacion una vez mas
4. Si persiste, elimina recursos manualmente

### Workflow Recomendado

```powershell
# Terminal 1: Ejecutar eliminacion
.\awsScripts\eliminar-recursos-aws.ps1

# Terminal 2: Monitorear progreso
.\awsScripts\verificar-eliminacion-aws.ps1 -Watch

# Cuando todo este en 100%, verificar costos
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY --metrics BlendedCost
```

### Integracion con Otros Scripts

#### Despues de Terraform Destroy

```powershell
# 1. Ejecutar terraform destroy
cd terraform
terraform destroy

# 2. Verificar que todo se elimino
cd ..
.\awsScripts\verificar-eliminacion-aws.ps1
```

#### Antes de Recrear Infraestructura

```powershell
# 1. Verificar que todo este eliminado
.\awsScripts\verificar-eliminacion-aws.ps1

# 2. Si todo en 100%, recrear
cd terraform
terraform apply
```

### Notas Importantes

1. **RDS es el mas lento**
   - Puede tomar hasta 10 minutos
   - Normal ver "deleting" por mucho tiempo

2. **Modo Watch consume recursos**
   - Hace llamadas a AWS cada N segundos
   - Cancelar (Ctrl+C) cuando termines de monitorear

3. **Credenciales AWS**
   - El script valida credenciales antes de empezar
   - Si expiran (AWS Academy), renovarlas y reiniciar

4. **Costos**
   - Este script solo hace queries (read-only)
   - No genera costos significativos

---

---

## Workflow Combinado: Eliminar y Verificar

### Workflow 1: Eliminar TODOS los Recursos (Dos Terminales)

**Terminal 1: Ejecutar eliminacion**
```powershell
.\awsScripts\eliminar-recursos-aws.ps1
```

**Terminal 2: Monitorear progreso**
```powershell
.\awsScripts\verificar-eliminacion-aws.ps1 -Watch -Interval 30
```

### Workflow 2: Eliminar SOLO RDS con Backup

**Terminal 1: Eliminar RDS con snapshot**
```powershell
.\awsScripts\eliminar-rds.ps1 -CreateSnapshot
```

**Terminal 2: Monitorear RDS**
```powershell
# Opcion 1: Script general
.\awsScripts\verificar-eliminacion-aws.ps1 -Watch

# Opcion 2: AWS CLI directo
aws rds describe-db-instances --db-instance-identifier inia-prod-db --region us-east-1 --query 'DBInstances[0].DBInstanceStatus'
```

### Workflow 3: Eliminar RDS Rapidamente (Sin Backup)

```powershell
# Eliminar sin snapshot
.\awsScripts\eliminar-rds.ps1

# Verificar
.\awsScripts\verificar-eliminacion-aws.ps1
```

### Metodo Secuencial (Una Terminal)

```powershell
# 1. Eliminar recursos
.\awsScripts\eliminar-recursos-aws.ps1

# 2. Esperar un momento
Start-Sleep -Seconds 30

# 3. Verificar estado final
.\awsScripts\verificar-eliminacion-aws.ps1
```

### Workflow Completo con Terraform

```powershell
# 1. Intentar con Terraform primero
cd terraform
terraform destroy

# 2. Si falla o estado corrupto, usar AWS CLI
cd ..
.\awsScripts\eliminar-recursos-aws.ps1

# 3. Monitorear (en otra terminal)
.\awsScripts\verificar-eliminacion-aws.ps1 -Watch

# 4. Cuando todo este eliminado (100%), limpiar estado
cd terraform
Remove-Item terraform.tfstate* -Force

# 5. Reiniciar si es necesario
terraform init
```

---

## Comparacion de Scripts

| Caracteristica | eliminar-recursos-aws.ps1 | eliminar-rds.ps1 | verificar-eliminacion-aws.ps1 |
|----------------|---------------------------|------------------|-------------------------------|
| Proposito | Eliminar TODOS | Eliminar solo RDS | Monitorear eliminacion |
| Alcance | 12 tipos de recursos | Solo RDS Database | 8 tipos de recursos |
| Accion | Destructiva | Destructiva | Solo lectura |
| Confirmacion | 2 confirmaciones | 1 confirmacion | No requiere |
| Snapshot RDS | No (siempre skip) | Si (opcional) | N/A |
| Tiempo ejecucion | 3-5 minutos | 5-10 minutos | Instantaneo o continuo |
| Modo watch | No | No | Si (-Watch) |
| Deletion Protection | Desactiva auto | Desactiva auto | Solo muestra estado |
| Info detallada | General | Muy detallada | Progreso visual |
| Uso tipico | Limpiar todo | Eliminar solo BD | Monitoreo continuo |

---

## Documentacion Relacionada

- **scriptDockers/README.md** - Scripts de Docker
- **terraform/README-SCRIPTS.md** - Scripts de Terraform
- **terraform/README.md** - Documentacion de Terraform

---

## Seguridad

- **NUNCA** uses `-AutoApprove` en produccion
- **SIEMPRE** verifica el Account ID antes de confirmar
- **CREAR** backups antes de eliminar
- **NOTIFICAR** al equipo antes de eliminar recursos compartidos
