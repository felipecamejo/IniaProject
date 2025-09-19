Este documento es para poder crear pruebas con usuarios y usando datos de prueba proporcionados en el mismo.

## FLUJO DE PRUEBAS
Usuario -> Lote -> Recibo -> Análisis (PMS/DOSN/Germinación/Hongo/Maleza/Pureza/Sanitario/Tetrazolio)

## PRUEBAS NECESARIAS PARA CONTROLADORES

### 1. CONTROLADORES PRINCIPALES

**UsuarioController:**
- POST /api/v1/usuario/crear (crear usuario)
- GET /api/v1/usuario/listar (listar usuarios)
- GET /api/v1/usuario/{id} (obtener por ID)
- PUT /api/v1/usuario/editar (editar usuario)
- PUT /api/v1/usuario/eliminar (eliminar usuario)

**LoteController:**
- POST /api/v1/lote/crear (crear lote)
- GET /api/v1/lote/listar (listar lotes)
- GET /api/v1/lote/{id} (obtener por ID)
- PUT /api/v1/lote/editar (editar lote)
- PUT /api/v1/lote/eliminar (eliminar lote)

**ReciboController:**
- POST /api/v1/recibo/crear (crear recibo)
- GET /api/v1/recibo/listar (listar recibos)
- GET /api/v1/recibo/{id} (obtener por ID)
- PUT /api/v1/recibo/editar (editar recibo)
- PUT /api/v1/recibo/eliminar (eliminar recibo)

### 2. CONTROLADORES DE ANÁLISIS

**PMSController:**
- POST /api/v1/pms/crear
- GET /api/v1/pms/listar
- GET /api/v1/pms/{id}
- PUT /api/v1/pms/editar
- PUT /api/v1/pms/eliminar

**DOSNController:**
- POST /api/v1/DOSN/crear
- GET /api/v1/DOSN/{id}
- PUT /api/v1/DOSN/editar
- PUT /api/v1/DOSN/eliminar

**GerminacionController:**
- POST /api/v1/germinacion/crear
- GET /api/v1/germinacion/{id}
- PUT /api/v1/germinacion/editar
- PUT /api/v1/germinacion/eliminar

**HongoController:**
- POST /api/v1/hongo/crear
- GET /api/v1/hongo/listar
- GET /api/v1/hongo/{id}
- PUT /api/v1/hongo/editar
- PUT /api/v1/hongo/eliminar

**MalezaController:**
- POST /api/v1/maleza/crear
- GET /api/v1/maleza/listar
- GET /api/v1/maleza/{id}
- PUT /api/v1/maleza/editar
- PUT /api/v1/maleza/eliminar

**PurezaController:**
- POST /api/v1/pureza/crear
- GET /api/v1/pureza/listar
- GET /api/v1/pureza/{id}
- PUT /api/v1/pureza/editar
- PUT /api/v1/pureza/eliminar

**PurezaPNotatumController:**
- POST /api/v1/PurezaPNotatum/crear
- GET /api/v1/PurezaPNotatum/{id}
- PUT /api/v1/PurezaPNotatum/editar
- PUT /api/v1/PurezaPNotatum/eliminar

**SanitarioController:**
- POST /api/v1/Sanitario/crear
- GET /api/v1/Sanitario/{id}
- PUT /api/v1/Sanitario/editar
- PUT /api/v1/Sanitario/eliminar

**TetrazolioController:**
- POST /api/v1/Tetrazolio/crear
- GET /api/v1/Tetrazolio/{id}
- PUT /api/v1/Tetrazolio/editar
- PUT /api/v1/Tetrazolio/eliminar

## DATOS DE PRUEBA

### Usuario:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@test.com",
  "password": "password123",
  "rol": "ADMIN"
}
```

### Lote:
```json
{
  "nombre": "Lote Prueba A",
  "descripcion": "Lote de prueba para testing",
  "fechaCreacion": "2024-01-15",
  "usuarioId": 1
}
```

### Recibo:
```json
{
  "numeroRecibo": "REC-001-2024",
  "fechaRecepcion": "2024-01-15",
  "loteId": 1,
  "cantidad": 100.5,
  "observaciones": "Recibo de prueba"
}
```

### Análisis (PMS):
```json
{
  "reciboId": 1,
  "fechaAnalisis": "2024-01-16",
  "resultado": 95.5,
  "observaciones": "Análisis PMS de prueba"
}
```

### Análisis (DOSN):
```json
{
  "reciboId": 1,
  "fechaAnalisis": "2024-01-16",
  "resultado": 98.2,
  "observaciones": "Análisis DOSN de prueba"
}
```

### Análisis (Germinación):
```json
{
  "reciboId": 1,
  "fechaAnalisis": "2024-01-16",
  "porcentajeGerminacion": 92.0,
  "observaciones": "Análisis de germinación de prueba"
}
```

### Análisis (Hongo):
```json
{
  "nombre": "Fusarium",
  "reciboId": 1,
  "fechaAnalisis": "2024-01-16",
  "resultado": "Presente",
  "observaciones": "Análisis de hongos de prueba"
}
```

### Análisis (Maleza):
```json
{
  "nombre": "Amaranthus",
  "reciboId": 1,
  "fechaAnalisis": "2024-01-16",
  "resultado": "Ausente",
  "observaciones": "Análisis de malezas de prueba"
}
```

### Análisis (Pureza):
```json
{
  "reciboId": 1,
  "fechaAnalisis": "2024-01-16",
  "porcentajePureza": 99.1,
  "observaciones": "Análisis de pureza de prueba"
}
```

### Análisis (Sanitario):
```json
{
  "reciboId": 1,
  "fechaAnalisis": "2024-01-16",
  "resultado": "Apto",
  "observaciones": "Análisis sanitario de prueba"
}
```

### Análisis (Tetrazolio):
```json
{
  "reciboId": 1,
  "fechaAnalisis": "2024-01-16",
  "porcentajeViabilidad": 96.5,
  "observaciones": "Análisis de tetrazolio de prueba"
}
```

## CASOS DE PRUEBA CRÍTICOS

1. **Validaciones de seguridad** (endpoints con @Secured)
2. **Validaciones de datos** (nombres sin números, campos obligatorios)
3. **Flujo completo** Usuario->Lote->Recibo->Análisis
4. **Manejo de errores** (404, 400, 500)
5. **Operaciones CRUD** completas para cada entidad