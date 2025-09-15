package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
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
}
