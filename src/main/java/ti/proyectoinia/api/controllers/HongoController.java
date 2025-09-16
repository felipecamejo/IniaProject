package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
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
        if (hongoDto.getNombre() != null && !hongoDto.getNombre().trim().isEmpty()) {
            if (hongoDto.getNombre().matches(".*\\d.*")) {
                return new ResponseEntity<>("El nombre del Hongo no puede contener números", HttpStatus.BAD_REQUEST);
            }
            hongoDto.setId((Long)null);
            String response = this.hongoService.crearHongo(hongoDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } else {
            return new ResponseEntity<>("El nombre del Hongo es obligatorio", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping({"/listar"})
    public ResponseEntity<ResponseListadoHongos> getHongos() {
        ResponseListadoHongos response = this.hongoService.listadoHongos().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
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
        if (hongoDto.getNombre() != null && !hongoDto.getNombre().trim().isEmpty()) {
            if (hongoDto.getNombre().matches(".*\\d.*")) {
                return new ResponseEntity<>("El nombre del cliente no puede contener números", HttpStatus.BAD_REQUEST);
            }
            String result = this.hongoService.editarHongo(hongoDto);
            return ResponseEntity.ok(result);
        } else {
            return new ResponseEntity<>("El nombre del Hongo es obligatorio", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping({"/eliminar"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un hongo"
    )
    public ResponseEntity<String> eliminarHongo(@RequestBody Long id) {
        try {
            String mensaje = this.hongoService.eliminarHongo(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Hongo: " + e.getMessage());
        }
    }
}
