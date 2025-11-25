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
}

