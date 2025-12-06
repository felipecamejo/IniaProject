package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadosEspecies;
import ti.proyectoinia.dtos.CultivoDto;
import ti.proyectoinia.dtos.EspecieDto;
import ti.proyectoinia.services.EspecieService;

@RestController
@RequestMapping({"api/v1/especie"})
public class EspecieController {

    private final EspecieService service;

    public EspecieController(EspecieService service) {
        this.service = service;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(description = "Esta función crea una nueva especie")
    public ResponseEntity<String> crear(@RequestBody EspecieDto dto) {
        if (dto.getNombre() == null || dto.getNombre().trim().isEmpty() ) {
            return new ResponseEntity<>("El nombre es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        if (dto.getId() != null && service.obtenerPorId(dto.getId()) != null) {
            return new ResponseEntity<>("Ya existe", HttpStatus.CONFLICT);
        }

        try{
            dto.setId(null);
            String response = this.service.crear(dto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista especies activas")
    public ResponseEntity<ResponseListadosEspecies> listar() {
        ResponseListadosEspecies response = this.service.listado().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getById(@PathVariable Long id) {
        EspecieDto dto = this.service.obtenerPorId(id);
        if (dto != null) {
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("especie no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editar(@RequestBody EspecieDto dto) {
        if (dto.getId() == null || dto.getNombre() == null || dto.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        String result = this.service.editar(dto);
        return ResponseEntity.ok(result);

    }

    @DeleteMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(description = "Esta función elimina una especie")
    public ResponseEntity<String> eliminar(@PathVariable Long id) {
        try {
            String mensaje = this.service.eliminar(id) + ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        }
        catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Especie no encontrada: " + e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la especie: " + e.getMessage());
        }
    }
}


