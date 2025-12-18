package ti.proyectoinia.api.controllers;

import ti.proyectoinia.business.request.LoginRequest;
import ti.proyectoinia.api.responses.TokenUsuario;
import ti.proyectoinia.business.entities.Usuario;
import ti.proyectoinia.security.SeguridadService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import ti.proyectoinia.business.entities.RolUsuario;
import ti.proyectoinia.dtos.UsuarioDto;
import ti.proyectoinia.services.UsuarioService;

import java.lang.System;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("api/seguridad")
@Tag(name = "Autenticación", description = "Endpoints para autenticación y autorización")
public class SeguridadController {

    private static final Logger logger = LoggerFactory.getLogger(SeguridadController.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Autowired
    private SeguridadService seguridadService;
    
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    @Transactional(readOnly = true)
    @Operation(summary = "Autenticar usuario", description = "Autentica un usuario y retorna un token JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login exitoso"),
            @ApiResponse(responseCode = "400", description = "Credenciales inválidas"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<?> autenticarUsuario(
            @RequestBody LoginRequest login
    ) {
        logger.info("Iniciando proceso de login para email: {}", login.getEmail());
        
        try {
            // Validar que se proporcionen las credenciales
            if (login.getEmail() == null || login.getEmail().trim().isEmpty()) {
                logger.warn("Intento de login sin email");
                return ResponseEntity.badRequest()
                    .body("Error: El email es obligatorio");
            }
            
            if (login.getPassword() == null || login.getPassword().trim().isEmpty()) {
                logger.warn("Intento de login sin contraseña para email: {}", login.getEmail());
                return ResponseEntity.badRequest()
                    .body("Error: La contraseña es obligatoria");
            }
            
            logger.info("Validando credenciales para usuario: {}", login.getEmail());
            
            // Intentar autenticar el usuario
            Usuario objUsuario = seguridadService
                    .autenticarUsuario(login.getEmail(), login.getPassword())
                    .orElse(null);
            
            if (objUsuario == null) {
                logger.warn("Autenticación fallida para usuario: {}", login.getEmail());
                return ResponseEntity.badRequest()
                    .body("Error: Usuario o contraseña incorrectos");
            }
            
            logger.info("Autenticación exitosa para usuario: {} - ID: {}", 
                       objUsuario.getEmail(), objUsuario.getId());
            
            // Generar token JWT
            logger.info("Generando token JWT para usuario: {}", objUsuario.getEmail());
            String token = generarToken(objUsuario);
            
            // Crear respuesta exitosa
            TokenUsuario usuarioResponse = new TokenUsuario(
                objUsuario.getNombre(), 
                objUsuario.getEmail(),
                token, 
                seguridadService.listarRolesPorUsuario(objUsuario)
            );
            
            logger.info("Login exitoso para usuario: {} - Rol: {}", 
                       objUsuario.getEmail(), objUsuario.getRol());
            
            return ResponseEntity.ok(usuarioResponse);
            
        } catch (IllegalStateException e) {
            // Error de configuración JWT
            logger.error("Error de configuración JWT: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error de configuración: " + e.getMessage());
                
        } catch (IllegalArgumentException e) {
            // Error de configuración JWT
            logger.error("Error de configuración JWT: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error de configuración: " + e.getMessage());
                
        } catch (Exception e) {
            // Error inesperado
            logger.error("Error inesperado durante login para usuario: {} - Error: {}", 
                        login.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error interno del servidor: " + e.getMessage());
        }
    }

    private String generarToken(Usuario usuario) {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException(
                "JWT_SECRET is required for JWT security. " +
                "Configure it in application.properties"
            );
        }
        if (jwtSecret.length() < 32) {
            throw new IllegalArgumentException("JWT_SECRET must be at least 32 characters long");
        }
        List<GrantedAuthority> grantedAuthorityList
                = AuthorityUtils.createAuthorityList(
                        seguridadService.listarRolesPorUsuario(usuario)
                );
        String token = Jwts
                .builder()
                .setId("@acchsjwt") // Dinámico desde BD
                .setSubject(usuario.getEmail())
                .claim("authorities",
                        grantedAuthorityList.stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList())
                )
                .setIssuedAt(new Date(java.lang.System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + (1000 * 60 * 60 * 8)))
                .signWith(SignatureAlgorithm.HS512, jwtSecret.getBytes())
                .compact();
        return token;
    }
    
    @PostMapping("/create-test-users")
    @Operation(summary = "Crear usuarios de prueba", description = "Crea 4 usuarios de prueba: 1 ADMIN, 1 ANALISTA, 2 OBSERVADORES")
    public ResponseEntity<String> crearUsuariosPrueba() {
        try {
            StringBuilder resultado = new StringBuilder();
            int usuariosCreados = 0;
            int usuariosExistentes = 0;
            
            // Definir usuarios a crear usando DTOs
            List<UsuarioDto> usuariosParaCrear = List.of(
                crearUsuarioDto("admin@inia.com", "Admin", RolUsuario.ADMIN),
                crearUsuarioDto("analista@inia.com", "Analista", RolUsuario.ANALISTA),
                crearUsuarioDto("observador1@inia.com", "Observador1", RolUsuario.OBSERVADOR),
                crearUsuarioDto("observador2@inia.com", "Observador2", RolUsuario.OBSERVADOR)
            );
            
            // Crear usuarios usando el servicio
            for (UsuarioDto usuarioDto : usuariosParaCrear) {
                try {
                    // Verificar si el usuario ya existe
                    UsuarioDto usuarioExistente = usuarioService.obtenerUsuarioPorEmail(usuarioDto.getEmail());
                    if (usuarioExistente != null) {
                        resultado.append("Usuario ya existe: ").append(usuarioDto.getEmail()).append("\n");
                        usuariosExistentes++;
                    } else {
                        // Crear usuario usando el servicio
                        usuarioService.crearUsuario(usuarioDto);
                        resultado.append("Usuario creado: ").append(usuarioDto.getEmail()).append(" / password123\n");
                        usuariosCreados++;
                    }
                } catch (Exception e) {
                    resultado.append("Error creando usuario ").append(usuarioDto.getEmail()).append(": ").append(e.getMessage()).append("\n");
                }
            }
            
            resultado.append("\nResumen: ").append(usuariosCreados).append(" usuarios creados, ")
                    .append(usuariosExistentes).append(" ya existían");
            
            return ResponseEntity.ok(resultado.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creando usuarios: " + e.getMessage());
        }
    }
    
    @PostMapping("/ensure-admin")
    @Operation(
        summary = "Asegurar usuario admin", 
        description = "Verifica si existe un usuario ADMIN activo. Si no existe, crea automáticamente un usuario admin por defecto (admin@inia.com / password123)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Operación exitosa"),
        @ApiResponse(responseCode = "201", description = "Usuario admin creado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<?> asegurarUsuarioAdmin() {
        try {
            logger.info("Verificando existencia de usuario admin...");
            
            // Verificar si existe al menos un admin activo
            boolean existeAdmin = usuarioService.existeAdminActivo();
            
            if (existeAdmin) {
                logger.info("Ya existe al menos un usuario admin activo en el sistema");
                return ResponseEntity.ok(Map.of(
                    "mensaje", "Ya existe al menos un usuario admin activo en el sistema",
                    "adminExiste", true
                ));
            }
            
            // No existe ningún admin, crear uno por defecto
            logger.warn("No se encontró ningún usuario admin activo. Creando usuario admin por defecto...");
            
            UsuarioDto adminDto = crearUsuarioDto("admin@inia.com", "Renzo", RolUsuario.ADMIN);
            
            try {
                usuarioService.crearUsuario(adminDto);
                logger.info("Usuario admin por defecto creado exitosamente: admin@inia.com");
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensaje", "Usuario admin creado exitosamente",
                    "email", "admin@inia.com",
                    "password", "password123",
                    "adminExiste", true,
                    "creado", true
                ));
            } catch (IllegalArgumentException e) {
                // El usuario ya existe pero puede estar inactivo
                logger.warn("El usuario admin@inia.com ya existe pero puede estar inactivo: {}", e.getMessage());
                return ResponseEntity.ok(Map.of(
                    "mensaje", "El usuario admin@inia.com ya existe en el sistema",
                    "adminExiste", true,
                    "creado", false
                ));
            }
            
        } catch (Exception e) {
            logger.error("Error al asegurar usuario admin: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Error al asegurar usuario admin: " + e.getMessage(),
                    "adminExiste", false
                ));
        }
    }
    
    private UsuarioDto crearUsuarioDto(String email, String nombre, RolUsuario rol) {
        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setEmail(email);
        usuarioDto.setNombre(nombre);
        // Para el admin por defecto, usar password123; para otros usuarios usar password123 también
        usuarioDto.setPassword("password123"); // El servicio se encargará de encriptarla
        // Asignar un teléfono de demostración
        // Formato simple; ajusta a tu regla de negocio si aplica
        String telefonoDemo = switch (rol) {
            case ADMIN -> "+598-099-000-001";
            case ANALISTA -> "+598-099-000-002";
            case OBSERVADOR -> "+598-099-000-003";
        };
        usuarioDto.setTelefono(telefonoDemo);
        usuarioDto.setActivo(true);
        usuarioDto.setRol(rol);
        usuarioDto.setLotesId(null); // Sin lotes asignados inicialmente
        return usuarioDto;
    }
}
