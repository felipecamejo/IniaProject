package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoHongos;
import ti.proyectoinia.dtos.HongoDto;
import ti.proyectoinia.services.HongoService;

@RestController
@RequestMapping({"api/v1/hongo"})
public class HongoController {

    @Generated
    private final HongoService hongoService;

    public HongoController(HongoService hongoService) {
        this.hongoService = hongoService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo Hongo"
    )
    public ResponseEntity<String> crearHongo(@RequestBody HongoDto hongoDto) {
        if (hongoDto.getNombre() == null || hongoDto.getNombre().trim().isEmpty() || hongoDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        if (hongoDto.getId() != null && hongoService.obtenerHongoPorId(hongoDto.getId()) != null) {
            return new ResponseEntity<>("Ya existe", HttpStatus.CONFLICT);
        }

        hongoDto.setId((Long)null);
        String response = this.hongoService.crearHongo(hongoDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);

    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<ResponseListadoHongos> getHongos() {
        ResponseListadoHongos response = this.hongoService.listadoHongos().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getHongoById(@PathVariable Long id) {
        HongoDto hongoDto = this.hongoService.obtenerHongoPorId(id);
        if (hongoDto != null) {
            return new ResponseEntity<>(hongoDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Hongo no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarHongo(@RequestBody HongoDto hongoDto) {
        if (hongoDto.getId() == null || hongoDto.getNombre() == null || hongoDto.getNombre().trim().isEmpty() || hongoDto.getNombre().matches(".*\\d.*")) {
            return new ResponseEntity<>("El nombre es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        String result = this.hongoService.editarHongo(hongoDto);
        return ResponseEntity.ok(result);

    }

    @DeleteMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un hongo"
    )
    public ResponseEntity<String> eliminarHongo(@PathVariable Long id) {

        try {
            String mensaje = this.hongoService.eliminarHongo(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        }
        catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Hongo no encontrado: " + e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Hongo: " + e.getMessage());
        }
    }
}
