package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoLotes;
import ti.proyectoinia.dtos.LoteDto;
import ti.proyectoinia.services.LoteService;
import java.util.Optional;

@RestController
@RequestMapping({"api/v1/lote"})
public class LoteController {

    @Generated
    private final LoteService loteService;

    public LoteController(LoteService loteService) {
        this.loteService = loteService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(
            description = "Esta Funcion crea un nuevo Lote"
    )
    public ResponseEntity<Long> crearLote(@RequestBody LoteDto loteDto) {
        loteDto.setId(null);
        Long response = this.loteService.crearLote(loteDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<ResponseListadoLotes> getLotes() {
        return this.loteService.listadoLotes();
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getLoteById(@PathVariable Long id) {
        LoteDto loteDto = this.loteService.obtenerLotePorId(id);
        if (loteDto != null) {
            return new ResponseEntity<>(loteDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Lote no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<Long> editarLote(@RequestBody LoteDto loteDto) {
        Long result = this.loteService.editarLote(loteDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un Lote"
    )
    public ResponseEntity<String> eliminarLote(@PathVariable Long id) {
        try {
            String mensaje = this.loteService.eliminarLote(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Lote: " + e.getMessage());
        }
    }

    @GetMapping("/recibo/{loteId}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Esta funcion trae la id del recibo asociado al lote")
    public ResponseEntity<String> obtenerReciboIdPorLoteId(@PathVariable Long loteId) {
        Optional<Long> reciboOpt = loteService.obtenerReciboIdPorLoteId(loteId);
        if (reciboOpt.isEmpty()) {
            // Enviar literal JSON null (cuerpo: null) como texto para que no quede vacío
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("null");
        }
        // Devolver el id como texto numérico (ej: 123) con Content-Type application/json
        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(reciboOpt.get().toString());
    }

    @GetMapping("/verificar-asociacion/{loteId}/{reciboId}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Verifica que un recibo esté correctamente asociado a un lote")
    public ResponseEntity<String> verificarAsociacionReciboLote(
            @PathVariable Long loteId, 
            @PathVariable Long reciboId) {
        boolean asociacionCorrecta = loteService.verificarAsociacionReciboLote(loteId, reciboId);
        
        if (asociacionCorrecta) {
            return ResponseEntity.ok("Asociación correcta: Recibo " + reciboId + " está asociado al Lote " + loteId);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Asociación incorrecta: Recibo " + reciboId + " no está asociado al Lote " + loteId);
        }
    }


}
