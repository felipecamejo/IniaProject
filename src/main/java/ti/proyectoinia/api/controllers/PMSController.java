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
    public ResponseEntity<Long> crearPMS(@RequestBody PMSDto pmsDto) {
        pmsDto.setId((Long) null);
        Long response = this.pmsService.crearPMS(pmsDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
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
    public ResponseEntity<Long> editarPMS(@RequestBody PMSDto pmsDto) {
        Long result = this.pmsService.editarPMS(pmsDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un PMS"
    )
    public ResponseEntity<String> eliminarPMS(@PathVariable Long id) {
        try {
            String mensaje = this.pmsService.eliminarPMS(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el PMS: " + e.getMessage());
        }
    }

    @GetMapping("/listar/recibo/{id}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todas los PMS activos asociadas a un recibo específico")
    public ResponseEntity<ResponseListadoPMS> listarPMSPorRecibo(@PathVariable("id") Long id) {
        return this.pmsService.listadoPMSporRecibo(id);
    }
}
