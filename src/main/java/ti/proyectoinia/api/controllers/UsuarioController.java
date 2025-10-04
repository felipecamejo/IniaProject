package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoUsuarios;
import ti.proyectoinia.dtos.UsuarioDto;
import ti.proyectoinia.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"api/v1/usuario"})
public class UsuarioController {

    @Generated
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo Usuario"
    )
    public ResponseEntity<?> crearUsuario(@Valid @RequestBody UsuarioDto usuarioDto) {
        usuarioDto.setId(null); // ID será generado automáticamente
        String mensaje = this.usuarioService.crearUsuario(usuarioDto);
        return new ResponseEntity<>(mensaje, HttpStatus.CREATED);
    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN"})
    public ResponseEntity<ResponseListadoUsuarios> getUsuarios() {
        return this.usuarioService.listadoUsuarios();
    }

    @GetMapping({"/obtener/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion obtiene un usuario por ID"
    )
    public ResponseEntity<UsuarioDto> obtenerUsuarioPorId(@PathVariable Long id) {
        UsuarioDto usuario = this.usuarioService.obtenerUsuarioPorId(id);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuario);
    }

    
    @Secured({"ADMIN"})
    @PutMapping({"/editar"})
    @Operation(
            description = "Esta Funcion edita un Usuario existente"
    )
    public ResponseEntity<String> editarUsuario(@Valid @RequestBody UsuarioDto usuarioDto) {
        String result = this.usuarioService.editarUsuario(usuarioDto);
        return ResponseEntity.ok(result);
    }

    @Secured({"ADMIN"})
    @DeleteMapping({"/eliminar/{id}"})
    @Operation(
            description = "Esta Funcion elimina un usuario"
    )
    public ResponseEntity<String> eliminarUsuario(@PathVariable Long id) {
        try {
            String mensaje = this.usuarioService.eliminarUsuario(id) + ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Usuario: " + e.getMessage());
        }
    }

    @GetMapping({"/perfil/{email}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(
            description = "Esta Funcion obtiene el perfil del usuario por email"
    )
    public ResponseEntity<UsuarioDto> obtenerPerfilUsuario(@PathVariable String email) {
        UsuarioDto usuario = this.usuarioService.obtenerUsuarioPorEmail(email);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuario);
    }

    @GetMapping({"/perfil/actual"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(
            description = "Esta Funcion obtiene el perfil del usuario autenticado actual"
    )
    public ResponseEntity<UsuarioDto> obtenerPerfilUsuarioActual(@RequestHeader("Authorization") String token) {
        try {
            // Extraer email del token JWT
            String email = this.usuarioService.extraerEmailDelToken(token);
            if (email == null) {
                return ResponseEntity.badRequest().build();
            }
            
            UsuarioDto usuario = this.usuarioService.obtenerUsuarioPorEmail(email);
            if (usuario == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping({"/perfil/actualizar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(
            description = "Esta Funcion actualiza el perfil del usuario (sin contraseña)"
    )
    public ResponseEntity<String> actualizarPerfilUsuario(@Valid @RequestBody UsuarioDto usuarioDto) {
        // No permitir cambiar la contraseña desde este endpoint
        usuarioDto.setPassword(null);
        String result = this.usuarioService.editarUsuario(usuarioDto);
        return ResponseEntity.ok(result);
    }
}


