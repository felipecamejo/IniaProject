package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoRecibos;
import ti.proyectoinia.dtos.ReciboDto;
import ti.proyectoinia.services.ReciboService;

@RestController
@RequestMapping({"api/v1/recibo"})
public class ReciboController {

    @Generated
    private final ReciboService reciboService;

    public ReciboController(ReciboService reciboService) {
        this.reciboService = reciboService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo Recibo"
    )
    public ResponseEntity<String> crearRecibo(@RequestBody ReciboDto reciboDto) {
        reciboDto.setId((Long) null);
        String response = this.reciboService.crearRecibo(reciboDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/listar"})
    public ResponseEntity<ResponseListadoRecibos> getRecibos() {
        ResponseListadoRecibos response = this.reciboService.listadoRecibos().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getReciboById(@PathVariable Long id) {
        ReciboDto reciboDto = this.reciboService.obtenerReciboPorId(id);
        if (reciboDto != null) {
            return new ResponseEntity<>(reciboDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Recibo no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarRecibo(@RequestBody ReciboDto reciboDto) {
        String result = this.reciboService.editarRecibo(reciboDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un Recibo"
    )
    public ResponseEntity<String> eliminarRecibo(@PathVariable Long id) {
        try {
            String mensaje = this.reciboService.eliminarRecibo(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Recibo: " + e.getMessage());
        }
    }
}


