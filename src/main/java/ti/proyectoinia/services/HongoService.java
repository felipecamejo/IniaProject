package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoHongos;
import ti.proyectoinia.business.entities.Hongo;
import ti.proyectoinia.business.repositories.HongoRepository;
import ti.proyectoinia.dtos.HongoDto;

@Service
public class HongoService {

    private final HongoRepository hongoRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public HongoService(HongoRepository hongoRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.hongoRepository = hongoRepository;
    }

    public String crearHongo(HongoDto hongoDto) {
        this.hongoRepository.save(mapsDtoEntityService.mapToEntityHongo(hongoDto));
        return "Hongo creado correctamente";
    }

    public HongoDto obtenerHongoPorId(Long id) {
        Hongo hongo = this.hongoRepository.findById(id).orElse(null);
        if (hongo == null || !hongo.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoHongo(hongo);
    }

    public String eliminarHongo(Long id) {
        this.hongoRepository.deleteById(id);
        return "Hongo eliminado correctamente";
    }

    public String editarHongo(HongoDto hongoDto) {
        this.hongoRepository.save(mapsDtoEntityService.mapToEntityHongo(hongoDto));
        return "Hongo actualizado correctamente";
    }

    public ResponseEntity<ResponseListadoHongos> listadoHongos() {
        ResponseListadoHongos responseListadoHongos = (ResponseListadoHongos) this.hongoRepository.findByActivoTrue();
        return ResponseEntity.ok(responseListadoHongos);
    }
}
