package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
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
        if (malezaDto.getNombre() == null || malezaDto.getNombre().trim().isEmpty() || malezaDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre del cultivo es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        if (malezaDto.getId() != null && MalezaService.obtenerMalezaPorId(malezaDto.getId()) != null) {
            return new ResponseEntity<>("Ya existe", HttpStatus.CONFLICT);
        }

        malezaDto.setId((Long)null);
        String response = this.MalezaService.crearMaleza(malezaDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<ResponseListadoMalezas> getMaleza() {
        ResponseListadoMalezas response = this.MalezaService.listadoMalezas().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
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
        if (malezaDto.getId() == null || malezaDto.getNombre() == null || malezaDto.getNombre().trim().isEmpty() || malezaDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        String result = this.MalezaService.editarMaleza(malezaDto);
        return ResponseEntity.ok(result);

    }

    @DeleteMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un malezaS"
    )
    public ResponseEntity<String> eliminarMaleza(@PathVariable Long id) {
        try {
            String mensaje = this.MalezaService.eliminarMaleza(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        }
        catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Maleza no encontrada: " + e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la Maleza: " + e.getMessage());
        }
    }
}
