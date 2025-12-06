package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import ti.proyectoinia.api.responses.ResponseListadoDepositos;
import ti.proyectoinia.api.responses.ResponseListadoMalezas;
import ti.proyectoinia.dtos.DepositoDto;
import ti.proyectoinia.dtos.MalezaDto;
import ti.proyectoinia.services.DepositoService;
import ti.proyectoinia.services.MalezaService;

@RestController
@RequestMapping({"api/v1/deposito"})
public class DepositoController {

    @Generated
    private final DepositoService depositoService;

    public DepositoController(DepositoService depositoService) {
        this.depositoService = depositoService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo Deposito"
    )
    public ResponseEntity<String> crearDeposito(@RequestBody DepositoDto depositoDto) {
        if (depositoDto.getNombre() == null || depositoDto.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre del deposito es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        if (depositoDto.getId() != null && depositoService.obtenerDepositoPorId(depositoDto.getId()) != null) {
            return new ResponseEntity<>("Ya existe", HttpStatus.CONFLICT);
        }

        depositoDto.setId((Long)null);
        String response = this.depositoService.crearDeposito(depositoDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<ResponseListadoDepositos> getDeposito() {
        ResponseListadoDepositos response = this.depositoService.listadoDepositos().getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getDepositoById(@PathVariable Long id) {
        DepositoDto depositoDto = this.depositoService.obtenerDepositoPorId(id);
        if (depositoDto != null) {
            return new ResponseEntity<>(depositoDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Deposito no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarDeposito(@RequestBody DepositoDto depositoDto) {
        if (depositoDto.getId() == null || depositoDto.getNombre() == null || depositoDto.getNombre().trim().isEmpty()) {
            return new ResponseEntity<>("El nombre es obligatorio y debe ser String", HttpStatus.BAD_REQUEST);
        }

        String result = this.depositoService.editarDeposito(depositoDto);
        return ResponseEntity.ok(result);

    }

    @DeleteMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un deposito"
    )
    public ResponseEntity<String> eliminarDeposito(@PathVariable Long id) {
        try {
            String mensaje = this.depositoService.eliminarDeposito(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        }
        catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Deposito no encontrado: " + e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el deposito: " + e.getMessage());
        }
    }
}
