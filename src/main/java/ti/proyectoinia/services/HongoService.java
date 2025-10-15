package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoHongos;
import ti.proyectoinia.api.responses.ResponseListadoMalezas;
import ti.proyectoinia.api.responses.ResponseListadoUsuarios;
import ti.proyectoinia.business.entities.Hongo;
import ti.proyectoinia.business.repositories.HongoRepository;
import ti.proyectoinia.dtos.HongoDto;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HongoService {

    private final HongoRepository hongoRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public HongoService(HongoRepository hongoRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.hongoRepository = hongoRepository;
    }

    public String crearHongo(HongoDto hongoDto) {
        return "Hongo creado correctamente ID:" + hongoDto.getId();
    }

    public HongoDto obtenerHongoPorId(Long id) {
        Hongo hongo = this.hongoRepository.findById(id).orElse(null);
        if (hongo == null || !hongo.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoHongo(hongo);
    }

    public String eliminarHongo(Long id) {
        if (id != null) {
            this.hongoRepository.findById(id).ifPresent(hongo -> {
                hongo.setActivo(false);
                this.hongoRepository.save(hongo);
            });
        }
        return "Hongo eliminado correctamente ID:" + id;
    }

    public String editarHongo(HongoDto hongoDto) {
        this.hongoRepository.save(mapsDtoEntityService.mapToEntityHongo(hongoDto));
        return "Hongo actualizado correctamente ID:" + hongoDto.getId();
    }

    public ResponseEntity<ResponseListadoHongos> listadoHongos() {
        var hongosActivos = this.hongoRepository.findByActivoTrue();
        var hongosDto = hongosActivos.stream()
                .map(mapsDtoEntityService::mapToDtoHongo)
                .toList();
        ResponseListadoHongos responseListadoHongos = new ResponseListadoHongos(hongosDto);
        return ResponseEntity.ok(responseListadoHongos);
    }
}
