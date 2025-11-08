package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoLogs;
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

    public ResponseEntity<ResponseListadoLogs> listado() {
        var dtos = logRepository.findAll().stream()
                .map(mapsDtoEntityService::mapToDtoLog)
                .toList();
        return ResponseEntity.ok(new ResponseListadoLogs(dtos));
    }

    public Long crear(LogDto dtos) {
        dtos.setId(null);
        return this.logRepository.save(mapsDtoEntityService.mapToEntityLog(dtos)).getId();
    }
}
