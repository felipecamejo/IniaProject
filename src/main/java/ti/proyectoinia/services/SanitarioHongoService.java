package ti.proyectoinia.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.SanitarioHongo;
import ti.proyectoinia.business.repositories.SanitarioHongoRepository;
import ti.proyectoinia.dtos.SanitarioHongoDto;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SanitarioHongoService {

    @Autowired
    private SanitarioHongoRepository sanitarioHongoRepository;
    @Autowired
    private MapsDtoEntityService mapsDtoEntityService;

    public List<SanitarioHongoDto> obtenerSanitarioHongoPorSanitario(Long sanitarioId) {
        List<SanitarioHongo> lista = sanitarioHongoRepository.findBySanitarioId(sanitarioId);
        return lista.stream()
                .map(mapsDtoEntityService::mapToDtoSanitarioHongo)
                .collect(Collectors.toList());
    }
}
