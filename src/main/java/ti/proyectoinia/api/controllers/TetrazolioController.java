package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.dtos.TetrazolioDto;
import ti.proyectoinia.services.TetrazolioService;

@RestController
@RequestMapping({"api/v1/Tetrazolio"})
public class TetrazolioController {

    @Generated
    private final TetrazolioService TetrazolioService;

    public TetrazolioController(TetrazolioService TetrazolioService) {
        this.TetrazolioService = TetrazolioService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea una nueva Tetrazolio"
    )
    public ResponseEntity<String> crearTetrazolio(@RequestBody TetrazolioDto TetrazolioDto) {
        TetrazolioDto.setId((Long)null);
        String response = this.TetrazolioService.crearTetrazolio(TetrazolioDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getTetrazolioPorId(@PathVariable Long id) {
        TetrazolioDto hongoDto = this.TetrazolioService.obtenerTetrazolioPorId(id);
        if (hongoDto != null) {
            return new ResponseEntity<>(hongoDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Tetrazolio no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarTetrazolio(@RequestBody TetrazolioDto TetrazolioDto) {
        String result = this.TetrazolioService.editarTetrazolio(TetrazolioDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina una Tetrazolio"
    )
    public ResponseEntity<String> eliminarTetrazolio(@RequestBody Long id) {
        try {
            String mensaje = this.TetrazolioService.eliminarTetrazolio(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la Tetrazolio: " + e.getMessage());
        }
    }
}
