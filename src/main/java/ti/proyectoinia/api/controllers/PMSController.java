package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoPMS;
import ti.proyectoinia.dtos.PMSDto;
import ti.proyectoinia.services.PMSService;

@RestController
@RequestMapping({"api/v1/pms"})
public class PMSController {

    @Generated
    private final PMSService pmsService;

    public PMSController(PMSService pmsService) {
        this.pmsService = pmsService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo PMS"
    )
    public ResponseEntity<String> crearPMS(@RequestBody PMSDto pmsDto) {
        pmsDto.setId((Long) null);
        String response = this.pmsService.crearPMS(pmsDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/listar"})
    public ResponseEntity<ResponseListadoPMS> getPMS() {
        ResponseListadoPMS response = this.pmsService.listadoPMS().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getPMSById(@PathVariable Long id) {
        PMSDto pmsDto = this.pmsService.obtenerPMSPorId(id);
        if (pmsDto != null) {
            return new ResponseEntity<>(pmsDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("PMS no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarPMS(@RequestBody PMSDto pmsDto) {
        String result = this.pmsService.editarPMS(pmsDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un PMS"
    )
    public ResponseEntity<String> eliminarPMS(@RequestBody Long id) {
        try {
            String mensaje = this.pmsService.eliminarPMS(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el PMS: " + e.getMessage());
        }
    }
}


