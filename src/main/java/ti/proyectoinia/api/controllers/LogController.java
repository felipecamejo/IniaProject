package ti.proyectoinia.api.controllers;


import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.api.responses.ResponseListadoCultivos;
import ti.proyectoinia.api.responses.ResponseListadoLogs;
import ti.proyectoinia.dtos.CultivoDto;

import ti.proyectoinia.dtos.LogDto;
import ti.proyectoinia.services.LogService;

@RestController
@RequestMapping({"api/v1/log"})
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Esta función crea un nuevo log")
    public ResponseEntity<String> crearLog(@RequestBody LogDto logDto) {
        if (logDto.getTexto() == null || logDto.getTexto().trim().isEmpty() ) {
            return new ResponseEntity<>("El texto del log es obligatorio", HttpStatus.BAD_REQUEST);
        }

        logDto.setId(null);
        String response = this.logService.crear(logDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/listar/{loteId}"})
    @Secured({"ADMIN"})
    @Operation(description = "Lista Logs")
    public ResponseEntity<ResponseListadoLogs> listarLog(@PathVariable Long loteId) {
        try {
            ResponseListadoLogs response = this.logService.listado(loteId).getBody();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
