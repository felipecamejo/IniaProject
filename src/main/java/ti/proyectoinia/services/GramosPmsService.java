package ti.proyectoinia.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        List<GramosPms> lista = repository.findByPmsIdAndActivoTrue(pmsId);
        return lista.stream()
                .map(mapsDtoEntityService::mapToDtoGramosPms)
                .collect(Collectors.toList());
    }

    public List<GramosPmsDto> crearMultiplesGramos(List<GramosPmsDto> dtos) {
        List<GramosPms> entities = dtos.stream()
                .map(mapsDtoEntityService::mapToEntityGramosPms)
                .collect(Collectors.toList());
        List<GramosPms> guardadas = repository.saveAll(entities);
        return guardadas.stream()
                .map(mapsDtoEntityService::mapToDtoGramosPms)
                .collect(Collectors.toList());
    }

    public java.util.Map<String, Object> editarMultiplesGramos(List<GramosPmsDto> dtos) {
        java.util.List<GramosPmsDto> edited = new java.util.ArrayList<>();
        java.util.List<GramosPmsDto> created = new java.util.ArrayList<>();
        java.util.List<java.util.Map<String, Object>> errors = new java.util.ArrayList<>();

        // Collect those that must be created (id == null or id not found)
        java.util.List<GramosPmsDto> toCreate = new java.util.ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            GramosPmsDto dto = dtos.get(i);

            if (dto.getId() == null) {
                dto.setId(null);
                toCreate.add(dto);
                continue;
            }

            if (!repository.existsById(dto.getId())) {
                dto.setId(null);
                toCreate.add(dto);
                continue;
            }

            try {
                GramosPms entity = mapsDtoEntityService.mapToEntityGramosPms(dto);
                GramosPms saved = repository.save(entity);
                GramosPmsDto savedDto = mapsDtoEntityService.mapToDtoGramosPms(saved);
                edited.add(savedDto);
            } catch (Exception ex) {
                java.util.Map<String, Object> err = new java.util.HashMap<>();
                err.put("index", i);
                err.put("message", "Error al editar: " + ex.getMessage());
                err.put("dto", dto);
                errors.add(err);
            }
        }

        if (!toCreate.isEmpty()) {
            try {
                List<GramosPmsDto> creadas = crearMultiplesGramos(toCreate);
                if (creadas != null && !creadas.isEmpty()) {
                    created.addAll(creadas);
                }
            } catch (Exception ex) {
                java.util.Map<String, Object> err = new java.util.HashMap<>();
                err.put("message", "Error al crear elementos durante la edición múltiple: " + ex.getMessage());
                errors.add(err);
            }
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("edited", edited);
        result.put("created", created);
        result.put("errors", errors);
        return result;
    }

    /**
     * Elimina (soft-delete) múltiples gramos por id: marca activo = false.
     * Retorna lista de ids eliminados y lista de ids no encontrados.
     */
    public java.util.Map<String, Object> eliminarMultiplesGramos(java.util.List<Long> ids) {
        java.util.List<Long> deleted = new java.util.ArrayList<>();
        java.util.List<Long> notFound = new java.util.ArrayList<>();

        for (Long id : ids) {
            if (id == null) continue;
            if (!repository.existsById(id)) {
                notFound.add(id);
                continue;
            }
            GramosPms g = repository.findById(id).orElse(null);
            if (g == null) {
                notFound.add(id);
                continue;
            }
            g.setActivo(false);
            repository.save(g);
            deleted.add(id);
        }

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("deleted", deleted);
        resp.put("notFound", notFound);
        return resp;
    }
}
