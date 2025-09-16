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
    public ResponseEntity<String> crearUsuario(@RequestBody UsuarioDto usuarioDto) {
        if (usuarioDto.getEmail() == null || usuarioDto.getEmail().trim().isEmpty()) {
            return new ResponseEntity<>("El email del Usuario es obligatorio", HttpStatus.BAD_REQUEST);
        }
        usuarioDto.setId((Long) null);
        String response = this.usuarioService.crearUsuario(usuarioDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/listar"})
    public ResponseEntity<ResponseListadoUsuarios> getUsuarios() {
        ResponseListadoUsuarios response = this.usuarioService.listadoUsuarios().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getUsuarioById(@PathVariable Long id) {
        UsuarioDto usuarioDto = this.usuarioService.obtenerUsuarioPorId(id);
        if (usuarioDto != null) {
            return new ResponseEntity<>(usuarioDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarUsuario(@RequestBody UsuarioDto usuarioDto) {
        String result = this.usuarioService.editarUsuario(usuarioDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un usuario"
    )
    public ResponseEntity<String> eliminarUsuario(@RequestBody Long id) {
        try {
            String mensaje = this.usuarioService.eliminarUsuario(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Usuario: " + e.getMessage());
        }
    }
}


