# Guía de Pruebas JWT en Swagger - Proyecto INIA

## Configuración de Swagger

### Acceso a Swagger UI
Una vez que inicies la aplicación, puedes acceder a Swagger UI en:
```
http://localhost:8080/Inia/swagger-ui/index.html
```

## Pasos para Probar Autenticación JWT

### 1. Obtener Token JWT

1. **Abre Swagger UI** en tu navegador
2. **Busca la sección "Seguridad"** en la documentación
3. **Expande el endpoint** `POST /api/seguridad/login`
4. **Haz clic en "Try it out"**
5. **Ingresa las credenciales** en el formato JSON:

```json
{
    "email": "tu_email@ejemplo.com",
    "password": "tu_contraseña"
}
```

6. **Haz clic en "Execute"**
7. **Copia el token** de la respuesta (campo `token`)

### 2. Configurar Autenticación en Swagger

1. **Haz clic en el botón "Authorize"** (🔒) en la parte superior derecha de Swagger UI
2. **En el campo "bearerAuth"**, ingresa tu token JWT
3. **Formato**: `Bearer tu_token_aqui` (incluye la palabra "Bearer" seguida de un espacio)
4. **Haz clic en "Authorize"**
5. **Cierra el modal** haciendo clic en "Close"

### 3. Probar Endpoints Protegidos

Ahora puedes probar cualquier endpoint que requiera autenticación:

#### Endpoint de Prueba: `/api/v1/usuario/me`
1. **Busca la sección "Usuario"**
2. **Expande** `GET /api/v1/usuario/me`
3. **Haz clic en "Try it out"**
4. **Haz clic en "Execute"**
5. **Deberías recibir**: `"Usuario autenticado correctamente con JWT"`

#### Endpoint de Lista: `/api/v1/usuario/listar`
1. **Expande** `GET /api/v1/usuario/listar`
2. **Haz clic en "Try it out"**
3. **Haz clic en "Execute"**
4. **Deberías recibir**: La lista de usuarios en formato JSON

## Ejemplos de Respuestas

### Login Exitoso (200)
```json
{
    "nombre": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJAYWNjaHNqd3QiLCJzdWIiOiJ1c3VhcmlvQGVqZW1wbG8uY29tIiwiYXV0aG9yaXRpZXMiOlsiQURNSU4iXSwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDEwMjQwMDB9.signature",
    "roles": ["ADMIN"]
}
```

### Error de Autenticación (401)
```json
{
    "timestamp": "2024-01-01T12:00:00.000+00:00",
    "status": 401,
    "error": "Unauthorized",
    "message": "Usuario o password incorrecto."
}
```

### Error de Autorización (403)
```json
{
    "timestamp": "2024-01-01T12:00:00.000+00:00",
    "status": 403,
    "error": "Forbidden",
    "message": "Access Denied"
}
```

## Solución de Problemas

### Error: "Unauthorized" al hacer login
- Verifica que el usuario exista en la base de datos
- Verifica que la contraseña sea correcta
- Verifica que el usuario esté activo (`activo = true`)

### Error: "Forbidden" en endpoints protegidos
- Verifica que hayas configurado la autenticación en Swagger
- Verifica que el token no haya expirado (8 horas)
- Verifica que el formato del token sea correcto: `Bearer tu_token`

### Error: "JWT expired"
- El token ha expirado, necesitas hacer un nuevo login
- Los tokens JWT tienen una duración de 8 horas

### Error: "JWT signature does not match"
- El token es inválido o ha sido modificado
- Haz un nuevo login para obtener un token válido

## Endpoints Disponibles para Pruebas

### Públicos (no requieren token):
- `POST /api/seguridad/login` - Login de usuario

### Protegidos (requieren token):
- `GET /api/v1/usuario/me` - Verificar autenticación
- `GET /api/v1/usuario/listar` - Listar usuarios
- `POST /api/v1/usuario/crear` - Crear usuario (requiere rol ADMIN)
- `PUT /api/v1/usuario/editar` - Editar usuario (requiere rol ADMIN)
- `DELETE /api/v1/usuario/eliminar/{id}` - Eliminar usuario

## Roles y Permisos

- **ADMIN**: Acceso completo a todos los endpoints
- **ANALISTA**: Acceso a análisis y reportes
- **OBSERVADOR**: Solo lectura

## Notas Importantes

1. **Duración del Token**: Los tokens JWT expiran en 8 horas
2. **Formato del Token**: Siempre incluye "Bearer " antes del token
3. **Context Path**: Todas las rutas incluyen `/Inia` como contexto
4. **Base URL**: `http://localhost:8080/Inia`

## Comandos cURL para Pruebas Externas

### Login
```bash
curl -X POST "http://localhost:8080/Inia/api/seguridad/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu_email@ejemplo.com",
    "password": "tu_contraseña"
  }'
```

### Endpoint Protegido
```bash
curl -X GET "http://localhost:8080/Inia/api/v1/usuario/me" \
  -H "Authorization: Bearer tu_token_aqui"
```
