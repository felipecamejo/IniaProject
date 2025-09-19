package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoPurezas;
import ti.proyectoinia.dtos.PurezaDto;
import ti.proyectoinia.services.PurezaService;

@RestController
@RequestMapping({"api/v1/pureza"})
public class PurezaController {

    @Generated
    private final PurezaService purezaService;

    public PurezaController(PurezaService purezaService) {
        this.purezaService = purezaService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo registro de Pureza"
    )
    public ResponseEntity<String> crearPureza(@RequestBody PurezaDto dto) {
        dto.setId((Long) null);
        String response = this.purezaService.crearPureza(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/listar"})
    public ResponseEntity<ResponseListadoPurezas> getPurezas() {
        ResponseListadoPurezas response = this.purezaService.listadoPurezas().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    public ResponseEntity<?> getPurezaById(@PathVariable Long id) {
        PurezaDto purezaDto = this.purezaService.obtenerPurezaPorId(id);
        if (purezaDto != null) {
            return new ResponseEntity<>(purezaDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Pureza no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarPureza(@RequestBody PurezaDto dto) {
        String result = this.purezaService.editarPureza(dto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un registro de Pureza"
    )
    public ResponseEntity<String> eliminarPureza(@PathVariable Long id) {
        try {
            String mensaje = this.purezaService.eliminarPureza(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la Pureza: " + e.getMessage());
        }
    }
}


