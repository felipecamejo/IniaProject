package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoLogs;
import ti.proyectoinia.api.responses.ResponseListadoLogsPage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import ti.proyectoinia.business.repositories.LogRepository;
import ti.proyectoinia.dtos.LogDto;

@Service
public class LogService {

    private final LogRepository logRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public LogService(LogRepository logRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.logRepository = logRepository;
        this.mapsDtoEntityService = mapsDtoEntityService;
    }

    public ResponseEntity<ResponseListadoLogs> listado(Long loteId) {
        var dtos = logRepository.findByLoteId(loteId).stream()
                .map(mapsDtoEntityService::mapToDtoLog)
                .toList();
        return ResponseEntity.ok(new ResponseListadoLogs(dtos));
    }

    public String crear(LogDto dtos) {
        dtos.setId(null);
        return "Log creado con ID:" + this.logRepository.save(mapsDtoEntityService.mapToEntityLog(dtos)).getId();
    }

    /**
     * Devuelve logs paginados por loteId y filtros opcionales: searchText, mes, anio
     */
    public ResponseEntity<ResponseListadoLogsPage> listadoPage(Long loteId, int page, int size, String sortField, String direction,
                                                              String searchText, Integer mes, Integer anio) {
        if (size <= 0) size = 20;
        if (page < 0) page = 0;
        if (sortField == null || sortField.isBlank()) sortField = "fechaCreacion";
        Sort sort = (direction != null && direction.equalsIgnoreCase("ASC")) ? Sort.by(sortField).ascending() : Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Normalizar searchText
        String textoFiltro = (searchText == null || searchText.isBlank() || "null".equalsIgnoreCase(searchText.trim())) ? null : searchText.trim();

        // Calcular fechas para mes y año
        java.util.Date fechaInicio = null;
        java.util.Date fechaFin = null;
        try {
            if (mes != null && anio != null) {
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.set(anio, mes - 1, 1, 0, 0, 0);
                cal.set(java.util.Calendar.MILLISECOND, 0);
                fechaInicio = cal.getTime();
                cal.set(java.util.Calendar.DAY_OF_MONTH, cal.getActualMaximum(java.util.Calendar.DAY_OF_MONTH));
                cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
                cal.set(java.util.Calendar.MINUTE, 59);
                cal.set(java.util.Calendar.SECOND, 59);
                cal.set(java.util.Calendar.MILLISECOND, 999);
                fechaFin = cal.getTime();
            } else if (anio != null) {
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.set(anio, 0, 1, 0, 0, 0);
                cal.set(java.util.Calendar.MILLISECOND, 0);
                fechaInicio = cal.getTime();
                cal.set(anio, 11, 31, 23, 59, 59);
                cal.set(java.util.Calendar.MILLISECOND, 999);
                fechaFin = cal.getTime();
            }
        } catch (Exception e) {
            System.out.println("[LogService] Error construyendo fechas: " + e.getMessage());
        }

        Page<ti.proyectoinia.business.entities.Log> pageResult;
        // Selección de método derivado según filtros
        if (textoFiltro != null && fechaInicio != null && fechaFin != null) {
            pageResult = this.logRepository.findByLoteIdAndTextoIgnoreCaseContainingAndFechaCreacionBetween(loteId, textoFiltro, fechaInicio, fechaFin, pageable);
        } else if (textoFiltro != null) {
            pageResult = this.logRepository.findByLoteIdAndTextoIgnoreCaseContaining(loteId, textoFiltro, pageable);
        } else if (fechaInicio != null && fechaFin != null) {
            pageResult = this.logRepository.findByLoteIdAndFechaCreacionBetween(loteId, fechaInicio, fechaFin, pageable);
        } else {
            pageResult = this.logRepository.findByLoteId(loteId, pageable);
        }

        var contentDto = pageResult.getContent().stream()
            .map(mapsDtoEntityService::mapToDtoLog)
            .toList();
        ResponseListadoLogsPage response = new ResponseListadoLogsPage(
            contentDto,
            pageResult.getNumber(),
            pageResult.getSize(),
            pageResult.getTotalElements(),
            pageResult.getTotalPages(),
            pageResult.isFirst(),
            pageResult.isLast()
        );
        return ResponseEntity.ok(response);
    }
}

