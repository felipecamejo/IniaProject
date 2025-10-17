# Documentación de Implementación JWT - Proyecto Java 2025 Backend

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura JWT](#arquitectura-jwt)
3. [Clases y Componentes](#clases-y-componentes)
4. [Flujo de Autenticación](#flujo-de-autenticación)
5. [Configuración de Seguridad](#configuración-de-seguridad)
6. [Uso Práctico](#uso-práctico)
7. [Ejemplos de Implementación](#ejemplos-de-implementación)
8. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

## Introducción

Este proyecto implementa un sistema de autenticación basado en **JSON Web Tokens (JWT)** utilizando Spring Security. El JWT permite la autenticación stateless, donde el servidor no necesita mantener sesiones activas, sino que valida cada request mediante un token firmado.

### Características principales:
- Autenticación stateless con JWT
- Autorización basada en roles (USER, ADMIN)
- Filtros de seguridad personalizados
- Configuración CORS para frontend
- Encriptación de contraseñas con BCrypt

## Arquitectura JWT

### Componentes principales:

```mermaid
graph TD
    A[Cliente] -->|1. Login Request| B[SeguridadController]
    B -->|2. Validar credenciales| C[SeguridadService]
    C -->|3. Generar JWT| D[Token JWT]
    D -->|4. Response con Token| A
    A -->|5. Request con Token| E[FiltroJWTAutorizacion]
    E -->|6. Validar Token| F[Spring Security Context]
    F -->|7. Autorizar Request| G[Controller Endpoint]
```

## Clases y Componentes

### 1. SeguridadController
**Ubicación:** `src/main/java/com/Tisj/api/controllers/SeguridadController.java`

**Propósito:** Maneja el endpoint de login y la generación de tokens JWT.

#### Métodos:

##### `autenticarUsuario(LoginRequest login)`
- **Tipo:** `@PostMapping("/login")`
- **Parámetros:** 
  - `LoginRequest login`: Objeto que contiene email y password
- **Retorna:** `ResponseEntity<TokenUsuario>`
- **Funcionalidad:** 
  - Autentica al usuario usando SeguridadService
  - Genera un token JWT si las credenciales son válidas
  - Retorna información del usuario con el token

##### `generarToken(Usuario usuario)`
- **Tipo:** Método privado
- **Parámetros:**
  - `Usuario usuario`: Objeto usuario autenticado
- **Retorna:** `String` (token JWT)
- **Funcionalidad:**
  - Crea un token JWT con información del usuario
  - Incluye roles y permisos
  - Establece expiración de 8 horas
  - Firma con clave secreta del entorno

#### Estructura del Token JWT:
```json
{
  "jti": "@acchsjwt",
  "sub": "usuario@email.com",
  "authorities": ["USER", "ADMIN"],
  "iat": 1640995200,
  "exp": 1641024000
}
```

### 2. FiltroJWTAutorizacion
**Ubicación:** `src/main/java/com/Tisj/security/FiltroJWTAutorizacion.java`

**Propósito:** Filtro que intercepta todas las requests para validar tokens JWT.

#### Métodos:

##### `doFilterInternal(HttpServletRequest, HttpServletResponse, FilterChain)`
- **Tipo:** Override de OncePerRequestFilter
- **Parámetros:**
  - `HttpServletRequest request`: Request HTTP
  - `HttpServletResponse response`: Response HTTP
  - `FilterChain filterChain`: Cadena de filtros
- **Funcionalidad:**
  - Verifica si la ruta es pública
  - Valida el token JWT en requests protegidas
  - Establece el contexto de seguridad de Spring
  - Maneja excepciones de JWT

##### `esRutaPublica(HttpServletRequest request)`
- **Tipo:** Método privado
- **Parámetros:**
  - `HttpServletRequest request`: Request HTTP
- **Retorna:** `boolean`
- **Funcionalidad:** Verifica si la ruta no requiere autenticación

**Rutas públicas definidas:**
```java
private static final List<String> rutasPublicas = List.of(
    "/api/usuarios",
    "/api/login", 
    "/api/mercado-pago/webhook",
    "/api/articulos"
);
```

##### `validarToken(HttpServletRequest request)`
- **Tipo:** Método privado
- **Parámetros:**
  - `HttpServletRequest request`: Request HTTP
- **Retorna:** `Claims` (claims del JWT)
- **Funcionalidad:**
  - Extrae el token del header Authorization
  - Valida la firma del token
  - Retorna los claims (datos) del token

##### `crearAutenticacion(Claims claims)`
- **Tipo:** Método privado
- **Parámetros:**
  - `Claims claims`: Claims del JWT validado
- **Funcionalidad:**
  - Crea un objeto de autenticación de Spring Security
  - Establece los roles del usuario
  - Configura el contexto de seguridad

##### `varlidarUsoDeToken(HttpServletRequest, HttpServletResponse)`
- **Tipo:** Método privado
- **Parámetros:**
  - `HttpServletRequest request`: Request HTTP
  - `HttpServletResponse response`: Response HTTP
- **Retorna:** `boolean`
- **Funcionalidad:** Verifica que el header Authorization contenga un token Bearer válido

### 3. SeguridadService
**Ubicación:** `src/main/java/com/Tisj/security/SeguridadService.java`

**Propósito:** Servicio que maneja la lógica de autenticación y autorización.

#### Métodos:

##### `autenticarUsuario(String email, String password)`
- **Tipo:** Método público
- **Parámetros:**
  - `String email`: Email del usuario
  - `String password`: Contraseña en texto plano
- **Retorna:** `Optional<Usuario>`
- **Funcionalidad:**
  - Busca el usuario por email
  - Verifica que el usuario esté activo
  - Compara la contraseña usando BCrypt
  - Retorna el usuario si las credenciales son válidas

##### `listarRolesPorUsuario(Usuario usuario)`
- **Tipo:** Método público
- **Parámetros:**
  - `Usuario usuario`: Objeto usuario
- **Retorna:** `String[]` (array de roles)
- **Funcionalidad:** Extrae los roles del usuario para incluirlos en el JWT

### 4. WebSecurityConfig
**Ubicación:** `src/main/java/com/Tisj/security/WebSecurityConfig.java`

**Propósito:** Configuración principal de Spring Security.

#### Beans principales:

##### `passwordEncoder()`
- **Tipo:** `@Bean`
- **Retorna:** `PasswordEncoder`
- **Funcionalidad:** Configura BCrypt como encoder de contraseñas

##### `filterChain(HttpSecurity http)`
- **Tipo:** `@Bean`
- **Parámetros:**
  - `HttpSecurity http`: Configuración de seguridad HTTP
- **Retorna:** `SecurityFilterChain`
- **Funcionalidad:**
  - Deshabilita CSRF
  - Configura CORS
  - Añade el filtro JWT personalizado
  - Define reglas de autorización por rutas

#### Reglas de autorización:
```java
// Rutas públicas
.requestMatchers(antMatcher("/api/seguridad/**")).permitAll()
.requestMatchers(antMatcher(HttpMethod.POST, "/api/usuarios")).permitAll()

// Rutas que requieren roles específicos
.requestMatchers(antMatcher("/api/usuarios/**")).hasAnyAuthority("USER", "ADMIN")
.requestMatchers(antMatcher("/api/articulos_cliente/**")).hasAuthority("ADMIN")
```

### 5. Clases de Request/Response

#### LoginRequest
**Ubicación:** `src/main/java/com/Tisj/api/requests/LoginRequest.java`

```java
@Getter
public class LoginRequest {
    private String email;
    private String password;
}
```

#### TokenUsuario
**Ubicación:** `src/main/java/com/Tisj/api/response/TokenUsuario.java`

```java
@AllArgsConstructor
@Getter
public class TokenUsuario {
    private String nombre, email, token;
    private String[] roles;
}
```

## Flujo de Autenticación

### 1. Proceso de Login

```mermaid
sequenceDiagram
    participant C as Cliente
    participant SC as SeguridadController
    participant SS as SeguridadService
    participant UR as UsuarioRepository
    participant PE as PasswordEncoder

    C->>SC: POST /api/seguridad/login
    Note over C,SC: {email, password}
    
    SC->>SS: autenticarUsuario(email, password)
    SS->>UR: findByEmail(email)
    UR-->>SS: Optional<Usuario>
    
    alt Usuario encontrado y activo
        SS->>PE: matches(password, hashedPassword)
        PE-->>SS: boolean
        alt Contraseña válida
            SS-->>SC: Optional<Usuario>
            SC->>SC: generarToken(usuario)
            SC-->>C: TokenUsuario{nombre, email, token, roles}
        else Contraseña inválida
            SS-->>SC: Optional.empty()
            SC-->>C: 401 Unauthorized
        end
    else Usuario no encontrado o inactivo
        SS-->>SC: Optional.empty()
        SC-->>C: 401 Unauthorized
    end
```

### 2. Proceso de Validación de Token

```mermaid
sequenceDiagram
    participant C as Cliente
    participant FJ as FiltroJWTAutorizacion
    participant SC as SecurityContext
    participant EP as Endpoint

    C->>FJ: Request con Authorization: Bearer <token>
    
    alt Ruta pública
        FJ->>EP: Continuar sin validación
    else Ruta protegida
        FJ->>FJ: varlidarUsoDeToken()
        alt Token presente y formato correcto
            FJ->>FJ: validarToken()
            alt Token válido
                FJ->>FJ: crearAutenticacion()
                FJ->>SC: setAuthentication()
                FJ->>EP: Continuar con autenticación
            else Token inválido
                FJ-->>C: 403 Forbidden
            end
        else Token ausente o formato incorrecto
            FJ->>SC: clearContext()
            FJ-->>C: 403 Forbidden
        end
    end
```

## Configuración de Seguridad

### Variables de Entorno Requeridas

```bash
# Clave secreta para firmar JWT (debe ser segura y única)
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
```

### Dependencias Maven

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-config</artifactId>
</dependency>
```

## Uso Práctico

### 1. Login de Usuario

**Endpoint:** `POST /api/seguridad/login`

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
    "roles": ["USER"]
}
```

**Response de error:**
```json
{
    "timestamp": "2024-01-01T12:00:00.000+00:00",
    "status": 401,
    "error": "Unauthorized",
    "message": "Usuario o password incorrecto."
}
```

### 2. Uso del Token en Requests

**Header requerido:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJAYWNjaHNqd3QiLCJzdWIiOiJ1c3VhcmlvQGVqZW1wbG8uY29tIiwiYXV0aG9yaXRpZXMiOlsiVVNFUiJdLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTY0MTAyNDAwMH0.signature
```

**Ejemplo con cURL:**
```bash
curl -X GET "http://localhost:8080/api/usuarios/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

**Ejemplo con JavaScript (fetch):**
```javascript
const token = localStorage.getItem('jwt_token');

fetch('/api/usuarios/me', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

### 3. Manejo de Errores

**Token expirado (403 Forbidden):**
```json
{
    "timestamp": "2024-01-01T12:00:00.000+00:00",
    "status": 403,
    "error": "Forbidden",
    "message": "JWT expired at 2024-01-01T12:00:00.000Z"
}
```

**Token inválido (403 Forbidden):**
```json
{
    "timestamp": "2024-01-01T12:00:00.000+00:00",
    "status": 403,
    "error": "Forbidden",
    "message": "JWT signature does not match locally computed signature"
}
```

**Sin token (403 Forbidden):**
```json
{
    "timestamp": "2024-01-01T12:00:00.000+00:00",
    "status": 403,
    "error": "Forbidden",
    "message": "Access Denied"
}
```

## Ejemplos de Implementación

### Frontend - Almacenamiento y Uso del Token

```javascript
class AuthService {
    static login(email, password) {
        return fetch('/api/seguridad/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Credenciales inválidas');
        })
        .then(data => {
            // Almacenar token en localStorage
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('user_data', JSON.stringify({
                nombre: data.nombre,
                email: data.email,
                roles: data.roles
            }));
            return data;
        });
    }

    static logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
    }

    static getToken() {
        return localStorage.getItem('jwt_token');
    }

    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            // Decodificar token para verificar expiración
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch (e) {
            return false;
        }
    }

    static getAuthHeaders() {
        const token = this.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
}
```

### Interceptor HTTP (Axios)

```javascript
import axios from 'axios';

// Interceptor para añadir token automáticamente
axios.interceptors.request.use(
    config => {
        const token = AuthService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Interceptor para manejar respuestas de error
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 403) {
            // Token expirado o inválido
            AuthService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

### React Hook para Autenticación

```javascript
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = AuthService.getToken();
        const userData = localStorage.getItem('user_data');
        
        if (token && AuthService.isAuthenticated() && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await AuthService.login(email, password);
            setUser({
                nombre: data.nombre,
                email: data.email,
                roles: data.roles
            });
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole: (role) => user?.roles?.includes(role)
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};
```

## Consideraciones de Seguridad

### 1. Configuración de la Clave Secreta

**❌ Incorrecto:**
```java
private final String CLAVE = "mi_clave_simple";
```

**✅ Correcto:**
```java
private final String CLAVE = System.getenv("SECRET_KEY");
```

**Generar clave segura:**
```bash
# Generar clave de 256 bits (32 bytes)
openssl rand -base64 32
```

### 2. Tiempo de Expiración

**Configuración actual:** 8 horas
```java
.setExpiration(new Date(System.currentTimeMillis() + (1000 * 60 * 60 * 8)))
```

**Recomendaciones:**
- Tokens de acceso: 15-30 minutos
- Tokens de refresh: 7-30 días
- Implementar refresh tokens para mejor seguridad

### 3. Almacenamiento en Frontend

**Opciones de almacenamiento:**
- `localStorage`: Persiste entre sesiones, vulnerable a XSS
- `sessionStorage`: Se borra al cerrar navegador, vulnerable a XSS
- `httpOnly cookies`: Más seguro, no accesible desde JavaScript

**Implementación con cookies:**
```java
// En el backend, configurar cookie httpOnly
Cookie cookie = new Cookie("jwt_token", token);
cookie.setHttpOnly(true);
cookie.setSecure(true); // Solo HTTPS
cookie.setPath("/");
cookie.setMaxAge(8 * 60 * 60); // 8 horas
response.addCookie(cookie);
```

### 4. Validación de Roles

**En controladores:**
```java
@PreAuthorize("hasAuthority('ADMIN')")
@GetMapping("/admin-only")
public ResponseEntity<?> adminEndpoint() {
    // Solo usuarios con rol ADMIN pueden acceder
}

@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
@GetMapping("/user-or-admin")
public ResponseEntity<?> userOrAdminEndpoint() {
    // Usuarios con rol USER o ADMIN pueden acceder
}
```

### 5. Logging y Monitoreo

**Añadir logging de seguridad:**
```java
private static final Logger logger = LoggerFactory.getLogger(FiltroJWTAutorizacion.class);

@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) {
    try {
        // ... código existente ...
        logger.info("Usuario autenticado: {} para ruta: {}", 
                   SecurityContextHolder.getContext().getAuthentication().getName(),
                   request.getRequestURI());
    } catch (Exception ex) {
        logger.warn("Error de autenticación para ruta: {} - Error: {}", 
                   request.getRequestURI(), ex.getMessage());
        // ... manejo de error ...
    }
}
```

### 6. Rate Limiting

**Implementar límites de intentos de login:**
```java
@Component
public class LoginAttemptService {
    private final Map<String, Integer> attempts = new ConcurrentHashMap<>();
    private final int MAX_ATTEMPTS = 5;
    private final long LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

    public boolean isBlocked(String ip) {
        Integer attempts = this.attempts.get(ip);
        return attempts != null && attempts >= MAX_ATTEMPTS;
    }

    public void loginSucceeded(String ip) {
        attempts.remove(ip);
    }

    public void loginFailed(String ip) {
        attempts.merge(ip, 1, Integer::sum);
    }
}
```

## Conclusión

Esta implementación de JWT proporciona una base sólida para la autenticación y autorización en aplicaciones Spring Boot. Las características principales incluyen:

- **Autenticación stateless** con tokens JWT
- **Autorización basada en roles** flexible
- **Filtros de seguridad** personalizados
- **Configuración CORS** para frontend
- **Encriptación de contraseñas** con BCrypt

Para mejorar la seguridad, se recomienda:
1. Implementar refresh tokens
2. Usar cookies httpOnly para almacenar tokens
3. Añadir rate limiting
4. Implementar logging de seguridad
5. Configurar HTTPS en producción
6. Rotar claves secretas periódicamente

Esta documentación proporciona una guía completa para entender, usar y mantener el sistema de autenticación JWT en el proyecto.
