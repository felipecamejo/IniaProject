package ti.proyectoinia.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ti.proyectoinia.business.entities.GramosPms;
import ti.proyectoinia.business.repositories.GramosPmsRepository;
import ti.proyectoinia.dtos.GramosPmsDto;
@Service
public class GramosPmsService {

    @Autowired
    private GramosPmsRepository repository;

    @Autowired
    private MapsDtoEntityService mapsDtoEntityService;

    public List<GramosPmsDto> obtenerGramosPorPms(Long pmsId) {
        List<GramosPms> lista = repository.findByPmsId(pmsId);
        return lista.stream()
                .map(mapsDtoEntityService::mapToDtoGramosPms)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<GramosPmsDto> crearMultiplesGramos(List<GramosPmsDto> dtos) {
        // Si no vienen dtos, no hay nada que crear: solo devolver lista vacía
        if (dtos == null || dtos.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        // Determinar el pmsId esperado (asumimos que todos los DTOs pertenecen al mismo PMS)
        Long pmsId = dtos.stream()
                .map(GramosPmsDto::getPmsId)
                .filter(java.util.Objects::nonNull)
                .findFirst()
                .orElse(null);

        if (pmsId == null) {
            throw new IllegalArgumentException("Los GramosPmsDto deben contener pmsId");
        }

        // Borrar físicamente todos los existentes para este pms
        repository.deleteByPmsId(pmsId);

        // Crear las nuevas entidades recibidas
        List<GramosPms> entities = dtos.stream()
                .map(mapsDtoEntityService::mapToEntityGramosPms)
                .collect(Collectors.toList());
        // Asegurar que el pmsId en las entidades esté seteado (por si no viene en algún DTO)
        for (GramosPms e : entities) {
            if (e.getPmsId() == null) {
                e.setPmsId(pmsId);
            }
        }

        List<GramosPms> guardadas = repository.saveAll(entities);
        return guardadas.stream()
                .map(mapsDtoEntityService::mapToDtoGramosPms)
                .collect(Collectors.toList());
    }


}
