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
     * Devuelve logs paginados por loteId
     */
    public ResponseEntity<ResponseListadoLogsPage> listadoPage(Long loteId, int page, int size, String sortField, String direction) {
        if (size <= 0) size = 20;
        if (page < 0) page = 0;
        if (sortField == null || sortField.isBlank()) sortField = "fechaCreacion";
        Sort sort = (direction != null && direction.equalsIgnoreCase("ASC")) ? Sort.by(sortField).ascending() : Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ti.proyectoinia.business.entities.Log> pageResult = this.logRepository.findByLoteId(loteId, pageable);
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

