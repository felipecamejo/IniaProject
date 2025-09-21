package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoGerminacion;
import ti.proyectoinia.api.responses.ResponseListadoPurezaPNotatum;
import ti.proyectoinia.dtos.PurezaPNotatumDto;
import ti.proyectoinia.services.PurezaPNotatumService;

@RestController
@RequestMapping({"api/v1/PurezaPNotatum"})
public class PurezaPNotatumController {

    @Generated
    private final PurezaPNotatumService purezaPNotatumService;

    public PurezaPNotatumController(PurezaPNotatumService purezaPNotatumService) {
        this.purezaPNotatumService = purezaPNotatumService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea una nueva PurezaPNotatum"
    )
    public ResponseEntity<String> crearPurezaPNotatum(@RequestBody PurezaPNotatumDto purezaPNotatumDto) {
        purezaPNotatumDto.setId((Long)null);
        String response = this.purezaPNotatumService.crearPurezaPNotatum(purezaPNotatumDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getPurezaPNotatumPorId(@PathVariable Long id) {
        PurezaPNotatumDto purezaPNotatumDto = this.purezaPNotatumService.obtenerPurezaPNotatumPorId(id);
        if (purezaPNotatumDto != null) {
            return new ResponseEntity<>(purezaPNotatumDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("PurezaPNotatum no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarPurezaPNotatum(@RequestBody PurezaPNotatumDto purezaPNotatumDto) {
        String result = this.purezaPNotatumService.editarPurezaPNotatum(purezaPNotatumDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina una PurezaPNotatum"
    )
    public ResponseEntity<String> eliminarPurezaPNotatum(@PathVariable Long id) {
        try {
            String mensaje = this.purezaPNotatumService.eliminarPurezaPNotatum(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la PurezaPNotatum: " + e.getMessage());
        }
    }

    @GetMapping({"/listar"})
    public ResponseEntity<ResponseListadoPurezaPNotatum> getPurezasPNotatum() {
        ResponseListadoPurezaPNotatum response = this.purezaPNotatumService.listadoPurezaPnotatum().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
