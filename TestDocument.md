# Documento de Pruebas Swagger - Rol ADMINISTRADOR
## Sistema INIA - Proyecto de Análisis de Semillas

Este documento proporciona una guía completa para realizar pruebas de la API utilizando Swagger UI con el rol de **ADMINISTRADOR**. Incluye todos los endpoints disponibles, datos de prueba realistas y flujos de trabajo completos.

---

## 🔐 AUTENTICACIÓN Y CONFIGURACIÓN INICIAL

### 1. Acceso a Swagger UI
- **URL**: `http://localhost:8080/swagger-ui/index.html`
- **Documentación API**: `http://localhost:8080/v3/api-docs`

### 2. Flujo de Autenticación

#### Paso 1: Obtener Token JWT
**Endpoint**: `POST /api/seguridad/login`

**Headers**:
```
Content-Type: application/json
```

**Body de Prueba**:
```json
{
  "email": "admin@inia.com",
  "password": "admin123"
}
```

**Respuesta Esperada**:
```json
{
  "nombre": "Administrador Sistema",
  "email": "admin@inia.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "roles": ["ADMIN"]
}
```

#### Paso 2: Configurar Autorización en Swagger
1. Hacer clic en el botón **"Authorize"** en Swagger UI
2. En el campo **"Value"**, ingresar: `Bearer {token_jwt}`
3. Hacer clic en **"Authorize"** y luego **"Close"**

---

## 📋 ENDPOINTS DISPONIBLES PARA ADMIN

### 🔑 SEGURIDAD Y AUTENTICACIÓN

#### Login
- **POST** `/api/seguridad/login` - Autenticar usuario
- **POST** `/api/seguridad/register` - Registrar nuevo usuario (si está disponible)

---

### 👥 GESTIÓN DE USUARIOS (Solo ADMIN)

#### UsuarioController
- **POST** `/api/v1/usuario/crear` - Crear usuario
- **GET** `/api/v1/usuario/listar` - Listar todos los usuarios
- **GET** `/api/v1/usuario/obtener/{id}` - Obtener usuario por ID
- **PUT** `/api/v1/usuario/editar` - Editar usuario
- **PUT** `/api/v1/usuario/eliminar` - Eliminar usuario

**Datos de Prueba - Usuario**:
```json
{
  "email": "analista.test@inia.com",
  "nombre": "Analista de Prueba",
  "password": "password123",
  "rol": "ANALISTA",
  "activo": true
}
```

---

### 📦 GESTIÓN DE LOTES

#### LoteController
- **POST** `/api/v1/lote/crear` - Crear lote
- **GET** `/api/v1/lote/listar` - Listar lotes
- **GET** `/api/v1/lote/{id}` - Obtener lote por ID
- **PUT** `/api/v1/lote/editar` - Editar lote
- **PUT** `/api/v1/lote/eliminar/{id}` - Eliminar lote

**Datos de Prueba - Lote**:
```json
{
  "nombre": "Lote Semillas Trigo",
  "descripcion": "Lote de semillas de trigo para análisis de calidad",
  "fechaCreacion": "2024-01-15T10:30:00",
  "fechaFinalizacion": "2024-12-31T23:59:59",
  "activo": true,
  "usuariosId": [1]
}
```

---

### 📄 GESTIÓN DE RECIBOS

#### ReciboController
- **POST** `/api/v1/recibo/crear` - Crear recibo
- **GET** `/api/v1/recibo/{id}` - Obtener recibo por ID
- **PUT** `/api/v1/recibo/editar` - Editar recibo
- **PUT** `/api/v1/recibo/eliminar/{id}` - Eliminar recibo

**Datos de Prueba - Recibo**:
```json
{
  "nroAnalisis": 2024001,
  "especie": "Triticum aestivum",
  "ficha": "FIC-001-2024",
  "fechaRecibo": "2024-01-15T14:30:00",
  "remitente": "Productor Agrícola S.A.",
  "origen": "Campo Experimental Norte",
  "cultivar": "Trigo Premium",
  "deposito": "Almacén Central",
  "estado": "RECIBIDO",
  "lote": 1,
  "kgLimpios": 25.5,
  "analisisSolicitados": "PMS,DOSN,PUREZA,GERMINACION",
  "articulo": 1,
  "activo": true
}
```

