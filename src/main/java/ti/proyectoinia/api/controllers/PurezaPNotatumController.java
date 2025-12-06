package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoPurezaPNotatum;
import ti.proyectoinia.dtos.PurezaPNotatumDto;
import ti.proyectoinia.dtos.RepeticionesPPNDTO;
import ti.proyectoinia.services.PurezaPNotatumService;

import java.util.List;

@RestController
@RequestMapping({"api/v1/PurezaPNotatum"})
public class PurezaPNotatumController {

    @Generated
    private final PurezaPNotatumService purezaPNotatumService;

    public PurezaPNotatumController(PurezaPNotatumService purezaPNotatumService) {
        this.purezaPNotatumService = purezaPNotatumService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN", "ANALISTA"})
    @Operation(
            description = "Esta Funcion crea una nueva PurezaPNotatum"
    )
    public ResponseEntity<Long> crearPurezaPNotatum(@RequestBody PurezaPNotatumDto purezaPNotatumDto) {
        purezaPNotatumDto.setId((Long)null);
        Long response = this.purezaPNotatumService.crearPurezaPNotatum(purezaPNotatumDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getPurezaPNotatumPorId(@PathVariable Long id) {
        PurezaPNotatumDto purezaPNotatumDto = this.purezaPNotatumService.obtenerPurezaPNotatumPorId(id);
        if (purezaPNotatumDto != null) {
            return new ResponseEntity<>(purezaPNotatumDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("PurezaPNotatum no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN", "ANALISTA"})
    public ResponseEntity<Long> editarPurezaPNotatum(@RequestBody PurezaPNotatumDto dto) {
        if (dto.getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(-1L);
        }

        Long result = this.purezaPNotatumService.editarPurezaPNotatum(dto);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina una PurezaPNotatum"
    )
    public ResponseEntity<String> eliminarPurezaPNotatum(@PathVariable Long id) {
        try {
            String mensaje = this.purezaPNotatumService.eliminarPurezaPNotatum(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No encontrado");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar: " + e.getMessage());
        }
    }

    @GetMapping("/listar/recibo/{id}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todas las PurezasPNotatum activas asociadas a un recibo específico")
    public ResponseEntity<ResponseListadoPurezaPNotatum> listarPurezaPNotatumPorRecibo(@PathVariable("id") Long id) {
        return this.purezaPNotatumService.listadoPurezaPNotatumporRecibo(id);
    }

    @PutMapping("/actualizar-repeticiones/{purezaPNotatumId}")
    @Secured({"ADMIN", "ANALISTA"})
    @Operation(description = "Actualiza los Repeticiones asociados a una PPN, creando, actualizando y eliminando según la lista recibida")
    public ResponseEntity<String> actualizarRepeticionesCompleto(
            @PathVariable Long purezaPNotatumId,
            @RequestBody List<RepeticionesPPNDTO> repeticionesActuales) {
        try {
            purezaPNotatumService.actualizarRepeticionesCompleto(purezaPNotatumId, repeticionesActuales);
            return ResponseEntity.ok("Repeticiones actualizadas correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar repeticiones: " + e.getMessage());
        }
    }

    @GetMapping("/listar-repeticiones/{purezaPNotatumId}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todos las repeticiones asociados a un sanitario específico")
    public ResponseEntity<List<RepeticionesPPNDTO>> listarRepeticionesPorPPN(@PathVariable Long purezaPNotatumId) {
        List<RepeticionesPPNDTO> dtos = purezaPNotatumService.listarRepeticionesPorPPN(purezaPNotatumId);
        return ResponseEntity.ok(dtos);
    }
}
