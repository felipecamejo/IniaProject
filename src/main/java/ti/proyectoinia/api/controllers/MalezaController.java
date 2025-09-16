package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import ti.proyectoinia.api.responses.ResponseListadoMalezas;
import ti.proyectoinia.dtos.MalezaDto;
import ti.proyectoinia.services.MalezaService;

@RestController
@RequestMapping({"api/v1/maleza"})
public class MalezaController {

    @Generated
    private final MalezaService MalezaService;

    public MalezaController(MalezaService MalezaService) {
        this.MalezaService = MalezaService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo MalezaS"
    )
    public ResponseEntity<String> crearMaleza(@RequestBody MalezaDto malezaDto) {
        if (malezaDto.getNombre() != null && !malezaDto.getNombre().trim().isEmpty()) {
            if (malezaDto.getNombre().matches(".*\\d.*")) {
                return new ResponseEntity<>("El nombre de la Maleza no puede contener números", HttpStatus.BAD_REQUEST);
            }
            malezaDto.setId((Long)null);
            String response = this.MalezaService.crearMaleza(malezaDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } else {
            return new ResponseEntity<>("El nombre de la Maleza es obligatorio", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping({"/listar"})
    public ResponseEntity<ResponseListadoMalezas> getMaleza() {
        ResponseListadoMalezas response = this.MalezaService.listadoMalezas().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getMalezasById(@PathVariable Long id) {
        MalezaDto malezaDto = this.MalezaService.obtenerMalezaPorId(id);
        if (malezaDto != null) {
            return new ResponseEntity<>(malezaDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Maleza no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarMaleza(@RequestBody MalezaDto malezaDto) {
        if (malezaDto.getNombre() != null && !malezaDto.getNombre().trim().isEmpty()) {
            if (malezaDto.getNombre().matches(".*\\d.*")) {
                return new ResponseEntity<>("El nombre del cliente no puede contener números", HttpStatus.BAD_REQUEST);
            }
            String result = this.MalezaService.editarMaleza(malezaDto);
            return ResponseEntity.ok(result);
        } else {
            return new ResponseEntity<>("El nombre del MalezaS es obligatorio", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping({"/eliminar"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un malezaS"
    )
    public ResponseEntity<String> eliminarMaleza(@RequestBody Long id) {
        try {
            String mensaje = this.MalezaService.eliminarMaleza(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la Maleza: " + e.getMessage());
        }
    }
}
