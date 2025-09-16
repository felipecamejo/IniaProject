package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoLotes;
import ti.proyectoinia.dtos.LoteDto;
import ti.proyectoinia.services.LoteService;

@RestController
@RequestMapping({"api/v1/lote"})
public class LoteController {

    @Generated
    private final LoteService loteService;

    public LoteController(LoteService loteService) {
        this.loteService = loteService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo Lote"
    )
    public ResponseEntity<String> crearLote(@RequestBody LoteDto loteDto) {
        if (loteDto.getNombre() != null && !loteDto.getNombre().trim().isEmpty()) {
            if (loteDto.getNombre().matches(".*\\d.*")) {
                return new ResponseEntity<>("El nombre del Lote no puede contener números", HttpStatus.BAD_REQUEST);
            }
            loteDto.setId((Long) null);
            String response = this.loteService.crearLote(loteDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } else {
            return new ResponseEntity<>("El nombre del Lote es obligatorio", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping({"/listar"})
    public ResponseEntity<ResponseListadoLotes> getLotes() {
        ResponseListadoLotes response = this.loteService.listadoLotes().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getLoteById(@PathVariable Long id) {
        LoteDto loteDto = this.loteService.obtenerLotePorId(id);
        if (loteDto != null) {
            return new ResponseEntity<>(loteDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Lote no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarLote(@RequestBody LoteDto loteDto) {
        String result = this.loteService.editarLote(loteDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un Lote"
    )
    public ResponseEntity<String> eliminarLote(@RequestBody Long id) {
        try {
            String mensaje = this.loteService.eliminarLote(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Lote: " + e.getMessage());
        }
    }
}


