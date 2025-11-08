package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoCertificados;
import ti.proyectoinia.dtos.CertificadoDto;
import ti.proyectoinia.services.CertificadoService;

@RestController
@RequestMapping({"api/v1/certificado"})
public class CertificadoController {

    @Generated
    private final CertificadoService certificadoService;

    public CertificadoController(CertificadoService certificadoService) {
        this.certificadoService = certificadoService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion crea un nuevo Certificado"
    )
    public ResponseEntity<?> crearCertificado(@RequestBody CertificadoDto certificadoDto) {
        try {
            certificadoDto.setId(null);
            CertificadoDto certificadoCreado = this.certificadoService.crearCertificado(certificadoDto);
            return new ResponseEntity<>(certificadoCreado, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping({"/{id}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(
            description = "Esta Funcion obtiene un Certificado por ID"
    )
    public ResponseEntity<?> getCertificadoById(@PathVariable Long id) {
        CertificadoDto certificadoDto = this.certificadoService.obtenerCertificadoPorId(id);
        if (certificadoDto != null) {
            return new ResponseEntity<>(certificadoDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Certificado no encontrado", HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion edita un Certificado"
    )
    public ResponseEntity<String> editarCertificado(@RequestBody CertificadoDto certificadoDto) {
        try {
            String result = this.certificadoService.editarCertificado(certificadoDto);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al editar el certificado: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping({"/eliminar/{id}"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Esta Funcion elimina un Certificado"
    )
    public ResponseEntity<String> eliminarCertificado(@PathVariable Long id) {
        try {
            String mensaje = this.certificadoService.eliminarCertificado(id) + ". ID:" + id.toString();
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el Certificado: " + e.getMessage());
        }
    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(
            description = "Esta Funcion lista todos los Certificados activos"
    )
    public ResponseEntity<ResponseListadoCertificados> listarCertificados() {
        return this.certificadoService.listadoCertificados();
    }

    @GetMapping({"/recibo/{reciboId}"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(
            description = "Esta Funcion lista todos los Certificados activos de un recibo"
    )
    public ResponseEntity<ResponseListadoCertificados> listarCertificadosPorRecibo(@PathVariable Long reciboId) {
        return this.certificadoService.listadoCertificadosPorRecibo(reciboId);
    }
}

