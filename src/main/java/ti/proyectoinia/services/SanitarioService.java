package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.ErrorResponse;
import ti.proyectoinia.api.responses.ResponseListadoPurezaPNotatum;
import ti.proyectoinia.api.responses.ResponseListadoSanitario;
import ti.proyectoinia.business.entities.Hongo;
import ti.proyectoinia.business.entities.Sanitario;
import ti.proyectoinia.business.entities.SanitarioHongo;
import ti.proyectoinia.business.repositories.HongoRepository;
import ti.proyectoinia.business.repositories.SanitarioHongoRepository;
import ti.proyectoinia.business.repositories.SanitarioRepository;
import ti.proyectoinia.dtos.SanitarioDto;
import ti.proyectoinia.dtos.SanitarioHongoDto;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SanitarioService {

    private final SanitarioRepository sanitarioRepository;
    private final MapsDtoEntityService mapsDtoEntityService;
    private final SanitarioHongoRepository sanitarioHongoRepository;
    private final HongoRepository hongoRepository;

    public SanitarioService(SanitarioRepository sanitarioRepository, MapsDtoEntityService mapsDtoEntityService, SanitarioHongoRepository sanitarioHongoRepository, HongoRepository hongoRepository) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.sanitarioRepository = sanitarioRepository;
        this.sanitarioHongoRepository = sanitarioHongoRepository;
        this.hongoRepository = hongoRepository;
    }

    public Long crearSanitario(SanitarioDto sanitarioDto) {
        return this.sanitarioRepository.save(mapsDtoEntityService.mapToEntitySanitario(sanitarioDto)).getId();
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

    public void actualizarHongosCompleto(Long sanitarioId, List<SanitarioHongoDto> hongosActuales) {
        Sanitario sanitario = sanitarioRepository.findById(sanitarioId).orElse(null);
        if (sanitario == null) throw new RuntimeException("Sanitario no encontrado");
        List<SanitarioHongo> actuales = sanitarioHongoRepository.findByActivoTrueAndSanitarioId(sanitarioId);
        Set<Long> nuevosIds = hongosActuales.stream()
                .map(h -> h.getId() != null ? h.getId() : -1L)
                .collect(Collectors.toSet());
        // Eliminar los que no están en la nueva lista
        for (SanitarioHongo actual : actuales) {
            if (!nuevosIds.contains(actual.getId())) {
                sanitarioHongoRepository.delete(actual);
            }
        }
        // Crear o actualizar los recibidos
        for (SanitarioHongoDto dto : hongosActuales) {
            SanitarioHongo sanitarioHongo;
            if (dto.getId() != null) {
                sanitarioHongo = sanitarioHongoRepository.findById(dto.getId()).orElse(new SanitarioHongo());
            } else {
                sanitarioHongo = new SanitarioHongo();
            }
            sanitarioHongo.setSanitario(sanitario);
            // Buscar la entidad Hongo real
            Hongo hongoEntity = dto.getHongoId() != null ? hongoRepository.findById(dto.getHongoId()).orElse(null) : null;
            sanitarioHongo.setHongo(hongoEntity);
            sanitarioHongo.setRepeticion(dto.getRepeticion());
            sanitarioHongo.setValor(dto.getValor());
            sanitarioHongo.setIncidencia(dto.getIncidencia());
            sanitarioHongo.setTipo(dto.getTipo());
            sanitarioHongo.setActivo(true);
            sanitarioHongoRepository.save(sanitarioHongo);
        }
    }

    public List<SanitarioHongoDto> listarHongosPorSanitario(Long sanitarioId) {
        List<SanitarioHongo> hongos = sanitarioHongoRepository.findByActivoTrueAndSanitarioId(sanitarioId);
        return hongos.stream()
                .map(mapsDtoEntityService::mapToDtoSanitarioHongo)
                .toList();
    }
}
