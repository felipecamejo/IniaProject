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
}


