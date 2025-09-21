package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoSanitario;
import ti.proyectoinia.api.responses.ResponseListadoTetrazolio;
import ti.proyectoinia.dtos.TetrazolioDto;
import ti.proyectoinia.services.TetrazolioService;

@RestController
@RequestMapping({"api/v1/Tetrazolio"})
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
    public ResponseEntity<String> editarTetrazolio(@RequestBody TetrazolioDto tetrazolioDto) {
        String result = this.tetrazolioService.editarTetrazolio(tetrazolioDto);
        return ResponseEntity.ok(result);
    }
    @Secured({"ADMIN"})

    @PutMapping({"/eliminar/{id}"})
    @Operation(
            description = "Esta Funcion elimina una Tetrazolio"
    )
    public ResponseEntity<String> eliminarTetrazolio(@PathVariable Long id) {
        try {
            String mensaje = this.tetrazolioService.eliminarTetrazolio(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la Tetrazolio: " + e.getMessage());
        }
    }

    @GetMapping({"/listar"})
    public ResponseEntity<ResponseListadoTetrazolio> getTetrazolios() {
        ResponseListadoTetrazolio response = this.tetrazolioService.listadoTetrazolio().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