---

### 🔬 ANÁLISIS DE SEMILLAS

#### 1. PMS (Peso de Mil Semillas)
**PMSController**
- **POST** `/api/v1/pms/crear` - Crear análisis PMS
- **GET** `/api/v1/pms/{id}` - Obtener PMS por ID
- **PUT** `/api/v1/pms/editar` - Editar PMS
- **PUT** `/api/v1/pms/eliminar/{id}` - Eliminar PMS

**Datos de Prueba - PMS**:
```json
{
  "pesoMilSemillas": 45.2,
  "humedadPorcentual": 12.5,
  "fechaMedicion": "2024-01-16T09:00:00",
  "metodo": "ISTA",
  "observaciones": "Análisis realizado según estándares ISTA",
  "activo": true,
  "reciboId": 1
}
```

#### 2. DOSN (Determinación de Otras Semillas por Número)
**DOSNController**
- **POST** `/api/v1/DOSN/crear` - Crear análisis DOSN
- **GET** `/api/v1/DOSN/{id}` - Obtener DOSN por ID
- **PUT** `/api/v1/DOSN/editar` - Editar DOSN
- **PUT** `/api/v1/DOSN/eliminar/{id}` - Eliminar DOSN
- **GET** `/api/v1/DOSN/listar/recibo/{id}` - Listar DOSN por recibo

**Datos de Prueba - DOSN**:
```json
{
  "fecha": "2024-01-16T10:00:00",
  "gramosAnalizados": 25.0,
  "tiposDeanalisis": "COMPLETO",
  "completoReducido": true,
  "malezasToleranciaCero": 0.0,
  "otrosCultivos": 0.5,
  "determinacionBrassica": 0.0,
  "determinacionCuscuta": 0.0,
  "estandar": true,
  "fechaAnalisis": "2024-01-16T10:00:00",
  "observaciones": "Análisis DOSN completo según protocolo",
  "activo": true,
  "reciboId": 1
}
```

#### 3. Germinación
**GerminacionController**
- **POST** `/api/v1/germinacion/crear` - Crear análisis de germinación
- **GET** `/api/v1/germinacion/{id}` - Obtener germinación por ID
- **PUT** `/api/v1/germinacion/editar` - Editar germinación
- **PUT** `/api/v1/germinacion/eliminar/{id}` - Eliminar germinación

**Datos de Prueba - Germinación**:
```json
{
  "fechaInicio": "2024-01-16T08:00:00",
  "fechaConteo1": "2024-01-18T08:00:00",
  "fechaConteo2": "2024-01-20T08:00:00",
  "fechaConteo3": "2024-01-22T08:00:00",
  "fechaConteo4": "2024-01-24T08:00:00",
  "fechaConteo5": "2024-01-26T08:00:00",
  "totalDias": 10,
  "repeticionNormal1": 95,
  "repeticionNormal2": 92,
  "repeticionNormal3": 98,
  "repeticionNormal4": 94,
  "repeticionNormal5": 96,
  "repeticionDura": 2,
  "repeticionFresca": 1,
  "repeticionAnormal": 3,
  "repeticionMuerta": 1,
  "totalRepeticion": 400,
  "promedioRepeticiones": 95.0,
  "tratamiento": "SIN_TRATAMIENTO",
  "nroSemillaPorRepeticion": 100,
  "metodo": "PAPEL",
  "temperatura": 20.0,
  "preFrio": "SIN_PRE_FRIO",
  "preTratamiento": "SIN_PRE_TRATAMIENTO",
  "nroDias": 10,
  "fechaFinal": "2024-01-26T08:00:00",
  "pRedondeo": 95,
  "pNormal": 95,
  "pAnormal": 3,
  "pMuertas": 1,
  "semillasDuras": 2,
  "germinacion": 95,
  "comentarios": "Excelente germinación, semillas de alta calidad",
  "activo": true,
  "reciboId": 1
}
```

