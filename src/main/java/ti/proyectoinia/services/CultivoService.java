package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoCultivos;
import ti.proyectoinia.business.entities.Cultivo;
import ti.proyectoinia.business.repositories.CultivoRepository;
import ti.proyectoinia.dtos.CultivoDto;

@Service
public class CultivoService {

    private final CultivoRepository cultivoRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public CultivoService(CultivoRepository cultivoRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.cultivoRepository = cultivoRepository;
        this.mapsDtoEntityService = mapsDtoEntityService;
    }

    public ResponseEntity<ResponseListadoCultivos> listado() {
        var activos = cultivoRepository.findByActivoTrue();
        var dtos = activos.stream()
                .map(mapsDtoEntityService::mapToDtoCultivo)
                .toList();
        return ResponseEntity.ok(new ResponseListadoCultivos(dtos));
    }

    public String crearCultivo(CultivoDto cultivoDto) {
        cultivoDto.setId(null);
        this.cultivoRepository.save(mapsDtoEntityService.mapToEntityCultivo(cultivoDto));
        return "Cultivo creado correctamente ID:" + cultivoDto.getId();
    }

    public CultivoDto obtenerCultivoPorId(Long id) {
        Cultivo cultivo = this.cultivoRepository.findById(id).orElse(null);
        if (cultivo == null || !cultivo.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoCultivo(cultivo);
    }

    public String editarCultivo(CultivoDto cultivoDto) {
        this.cultivoRepository.save(mapsDtoEntityService.mapToEntityCultivo(cultivoDto));
        return "Cultivo actualizado correctamente ID:" + cultivoDto.getId();
    }

    public String eliminarCultivo(Long id) {
        if (id != null) {
            this.cultivoRepository.findById(id).ifPresent(cultivo -> {
                cultivo.setActivo(false);
                this.cultivoRepository.save(cultivo);
            });
        }
        return "Cultivo eliminado correctamente ID:" + id;
    }
}


