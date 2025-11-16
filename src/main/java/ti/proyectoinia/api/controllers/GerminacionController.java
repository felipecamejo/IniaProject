package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import lombok.Generated;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoGerminacion;
import ti.proyectoinia.api.responses.ResponseListadoPurezas;
import ti.proyectoinia.dtos.DOSNDto;
import ti.proyectoinia.dtos.GerminacionDto;
import ti.proyectoinia.services.GerminacionService;

@RestController
@RequestMapping({"api/v1/germinacion"})
public class GerminacionController {

    @Generated
    private final GerminacionService germinacionService;
    private static final Logger log = LoggerFactory.getLogger(GerminacionController.class);

    public GerminacionController(GerminacionService germinacionService) {
        this.germinacionService = germinacionService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea una nueva germinacion"
    )
    public ResponseEntity<String> crearGerminacion(@RequestBody GerminacionDto germinacionDto) {
        // Log de depuración para verificar que el backend recibe los campos INIA/INASE
        try {
        log.info("CrearGerminacion payload - tratamiento: {}, preFrio: {}, preTratamiento: {}, temperatura: {}, pRedondeo: {}",
            germinacionDto.getTratamiento(), germinacionDto.getPreFrio(), germinacionDto.getPreTratamiento(), germinacionDto.getTemperatura(), germinacionDto.getPRedondeo());
        } catch (Exception ignored) {}
        // Fallback a System.out.println si los logs no se ven en el entorno actual
        try {
        System.out.println("[CrearGerminacion] Payload recibido -> " +
            "pNormalINIA=" + germinacionDto.getPNormalINIA() + ", " +
            "pNormalINASE=" + germinacionDto.getPNormalINASE() + ", " +
            "pAnormalINIA=" + germinacionDto.getPAnormalINIA() + ", " +
            "pAnormalINASE=" + germinacionDto.getPAnormalINASE() + ", " +
            "pMuertasINIA=" + germinacionDto.getPMuertasINIA() + ", " +
            "pMuertasINASE=" + germinacionDto.getPMuertasINASE() + ", " +
            "pFrescasINIA=" + germinacionDto.getPFrescasINIA() + ", " +
            "pFrescasINASE=" + germinacionDto.getPFrescasINASE() + ", " +
            "semillasDurasINIA=" + germinacionDto.getSemillasDurasINIA() + ", " +
            "semillasDurasINASE=" + germinacionDto.getSemillasDurasINASE() + ", " +
            "germinacionINIA=" + germinacionDto.getGerminacionINIA() + ", " +
            "germinacionINASE=" + germinacionDto.getGerminacionINASE());
        } catch (Exception ignored) {}
            germinacionDto.setId((Long)null);
            String response = this.germinacionService.crearGerminacion(germinacionDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<?> getGerminacionPorId(@PathVariable Long id) {

        GerminacionDto dto = this.germinacionService.obtenerGerminacionPorId(id);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("DOSN no encontrada");
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    public ResponseEntity<String> editarGerminacion(@RequestBody GerminacionDto germinacionDto) {
        if (germinacionDto.getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El ID no puede ser nulo para la edición.");
        }

        String result = this.germinacionService.editarGerminacion(germinacionDto);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina una germinacion"
    )
    public ResponseEntity<String> eliminarGerminacion(@PathVariable Long id) {
        try {
            String mensaje = this.germinacionService.eliminarGerminacion(id)+ ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No encontrado");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar: " + e.getMessage());
        }
    }

    @GetMapping("/listar/recibo/{id}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista todas las germinaciones activas asociadas a un recibo específico")
    public ResponseEntity<ResponseListadoGerminacion> listarGerminacionesPorRecibo(@PathVariable("id") Long id) {
        return germinacionService.listarGerminacionesPorRecibo(id);
    }
}
