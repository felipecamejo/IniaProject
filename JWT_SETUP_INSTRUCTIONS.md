# Instrucciones de Configuración JWT - Proyecto Inia

## Configuración Inicial

### 1. Configuración JWT

La configuración JWT ya está incluida en tu archivo `application.properties`:

```properties
# Configuración JWT
jwt.secret=miClaveSecretaSuperSeguraParaJWT2024IniaProject
jwt.expiration=3600000
```

**¡No necesitas configurar nada adicional!** El sistema JWT está listo para usar con la configuración existente.

### 2. Generar Clave Secreta Segura

Para generar una clave segura, usa uno de estos comandos:

```bash
# Usando OpenSSL
openssl rand -base64 32

# Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Usando Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Uso del JWT

### 1. Login de Usuario

**Endpoint:** `POST /Inia/api/seguridad/login`

**Request:**
```json
{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
}
```

**Response exitoso:**
```json
{
    "nombre": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJAYWNjaHNqd3QiLCJzdWIiOiJ1c3VhcmlvQGVqZW1wbG8uY29tIiwiYXV0aG9yaXRpZXMiOlsiVVNFUiJdLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTY0MTAyNDAwMH0.signature",
    "roles": ["ADMIN"]
}
```

### 2. Usar Token en Requests

**Header requerido:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Ejemplo con cURL:**
```bash
curl -X GET "http://localhost:8080/Inia/api/v1/usuario/me" \
  -H "Authorization: Bearer tu_token_aqui"
```

### 3. Endpoints de Prueba

- `GET /Inia/api/v1/usuario/me` - Verificar autenticación (requiere token)
- `GET /Inia/api/v1/usuario/listar` - Listar usuarios (requiere token)
- `POST /Inia/api/v1/usuario/crear` - Crear usuario (requiere rol ADMIN)

## Roles Disponibles

- `ADMIN` - Acceso completo
- `ANALISTA` - Acceso a análisis y reportes
- `OBSERVADOR` - Solo lectura

## Configuración de Seguridad

### Rutas Públicas (no requieren token):
- `/Inia/api/seguridad/login` - Login
- `/Inia/api/v1/usuarios` (POST) - Registro de usuarios
- `/Inia/v3/api-docs/**` - Documentación Swagger
- `/Inia/swagger-ui/**` - UI de Swagger

### Rutas Protegidas:
- `/Inia/api/v1/usuarios/**` - Requiere cualquier rol
- `/Inia/api/v1/pms/**` - Requiere ADMIN o ANALISTA
- `/Inia/api/v1/lotes/**` - Requiere cualquier rol

## Solución de Problemas

### Error: "JWT secret not found"
- Verifica que la propiedad `jwt.secret` esté configurada en `application.properties`

### Error: "JWT expired"
- El token ha expirado (8 horas por defecto)
- Realiza un nuevo login

### Error: "Access Denied"
- Verifica que el token esté en el header Authorization
- Verifica que el token sea válido
- Verifica que el usuario tenga los permisos necesarios

## Desarrollo

Para desarrollo local, puedes usar esta clave de ejemplo (NO usar en producción):
```
SECRET_KEY=clave_de_desarrollo_no_usar_en_produccion_123456789
```

## Producción

En producción:
1. Usa una clave secreta fuerte y única
2. Configura HTTPS
3. Considera implementar refresh tokens
4. Monitorea los logs de autenticación
