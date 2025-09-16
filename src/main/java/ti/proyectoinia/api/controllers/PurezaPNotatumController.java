package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.dtos.PurezaPNotatumDto;
import ti.proyectoinia.services.PurezaPNotatumService;

@RestController
@RequestMapping({"api/v1/PurezaPNotatum"})
public class PurezaPNotatumController {

    @Generated
    private final PurezaPNotatumService PurezaPNotatumService;

    public PurezaPNotatumController(PurezaPNotatumService PurezaPNotatumService) {
        this.PurezaPNotatumService = PurezaPNotatumService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea una nueva PurezaPNotatum"
    )
    public ResponseEntity<String> crearPurezaPNotatum(@RequestBody PurezaPNotatumDto PurezaPNotatumDto) {
        PurezaPNotatumDto.setId((Long)null);
        String response = this.PurezaPNotatumService.crearPurezaPNotatum(PurezaPNotatumDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getPurezaPNotatumPorId(@PathVariable Long id) {
        PurezaPNotatumDto hongoDto = this.PurezaPNotatumService.obtenerPurezaPNotatumPorId(id);
        if (hongoDto != null) {
            return new ResponseEntity<>(hongoDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("PurezaPNotatum no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarPurezaPNotatum(@RequestBody PurezaPNotatumDto PurezaPNotatumDto) {
        String result = this.PurezaPNotatumService.editarPurezaPNotatum(PurezaPNotatumDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina una PurezaPNotatum"
    )
    public ResponseEntity<String> eliminarPurezaPNotatum(@RequestBody Long id) {
        try {
            String mensaje = this.PurezaPNotatumService.eliminarPurezaPNotatum(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la PurezaPNotatum: " + e.getMessage());
        }
    }
}
