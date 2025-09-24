package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.ErrorResponse;
import ti.proyectoinia.api.responses.ResponseListadoPurezaPNotatum;
import ti.proyectoinia.api.responses.ResponseListadoSanitario;
import ti.proyectoinia.business.entities.Sanitario;
import ti.proyectoinia.business.repositories.SanitarioRepository;
import ti.proyectoinia.dtos.SanitarioDto;

@Service
public class SanitarioService {

    private final SanitarioRepository sanitarioRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public SanitarioService(SanitarioRepository sanitarioRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.sanitarioRepository = sanitarioRepository;
    }

    public String crearSanitario(SanitarioDto sanitarioDto) {
        this.sanitarioRepository.save(mapsDtoEntityService.mapToEntitySanitario(sanitarioDto));
        return "Sanitario creado correctamente ID:" + sanitarioDto.getId();
    }

    public SanitarioDto obtenerSanitarioPorId(Long id) {
        Sanitario sanitario = this.sanitarioRepository.findById(id).orElse(null);
        if (sanitario == null || !sanitario.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoSanitario(sanitario);
    }

    public String editarSanitario(SanitarioDto sanitarioDto) {
        this.sanitarioRepository.save(mapsDtoEntityService.mapToEntitySanitario(sanitarioDto));
        return "Sanitario actualizado correctamente ID:" + sanitarioDto.getId();
    }

    public String eliminarSanitario(Long id) {
        if (id != null) {
            this.sanitarioRepository.findById(id).ifPresent(sanitario -> {
                sanitario.setActivo(false);
                this.sanitarioRepository.save(sanitario);
            });
        }
        return "Sanitario eliminado correctamente ID:" + id;
    }

    public ResponseEntity<ResponseListadoSanitario> listadoSanitarioPorReciboId( Long id) {
        var activos = this.sanitarioRepository.findByActivoTrueAndReciboIdAndReciboActivoTrue(id);
        var dtos = activos.stream()
                .map(mapsDtoEntityService::mapToDtoSanitario)
                .toList();
        ResponseListadoSanitario responseListadoSanitario = new ResponseListadoSanitario(dtos);
        return ResponseEntity.ok(responseListadoSanitario);
    }
}