#### 4. Hongos
**HongoController**
- **POST** `/api/v1/hongo/crear` - Crear hongo
- **GET** `/api/v1/hongo/listar` - Listar hongos
- **GET** `/api/v1/hongo/{id}` - Obtener hongo por ID
- **PUT** `/api/v1/hongo/editar` - Editar hongo
- **PUT** `/api/v1/hongo/eliminar/{id}` - Eliminar hongo

**Datos de Prueba - Hongo**:
```json
{
  "nombre": "Fusarium graminearum",
  "descripcion": "Hongo patógeno que afecta la germinación de semillas de cereales",
  "activo": true
}
```

#### 5. Malezas
**MalezaController**
- **POST** `/api/v1/maleza/crear` - Crear maleza
- **GET** `/api/v1/maleza/listar` - Listar malezas
- **GET** `/api/v1/maleza/{id}` - Obtener maleza por ID
- **PUT** `/api/v1/maleza/editar` - Editar maleza
- **PUT** `/api/v1/maleza/eliminar/{id}` - Eliminar maleza

**Datos de Prueba - Maleza**:
```json
{
  "nombre": "Amaranthus retroflexus",
  "descripcion": "Maleza común en cultivos de cereales, tolerancia cero",
  "activo": true
}
```

#### 6. Pureza
**PurezaController**
- **POST** `/api/v1/pureza/crear` - Crear análisis de pureza
- **GET** `/api/v1/pureza/listar` - Listar análisis de pureza
- **GET** `/api/v1/pureza/{id}` - Obtener pureza por ID
- **PUT** `/api/v1/pureza/editar` - Editar pureza
- **PUT** `/api/v1/pureza/eliminar/{id}` - Eliminar pureza

**Datos de Prueba - Pureza**:
```json
{
  "fecha": "2024-01-16T11:00:00",
  "pesoInicial": 25.0,
  "semillaPura": 24.5,
  "materialInerte": 0.3,
  "otrosCultivos": 0.1,
  "malezas": 0.05,
  "malezasToleradas": 0.05,
  "pesoTotal": 25.0,
  "otrosCultivo": 0.1,
  "fechaEstandar": "2024-01-16T11:00:00",
  "estandar": true,
  "activo": true,
  "reciboId": 1
}
```

#### 7. Pureza P. Notatum
**PurezaPNotatumController**
- **POST** `/api/v1/PurezaPNotatum/crear` - Crear análisis Pureza P. Notatum
- **GET** `/api/v1/PurezaPNotatum/{id}` - Obtener Pureza P. Notatum por ID
- **PUT** `/api/v1/PurezaPNotatum/editar` - Editar Pureza P. Notatum
- **PUT** `/api/v1/PurezaPNotatum/eliminar/{id}` - Eliminar Pureza P. Notatum

**Datos de Prueba - Pureza P. Notatum**:
```json
{
  "fecha": "2024-01-16T12:00:00",
  "pesoInicial": 10.0,
  "semillaPura": 9.8,
  "materialInerte": 0.1,
  "otrosCultivos": 0.05,
  "malezas": 0.03,
  "malezasToleradas": 0.02,
  "pesoTotal": 10.0,
  "otrosCultivo": 0.05,
  "fechaEstandar": "2024-01-16T12:00:00",
  "estandar": true,
  "activo": true,
  "reciboId": 1
}
```

#### 8. Sanitario
**SanitarioController**
- **POST** `/api/v1/Sanitario/crear` - Crear análisis sanitario
- **GET** `/api/v1/Sanitario/{id}` - Obtener sanitario por ID
- **PUT** `/api/v1/Sanitario/editar` - Editar sanitario
- **PUT** `/api/v1/Sanitario/eliminar/{id}` - Eliminar sanitario
- **GET** `/api/v1/Sanitario/listar/recibo/{id}` - Listar sanitarios por recibo

