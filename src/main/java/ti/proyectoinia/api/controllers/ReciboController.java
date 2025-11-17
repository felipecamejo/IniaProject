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
    public ResponseEntity<?> crearRecibo(@RequestBody ReciboDto reciboDto) {
        try {
            reciboDto.setId((Long) null);
            ReciboDto reciboCreado = this.reciboService.crearRecibo(reciboDto);
            return new ResponseEntity<>(reciboCreado, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Return the validation message to help debugging client errors
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
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
        if (reciboDto.getId() == null) {
            return new ResponseEntity<>("El ID del recibo es obligatorio para editar", HttpStatus.BAD_REQUEST);
        }

        try {
            String result = this.reciboService.editarRecibo(reciboDto);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al editar el recibo: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
