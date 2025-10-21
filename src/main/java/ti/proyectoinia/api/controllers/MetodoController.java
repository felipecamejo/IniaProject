package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoMetodos;
import ti.proyectoinia.dtos.MetodoDto;
import ti.proyectoinia.services.MetodoService;

@RestController
@RequestMapping({"api/v1/metodo"})
public class MetodoController {

    @Generated
    private final MetodoService metodoService;

    public MetodoController(MetodoService metodoService) {
        this.metodoService = metodoService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo Método"
    )
    public ResponseEntity<String> crearMetodo(@RequestBody MetodoDto metodoDto) {
        if (metodoDto.getNombre() != null && !metodoDto.getNombre().trim().isEmpty()) {
            if (metodoDto.getNombre().matches(".*\\d.*")) {
                return new ResponseEntity<>("El nombre del Método no puede contener números", HttpStatus.BAD_REQUEST);
            }
            if (metodoDto.getAutor() == null || metodoDto.getAutor().trim().isEmpty()) {
                return new ResponseEntity<>("El autor del Método es obligatorio", HttpStatus.BAD_REQUEST);
            }
            metodoDto.setId((Long)null);
            String response = this.metodoService.crearMetodo(metodoDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } else {
            return new ResponseEntity<>("El nombre del Método es obligatorio", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<ResponseListadoMetodos> getMetodos() {
        ResponseListadoMetodos response = this.metodoService.listadoMetodos().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getMetodoById(@PathVariable Long id) {
        MetodoDto metodoDto = this.metodoService.obtenerMetodoPorId(id);
        if (metodoDto != null) {
            return new ResponseEntity<>(metodoDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Método no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarMetodo(@RequestBody MetodoDto metodoDto) {
        if (metodoDto.getNombre() != null && !metodoDto.getNombre().trim().isEmpty()) {
            if (metodoDto.getNombre().matches(".*\\d.*")) {
                return new ResponseEntity<>("El nombre del Método no puede contener números", HttpStatus.BAD_REQUEST);
            }
            if (metodoDto.getAutor() == null || metodoDto.getAutor().trim().isEmpty()) {
                return new ResponseEntity<>("El autor del Método es obligatorio", HttpStatus.BAD_REQUEST);
            }
            String result = this.metodoService.editarMetodo(metodoDto);
            return ResponseEntity.ok(result);
        } else {
            return new ResponseEntity<>("El nombre del Método es obligatorio", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un método"
    )
    public ResponseEntity<String> eliminarMetodo(@PathVariable Long id) {
        try {
            String mensaje = this.metodoService.eliminarMetodo(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Método: " + e.getMessage());
        }
    }
}