**Datos de Prueba - Sanitario**:
```json
{
  "fechaSiembra": "2024-01-16T08:00:00",
  "fecha": "2024-01-16T13:00:00",
  "metodo": "PAPEL_FILTRO",
  "temperatura": 20,
  "horasLuzOscuridad": 12,
  "nroDias": 7,
  "estadoProductoDosis": "APTO",
  "observaciones": "Análisis sanitario sin presencia de patógenos",
  "nroSemillasRepeticion": 100,
  "activo": true,
  "reciboId": 1,
  "sanitarioHongoids": [1]
}
```

#### 9. Tetrazolio
**TetrazolioController**
- **POST** `/api/v1/Tetrazolio/crear` - Crear análisis de tetrazolio
- **GET** `/api/v1/Tetrazolio/{id}` - Obtener tetrazolio por ID
- **PUT** `/api/v1/Tetrazolio/editar` - Editar tetrazolio
- **PUT** `/api/v1/Tetrazolio/eliminar/{id}` - Eliminar tetrazolio
- **GET** `/api/v1/Tetrazolio/listar/recibo/{id}` - Listar tetrazolios por recibo

**Datos de Prueba - Tetrazolio**:
```json
{
  "repeticion": 1,
  "nroSemillasPorRepeticion": 100,
  "pretratamientoId": 1,
  "concentracion": 1.0,
  "tincionHoras": 2.0,
  "tincionGrados": 30.0,
  "fecha": "2024-01-16T14:00:00",
  "viables": 95.0,
  "noViables": 3.0,
  "duras": 2.0,
  "total": 100.0,
  "promedio": 95.0,
  "porcentaje": 95,
  "viabilidadPorTetrazolio": "VIABLE",
  "nroSemillas": 100,
  "daniosNroSemillas": 5,
  "daniosMecanicos": 2,
  "danioAmbiente": 1,
  "daniosChinches": 1,
  "daniosFracturas": 1,
  "daniosOtros": 0,
  "daniosDuras": 2,
  "viabilidadVigorTz": "ALTO",
  "porcentajeFinal": 95,
  "daniosPorPorcentajes": 5,
  "activo": true,
  "reciboId": 1
}
```

---

### 🔧 MIDDLEWARE Y HERRAMIENTAS (Solo ADMIN)

#### PandMiddlewareController
- **POST** `/api/pandmiddleware/http/exportar` - Exportar tablas a Excel
- **POST** `/api/pandmiddleware/http/importar` - Importar datos desde Excel
- **POST** `/api/pandmiddleware/http/insertar-masivo` - Inserción masiva de datos

---

## 🔄 FLUJOS DE PRUEBA RECOMENDADOS

### Flujo 1: Gestión Completa de Usuario
1. **Crear Usuario** → POST `/api/v1/usuario/crear`
2. **Listar Usuarios** → GET `/api/v1/usuario/listar`
3. **Obtener Usuario** → GET `/api/v1/usuario/obtener/{id}`
4. **Editar Usuario** → PUT `/api/v1/usuario/editar`
5. **Eliminar Usuario** → PUT `/api/v1/usuario/eliminar`

### Flujo 2: Proceso Completo de Análisis
1. **Crear Lote** → POST `/api/v1/lote/crear`
2. **Crear Recibo** → POST `/api/v1/recibo/crear`
3. **Crear Análisis PMS** → POST `/api/v1/pms/crear`
4. **Crear Análisis DOSN** → POST `/api/v1/DOSN/crear`
5. **Crear Análisis Pureza** → POST `/api/v1/pureza/crear`
6. **Crear Análisis Germinación** → POST `/api/v1/germinacion/crear`
7. **Crear Análisis Sanitario** → POST `/api/v1/Sanitario/crear`
8. **Crear Análisis Tetrazolio** → POST `/api/v1/Tetrazolio/crear`

### Flujo 3: Gestión de Catálogos
1. **Crear Hongo** → POST `/api/v1/hongo/crear`
2. **Crear Maleza** → POST `/api/v1/maleza/crear`
3. **Listar Hongos** → GET `/api/v1/hongo/listar`
4. **Listar Malezas** → GET `/api/v1/maleza/listar`

