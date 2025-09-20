package ti.proyectoinia.api.controllers;

import ti.proyectoinia.business.request.LoginRequest;
import ti.proyectoinia.api.responses.TokenUsuario;
import ti.proyectoinia.business.entities.Usuario;
import ti.proyectoinia.security.SeguridadService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
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
import ti.proyectoinia.business.repositories.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.System;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/seguridad")
@Tag(name = "Autenticación", description = "Endpoints para autenticación y autorización")
public class SeguridadController {

    @Autowired
    private SeguridadService seguridadService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    @Transactional(readOnly = true)
    @Operation(summary = "Autenticar usuario", description = "Autentica un usuario y retorna un token JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login exitoso"),
            @ApiResponse(responseCode = "400", description = "Credenciales inválidas")
    })
    public ResponseEntity<TokenUsuario> autenticarUsuario(
            @RequestBody LoginRequest login
    ) {
        Usuario objUsuario = seguridadService
                .autenticarUsuario(login.getEmail(), login.getPassword())
                .orElseThrow(() -> new RuntimeException("Usuario o password incorrecto."));
        String token = generarToken(objUsuario);
        TokenUsuario usuarioResponse
                = new TokenUsuario(objUsuario.getNombre(), objUsuario.getEmail(),
                        token, seguridadService.listarRolesPorUsuario(objUsuario));
        return new ResponseEntity<>(usuarioResponse, HttpStatus.OK);
    }

    private String generarToken(Usuario usuario) {
        String clave = System.getenv("SECRET_KEY") != null ? 
                System.getenv("SECRET_KEY") : "miClaveSecretaSuperSeguraParaJWT2024IniaProject";
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
                .signWith(SignatureAlgorithm.HS512, clave.getBytes())
                .compact();
        return token;
    }
    
    @PostMapping("/create-test-user")
    @Operation(summary = "Crear usuario de prueba", description = "Crea un usuario de prueba para testing")
    public ResponseEntity<String> crearUsuarioPrueba() {
        try {
            // Verificar si ya existe
            if (usuarioRepository.findByEmail("admin@inia.com").isPresent()) {
                return ResponseEntity.ok("Usuario de prueba ya existe: admin@inia.com / password123");
            }
            
            Usuario usuario = new Usuario();
            usuario.setEmail("admin@inia.com");
            usuario.setNombre("Administrador");
            usuario.setPassword(passwordEncoder.encode("password123"));
            usuario.setActivo(true);
            usuario.setRol(RolUsuario.ADMIN);
            
            usuarioRepository.save(usuario);
            
            return ResponseEntity.ok("Usuario de prueba creado: admin@inia.com / password123");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creando usuario: " + e.getMessage());
        }
    }
}
