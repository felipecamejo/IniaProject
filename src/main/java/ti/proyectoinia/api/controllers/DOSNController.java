package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoDOSN;
import ti.proyectoinia.dtos.DOSNDto;
import ti.proyectoinia.services.DOSNService;

@RestController
@RequestMapping({"api/v1/DOSN"})
public class DOSNController {

    @Generated
    private final DOSNService DOSNService;

    public DOSNController(DOSNService DOSNService) {
        this.DOSNService = DOSNService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN", "ANALISTA"})
    @Operation(
            description = "Esta Funcion crea una nueva DOSN"
    )
    public ResponseEntity<Long> crearDOSN(@RequestBody DOSNDto dosnDto) {
        dosnDto.setId((Long)null);
        Long response = this.DOSNService.crearDOSN(dosnDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getDOSNPorId(@PathVariable Long id) {

        DOSNDto dto = this.DOSNService.obtenerDOSNPorId(id);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("DOSN no encontrada");
        }
    }


    @PutMapping({"/editar"})
    @Secured({"ADMIN", "ANALISTA"})
    public ResponseEntity<String> editarDOSN(@RequestBody DOSNDto dosnDto) {
        if (dosnDto.getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El ID no puede ser nulo para la edición.");
        }

        String result = this.DOSNService.editarDOSN(dosnDto);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina una DOSN"
    )
    public ResponseEntity<String> eliminarDOSN(@PathVariable Long id) {
        try {
            String mensaje = this.DOSNService.eliminarDOSN(id) + ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No encontrado");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar: " + e.getMessage());
        }
    }

    @GetMapping("/listar/recibo/{id}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todas los Dosn activos asociadas a un recibo específico")
    public ResponseEntity<ResponseListadoDOSN> listarDosnPorRecibo(@PathVariable("id") Long id) {
        return DOSNService.listadoDOSNporRecibo(id);
    }
}