### Flujo 4: Pruebas de Edición de Usuarios con Contraseñas
1. **Crear Usuario de Prueba** → POST `/api/v1/usuario/crear`
2. **Editar Solo Datos Básicos** → PUT `/api/v1/usuario/editar` (sin contraseña)
3. **Editar con Contraseña Corta** → PUT `/api/v1/usuario/editar` (contraseña ≤ 6 caracteres)
4. **Editar con Contraseña Válida** → PUT `/api/v1/usuario/editar` (contraseña > 6 caracteres)
5. **Verificar Login con Nueva Contraseña** → POST `/api/seguridad/login`

---

## ⚠️ CASOS DE PRUEBA CRÍTICOS

### 1. Validaciones de Seguridad
- **Sin Token**: Intentar acceder a endpoints protegidos sin JWT
- **Token Expirado**: Usar token expirado
- **Token Inválido**: Usar token malformado
- **Rol Incorrecto**: Intentar acceder con rol diferente a ADMIN

### 2. Validaciones de Datos
- **Campos Obligatorios**: Enviar requests sin campos requeridos
- **Formato de Email**: Validar formato de email en usuarios
- **Nombres con Números**: Enviar nombres que contengan números (para lotes, hongos, malezas)
- **Fechas Inválidas**: Enviar fechas en formato incorrecto
- **Valores Negativos**: Enviar valores negativos en campos numéricos

### 3. Pruebas Específicas de Edición de Usuarios

#### Caso 1: Editar Solo Datos Básicos (Sin Cambiar Contraseña)
**Endpoint**: `PUT /api/v1/usuario/editar`

**Request**:
```json
{
  "id": 1,
  "email": "usuario.actualizado@inia.com",
  "nombre": "Usuario Actualizado",
  "password": null,
  "rol": "ANALISTA",
  "activo": true
}
```

**Resultado Esperado**:
- ✅ Se actualiza email y nombre
- ✅ La contraseña se mantiene igual (no se invalida el usuario)
- ✅ El usuario puede seguir haciendo login con su contraseña original

#### Caso 2: Editar con Contraseña Corta (Ignorada)
**Endpoint**: `PUT /api/v1/usuario/editar`

**Request**:
```json
{
  "id": 1,
  "email": "usuario@inia.com",
  "nombre": "Usuario Test",
  "password": "123",
  "rol": "ANALISTA",
  "activo": true
}
```

**Resultado Esperado**:
- ✅ Se actualiza email y nombre
- ✅ La contraseña "123" se ignora (≤ 6 caracteres)
- ✅ Se mantiene la contraseña original
- ✅ El usuario puede seguir haciendo login con su contraseña original

#### Caso 3: Editar con Contraseña Válida (Nueva)
**Endpoint**: `PUT /api/v1/usuario/editar`

**Request**:
```json
{
  "id": 1,
  "email": "usuario@inia.com",
  "nombre": "Usuario Test",
  "password": "nuevaPassword123",
  "rol": "ANALISTA",
  "activo": true
}
```

**Resultado Esperado**:
- ✅ Se actualiza email, nombre y contraseña
- ✅ La nueva contraseña se encripta automáticamente
- ✅ El usuario debe usar la nueva contraseña para hacer login

#### Caso 4: Verificar Login con Nueva Contraseña
**Endpoint**: `POST /api/seguridad/login`

**Request**:
```json
{
  "email": "usuario@inia.com",
  "password": "nuevaPassword123"
}
```

**Resultado Esperado**:
- ✅ Login exitoso con la nueva contraseña
- ✅ Se genera un nuevo token JWT válido

#### Caso 5: Intentar Login con Contraseña Anterior (Debe Fallar)
**Endpoint**: `POST /api/seguridad/login`

**Request**:
```json
{
  "email": "usuario@inia.com",
  "password": "contraseñaAnterior"
}
```

**Resultado Esperado**:
- ❌ Login fallido (400 Bad Request)
- ❌ Mensaje: "Usuario o password incorrecto"

