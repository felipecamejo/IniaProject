package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.dtos.GerminacionDto;
import ti.proyectoinia.services.GerminacionService;

@RestController
@RequestMapping({"api/v1/germinacion"})
public class GerminacionController {

    @Generated
    private final GerminacionService germinacionService;

    public GerminacionController(GerminacionService germinacionService) {
        this.germinacionService = germinacionService;
    }

    @PostMapping({"/crear"})
    //@Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea una nueva germinacion"
    )
    public ResponseEntity<String> crearGerminacion(@RequestBody GerminacionDto germinacionDto) {
            germinacionDto.setId((Long)null);
            String response = this.germinacionService.crearGerminacion(germinacionDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getGerminacionPorId(@PathVariable Long id) {
        GerminacionDto hongoDto = this.germinacionService.obtenerGerminacionPorId(id);
        if (hongoDto != null) {
            return new ResponseEntity<>(hongoDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Germinacion no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    //@Secured({"ADMIN"})
    public ResponseEntity<String> editarGerminacion(@RequestBody GerminacionDto germinacionDto) {
        String result = this.germinacionService.editarGerminacion(germinacionDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar"})
    //@Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina una germinacion"
    )
    public ResponseEntity<String> eliminarGerminacion(@RequestBody Long id) {
        try {
            String mensaje = this.germinacionService.eliminarGerminacion(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la Germinacion: " + e.getMessage());
        }
    }
}
