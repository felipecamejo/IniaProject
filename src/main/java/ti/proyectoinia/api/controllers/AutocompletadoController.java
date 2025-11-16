package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoAutocompletados;
import ti.proyectoinia.dtos.AutocompletadoDto;
import ti.proyectoinia.services.AutocompletadoService;

import java.util.List;

@RestController
@RequestMapping({"api/v1/autocompletado"})
public class AutocompletadoController {

    @Generated
    private final AutocompletadoService autocompletadoService;

    public AutocompletadoController(AutocompletadoService autocompletadoService) {
        this.autocompletadoService = autocompletadoService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo Autocompletado"
    )
    public ResponseEntity<String> crearAutocompletado(@RequestBody AutocompletadoDto autocompletadoDto) {
        if (autocompletadoDto.getParametro() != null && !autocompletadoDto.getParametro().trim().isEmpty()) {
            autocompletadoDto.setId((Long)null);
            String response = this.autocompletadoService.crearAutocompletado(autocompletadoDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("El parámetro del Autocompletado es obligatorio", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN"})
    public ResponseEntity<ResponseListadoAutocompletados> getAutocompletados() {
        ResponseListadoAutocompletados response = this.autocompletadoService.listadoAutocompletados().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getAutocompletadoById(@PathVariable Long id) {
        AutocompletadoDto autocompletadoDto = this.autocompletadoService.obtenerAutocompletadoPorId(id);
        if (autocompletadoDto != null) {
            return new ResponseEntity<>(autocompletadoDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Autocompletado no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping({"/por-parametro/{parametro}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(
            description = "Obtiene todos los autocompletados activos para un parámetro específico"
    )
    public ResponseEntity<ResponseListadoAutocompletados> obtenerPorParametro(@PathVariable String parametro) {
        ResponseListadoAutocompletados autocompletados = this.autocompletadoService.obtenerPorParametro(parametro);
        return new ResponseEntity<>(autocompletados, HttpStatus.OK);
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarAutocompletado(@RequestBody AutocompletadoDto autocompletadoDto) {
        if (autocompletadoDto.getParametro() != null && !autocompletadoDto.getParametro().trim().isEmpty()) {
            String result = this.autocompletadoService.editarAutocompletado(autocompletadoDto);
            return ResponseEntity.ok(result);
        } else {
            return new ResponseEntity<>("El parámetro del Autocompletado es obligatorio", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un Autocompletado"
    )
    public ResponseEntity<String> eliminarAutocompletado(@PathVariable Long id) {
        try {
            String mensaje = this.autocompletadoService.eliminarAutocompletado(id) + ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Autocompletado: " + e.getMessage());
        }
    }
}