### 4. Manejo de Errores
- **404 Not Found**: Buscar recursos inexistentes
- **400 Bad Request**: Enviar datos inválidos
- **500 Internal Server Error**: Probar casos límite

### 5. Operaciones CRUD Completas
- **Crear** → **Leer** → **Actualizar** → **Eliminar** para cada entidad
- **Verificar Integridad**: Comprobar que las relaciones se mantienen correctamente

---

## 📊 CÓDIGOS DE RESPUESTA ESPERADOS

| Código | Descripción | Cuándo Ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos o faltantes |
| 401 | Unauthorized | Token JWT inválido o faltante |
| 403 | Forbidden | Sin permisos para la operación |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error interno del servidor |

---

## 🎯 CONSEJOS PARA PRUEBAS EFICACES

1. **Orden de Pruebas**: Siempre crear primero los recursos dependientes (Usuario → Lote → Recibo → Análisis)
2. **Limpieza**: Eliminar recursos de prueba al finalizar
3. **Datos Realistas**: Usar datos que reflejen casos reales de uso
4. **Validación de Respuestas**: Verificar que las respuestas contengan los datos esperados
5. **Pruebas de Límites**: Probar con valores mínimos y máximos
6. **Documentación**: Registrar cualquier comportamiento inesperado

### 🔐 Consejos Específicos para Pruebas de Edición de Usuarios

1. **Secuencia de Pruebas**: 
   - Crear usuario → Editar sin contraseña → Editar con contraseña corta → Editar con contraseña válida
   
2. **Verificación de Contraseñas**:
   - Siempre probar login después de cada edición
   - Verificar que contraseñas cortas se ignoren
   - Confirmar que contraseñas válidas se apliquen
   
3. **Datos de Prueba**:
   - Usar contraseñas de prueba fáciles de recordar: `test123`, `password456`
   - Probar con contraseñas de exactamente 6 caracteres: `123456`
   - Probar con contraseñas de 7+ caracteres: `nueva123`
   
4. **Validación de Seguridad**:
   - Nunca enviar contraseñas en respuestas
   - Verificar que las contraseñas se encripten correctamente
   - Confirmar que usuarios no queden invalidados

---

## 🔍 MONITOREO Y DEBUGGING

### Logs Importantes
- Revisar logs del servidor para errores 500
- Verificar logs de autenticación para problemas de JWT
- Monitorear logs de base de datos para consultas lentas

### Herramientas Adicionales
- **Postman**: Para pruebas más avanzadas y automatización
- **Insomnia**: Alternativa a Postman
- **curl**: Para pruebas desde línea de comandos

---

*Este documento debe actualizarse cuando se agreguen nuevos endpoints o se modifiquen los existentes.*

---

## Parámetros y datos de prueba para listados (no análisis)

Las siguientes secciones proveen datos de prueba para crear 5 registros por entidad y luego validar los endpoints de listado que no corresponden a análisis. Crea primero estos registros con los endpoints de creación y luego utiliza los endpoints `GET .../listar` o equivalentes.

### Usuario - GET `/api/v1/usuario/listar`
Crear previamente con `POST` `/api/v1/usuario/crear`:

```json
[
  {"email": "ana.garcia@inia.com", "nombre": "Ana Garcia", "password": "Ana12345", "rol": "ANALISTA", "activo": true},
  {"email": "bruno.perez@inia.com", "nombre": "Bruno Perez", "password": "Bruno12345", "rol": "ANALISTA", "activo": true},
  {"email": "carla.lopez@inia.com", "nombre": "Carla Lopez", "password": "Carla12345", "rol": "ANALISTA", "activo": true},
  {"email": "diego.rios@inia.com", "nombre": "Diego Rios", "password": "Diego12345", "rol": "ANALISTA", "activo": false},
  {"email": "elena.soto@inia.com", "nombre": "Elena Soto", "password": "Elena12345", "rol": "ANALISTA", "activo": true}
]
```

Luego listar con `GET` `/api/v1/usuario/listar`.

