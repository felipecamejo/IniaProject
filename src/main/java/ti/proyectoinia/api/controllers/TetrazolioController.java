package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoTetrazolio;
import ti.proyectoinia.dtos.TetrazolioDto;
import ti.proyectoinia.dtos.RepeticionTetrazolioDto;
import ti.proyectoinia.dtos.DetalleSemillasTetrazolioDto;
import ti.proyectoinia.services.TetrazolioService;

import java.util.List;

@RestController
@RequestMapping({"api/v1/tetrazolio"})
public class TetrazolioController {

    @Generated
    private final TetrazolioService tetrazolioService;

    public TetrazolioController(TetrazolioService tetrazolioService) {
        this.tetrazolioService = tetrazolioService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea una nueva Tetrazolio"
    )
    public ResponseEntity<String> crearTetrazolio(@RequestBody TetrazolioDto tetrazolioDto) {
        tetrazolioDto.setId((Long)null);
        String response = this.tetrazolioService.crearTetrazolio(tetrazolioDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getTetrazolioPorId(@PathVariable Long id) {
        TetrazolioDto tetrazolioDto = this.tetrazolioService.obtenerTetrazolioPorId(id);
        if (tetrazolioDto != null) {
            return new ResponseEntity<>(tetrazolioDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Tetrazolio no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @Secured({"ADMIN"})
    @PutMapping({"/editar"})
    public ResponseEntity<String> editarTetrazolio(@RequestBody TetrazolioDto dto) {
        if (dto.getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El ID es obligatorio para editar");
        }

        String result = this.tetrazolioService.editarTetrazolio(dto);
        return ResponseEntity.ok(result);
    }

    @Secured({"ADMIN"})
    @DeleteMapping({"/eliminar/{id}"})
    @Operation(
            description = "Esta Funcion elimina una Tetrazolio"
    )
    public ResponseEntity<String> eliminarTetrazolio(@PathVariable Long id) {
        try {
            String mensaje = this.tetrazolioService.eliminarTetrazolio(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No encontrado");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar: " + e.getMessage());
        }
    }

    @GetMapping("/listar/recibo/{id}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todas los Tetrazolios activos asociados a un recibo específico")
    public ResponseEntity<ResponseListadoTetrazolio> listarTetrazolioPorRecibo(@PathVariable("id") Long id) {
        return this.tetrazolioService.listadoTetrazolioPorReciboId(id);
    }

    @GetMapping("/listar-repeticiones/{tetrazolioId}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todas las repeticiones asociadas a un Tetrazolio específico")
    public ResponseEntity<List<RepeticionTetrazolioDto>> listarRepeticionesPorTetrazolio(@PathVariable Long tetrazolioId) {
        List<RepeticionTetrazolioDto> dtos = tetrazolioService.listarRepeticionesPorTetrazolio(tetrazolioId);
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/actualizar-repeticiones/{tetrazolioId}")
    @Secured({"ADMIN"})
    @Operation(description = "Actualiza las repeticiones asociadas a un Tetrazolio, creando, actualizando y eliminando según la lista recibida")
    public ResponseEntity<String> actualizarRepeticionesCompleto(
            @PathVariable Long tetrazolioId,
            @RequestBody List<RepeticionTetrazolioDto> repeticionesActuales) {
        try {
            tetrazolioService.actualizarRepeticionesCompleto(tetrazolioId, repeticionesActuales);
            return ResponseEntity.ok("Repeticiones actualizadas correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar repeticiones: " + e.getMessage());
        }
    }

    @GetMapping("/listar-detalles/{tetrazolioId}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todos los detalles de semillas asociados a un Tetrazolio específico")
    public ResponseEntity<List<DetalleSemillasTetrazolioDto>> listarDetallesPorTetrazolio(@PathVariable Long tetrazolioId) {
        List<DetalleSemillasTetrazolioDto> dtos = tetrazolioService.listarDetalles(tetrazolioId);
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/actualizar-detalles/{tetrazolioId}")
    @Secured({"ADMIN"})
    @Operation(description = "Actualiza los detalles de semillas asociados a un Tetrazolio, creando, actualizando y eliminando según la lista recibida")
    public ResponseEntity<String> actualizarDetallesCompleto(
            @PathVariable Long tetrazolioId,
            @RequestBody List<DetalleSemillasTetrazolioDto> detallesActuales) {
        try {
            tetrazolioService.actualizarDetallesCompleto(tetrazolioId, detallesActuales);
            return ResponseEntity.ok("Detalles actualizados correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar detalles: " + e.getMessage());
        }
    }

}
