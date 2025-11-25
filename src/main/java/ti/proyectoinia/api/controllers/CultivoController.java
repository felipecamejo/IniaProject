package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoCultivos;
import ti.proyectoinia.dtos.CultivoDto;
import ti.proyectoinia.services.CultivoService;

@RestController
@RequestMapping({"api/v1/cultivo"})
public class CultivoController {

    private final CultivoService cultivoService;

    public CultivoController(CultivoService cultivoService) {
        this.cultivoService = cultivoService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(description = "Esta función crea un nuevo cultivo")
    public ResponseEntity<String> crearCultivo(@RequestBody CultivoDto cultivoDto) {
        if (cultivoDto.getNombre() == null || cultivoDto.getNombre().trim().isEmpty() || cultivoDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre del cultivo es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        if (cultivoDto.getId() != null && cultivoService.obtenerCultivoPorId(cultivoDto.getId()) != null) {
            return new ResponseEntity<>("Ya existe", HttpStatus.CONFLICT);
        }

        try{
            cultivoDto.setId(null);
            String response = this.cultivoService.crearCultivo(cultivoDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista cultivos activos")
    public ResponseEntity<ResponseListadoCultivos> listar() {
        ResponseListadoCultivos response = this.cultivoService.listado().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getCultivoById(@PathVariable Long id) {
        CultivoDto cultivoDto = this.cultivoService.obtenerCultivoPorId(id);
        if (cultivoDto != null) {
            return new ResponseEntity<>(cultivoDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Cultivo no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarCultivo(@RequestBody CultivoDto cultivoDto) {
        if (cultivoDto.getId() == null || cultivoDto.getNombre() == null || cultivoDto.getNombre().trim().isEmpty() || cultivoDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        String result = this.cultivoService.editarCultivo(cultivoDto);
        return ResponseEntity.ok(result);

    }

    @DeleteMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(description = "Esta función elimina un cultivo")
    public ResponseEntity<String> eliminarCultivo(@PathVariable Long id) {
        try {
            String mensaje = this.cultivoService.eliminarCultivo(id) + ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        }
        catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cultivo no encontrado: " + e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el cultivo: " + e.getMessage());
        }
    }
}