### Lote - GET `/api/v1/lote/listar`
Crear previamente con `POST` `/api/v1/lote/crear` (asegúrate de tener al menos un `usuario` creado; usa `usuariosId: [1]` o IDs existentes):

```json
[
  {
    "nombre": "Lote Trigo Norte",
    "descripcion": "Semillas de trigo zona norte",
    "fechaCreacion": "2024-02-01T09:00:00",
    "fechaFinalizacion": "2024-12-15T18:00:00",
    "activo": true,
    "usuariosId": [1]
  },
  {
    "nombre": "Lote Maiz Centro",
    "descripcion": "Semillas de maíz híbrido",
    "fechaCreacion": "2024-03-05T10:30:00",
    "fechaFinalizacion": "2024-11-30T17:00:00",
    "activo": true,
    "usuariosId": [1]
  },
  {
    "nombre": "Lote Soja Sur",
    "descripcion": "Semillas de soja grupo IV",
    "fechaCreacion": "2024-04-10T08:15:00",
    "fechaFinalizacion": "2024-10-31T23:59:59",
    "activo": false,
    "usuariosId": [1]
  },
  {
    "nombre": "Lote Cebada Este",
    "descripcion": "Semillas de cebada cervecera",
    "fechaCreacion": "2024-05-12T11:45:00",
    "fechaFinalizacion": "2024-12-01T20:00:00",
    "activo": true,
    "usuariosId": [1]
  },
  {
    "nombre": "Lote Avena Andina",
    "descripcion": "Semillas de avena forrajera",
    "fechaCreacion": "2024-06-20T14:00:00",
    "fechaFinalizacion": "2024-12-20T12:00:00",
    "activo": true,
    "usuariosId": [1]
  }
]
```

Luego listar con `GET` `/api/v1/lote/listar`.

### Hongo (catálogo) - GET `/api/v1/hongo/listar`
Crear previamente con `POST` `/api/v1/hongo/crear`:

```json
[
  {"id": 0, "nombre": "Fusarium graminearum", "descripcion": "Patógeno en cereales", "activo": true},
  {"id": 0, "nombre": "Aspergillus flavus", "descripcion": "Producción de aflatoxinas", "activo": true},
  {"id": 0, "nombre": "Alternaria alternata", "descripcion": "Afecta semillas almacenadas", "activo": true},
  {"id": 0, "nombre": "Penicillium spp.", "descripcion": "Contaminante postcosecha", "activo": false},
  {"id": 0, "nombre": "Rhizoctonia solani", "descripcion": "Patógeno del suelo", "activo": true}
]
```

Luego listar con `GET` `/api/v1/hongo/listar`.

### Maleza (catálogo) - GET `/api/v1/maleza/listar`
Crear previamente con `POST` `/api/v1/maleza/crear`:

```json
[
  {"id": 0, "nombre": "Amaranthus retroflexus", "descripcion": "Yuyo colorado", "activo": true},
  {"id": 0, "nombre": "Sorghum halepense", "descripcion": "Sorgo de Alepo", "activo": true},
  {"id": 0, "nombre": "Echinochloa crus-galli", "descripcion": "Pasto cuaresma", "activo": true},
  {"id": 0, "nombre": "Cuscuta campestris", "descripcion": "Cuscuta (tolerancia cero)", "activo": false},
  {"id": 0, "nombre": "Brassica rapa", "descripcion": "Nabo (otros cultivos)", "activo": true}
]
```

Luego listar con `GET` `/api/v1/maleza/listar`.

### Depósito (catálogo) - GET `/api/v1/deposito/listar`
Crear previamente con `POST` `/api/v1/deposito/crear`:

```json
[
  {"id": 0, "nombre": "Almacén Central", "activo": true},
  {"id": 0, "nombre": "Depósito Norte", "activo": true},
  {"id": 0, "nombre": "Depósito Sur", "activo": false},
  {"id": 0, "nombre": "Bodega Semillas 1", "activo": true},
  {"id": 0, "nombre": "Bodega Semillas 2", "activo": true}
]
```

Luego listar con `GET` `/api/v1/deposito/listar`.