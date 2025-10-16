package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoPurezaPNotatum;
import ti.proyectoinia.api.responses.ResponseListadoSanitario;
import ti.proyectoinia.dtos.SanitarioDto;
import ti.proyectoinia.dtos.SanitarioHongoDto;
import ti.proyectoinia.services.SanitarioService;

import java.util.List;

@RestController
@RequestMapping({"api/v1/sanitario"})
public class SanitarioController {
    
    @Generated
    private final SanitarioService sanitarioService;

    public SanitarioController(SanitarioService sanitarioService) {
        this.sanitarioService = sanitarioService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo MalezaS"
    )
    public ResponseEntity<Long> crearSanitario(@RequestBody SanitarioDto sanitarioDto) {

        sanitarioDto.setId((Long)null);
        Long response = this.sanitarioService.crearSanitario(sanitarioDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getSanitarioById(@PathVariable Long id) {
        SanitarioDto sanitarioDto = this.sanitarioService.obtenerSanitarioPorId(id);
        if (sanitarioDto != null) {
            return new ResponseEntity<>(sanitarioDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Sanitario no encontrada", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarSanitario(@RequestBody SanitarioDto sanitarioDto) {
        String result = this.sanitarioService.editarSanitario(sanitarioDto);
        return ResponseEntity.ok(result);
    }

    @PutMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un sanitario"
    )
    public ResponseEntity<String> eliminarSanitario(@PathVariable Long id) {
        try {
            String mensaje = this.sanitarioService.eliminarSanitario(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Sanitario: " + e.getMessage());
        }
    }

    @GetMapping("/listar/recibo/{id}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todas los Sanitarios activos asociados a un recibo específico")
    public ResponseEntity<ResponseListadoSanitario> listarSanitarioPorRecibo(@PathVariable("id") Long id) {
        return this.sanitarioService.listadoSanitarioPorReciboId(id);
    }

    @PutMapping("/actualizar-hongos/{sanitarioId}")
    @Secured({"ADMIN"})
    @Operation(description = "Actualiza los hongos asociados a un sanitario, creando, actualizando y eliminando según la lista recibida")
    public ResponseEntity<String> actualizarHongosCompleto(
            @PathVariable Long sanitarioId,
            @RequestBody List<SanitarioHongoDto> hongosActuales) {
        try {
            sanitarioService.actualizarHongosCompleto(sanitarioId, hongosActuales);
            return ResponseEntity.ok("Hongos actualizados correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar hongos: " + e.getMessage());
        }
    }

    @GetMapping("/listar-hongos/{sanitarioId}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todos los SanitarioHongos activos asociados a un sanitario específico")
    public ResponseEntity<List<SanitarioHongoDto>> listarHongosPorSanitario(@PathVariable Long sanitarioId) {
        List<SanitarioHongoDto> dtos = sanitarioService.listarHongosPorSanitario(sanitarioId);
        return ResponseEntity.ok(dtos);
    }

}
