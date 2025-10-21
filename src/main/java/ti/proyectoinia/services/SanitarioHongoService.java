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

    public List<SanitarioHongoDto> crearMultiplesHongos(List<SanitarioHongoDto> dtos) {
        List<SanitarioHongo> entities = dtos.stream()
                .map(mapsDtoEntityService::mapToEntitySanitarioHongo)
                .collect(Collectors.toList());
        List<SanitarioHongo> guardadas = sanitarioHongoRepository.saveAll(entities);
        return guardadas.stream()
                .map(mapsDtoEntityService::mapToDtoSanitarioHongo)
                .collect(Collectors.toList());
    }

    public java.util.Map<String, Object> editarMultiplesHongos(List<SanitarioHongoDto> dtos) {
        List<SanitarioHongoDto> edited = new java.util.ArrayList<>();
        List<SanitarioHongoDto> created = new java.util.ArrayList<>();
        List<Map<String, Object>> errors = new java.util.ArrayList<>();
        List<SanitarioHongoDto> toCreate = new java.util.ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            SanitarioHongoDto dto = dtos.get(i);
            if (dto.getId() == null) {
                dto.setId(null);
                toCreate.add(dto);
                continue;
            }
            if (!sanitarioHongoRepository.existsById(dto.getId())) {
                dto.setId(null);
                toCreate.add(dto);
                continue;
            }
            try {
                SanitarioHongo entity = mapsDtoEntityService.mapToEntitySanitarioHongo(dto);
                SanitarioHongo saved = sanitarioHongoRepository.save(entity);
                SanitarioHongoDto savedDto = mapsDtoEntityService.mapToDtoSanitarioHongo(saved);
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
                List<SanitarioHongoDto> creadas = crearMultiplesHongos(toCreate);
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
     * Elimina (soft-delete) múltiples hongos por id: marca activo = false.
     * Retorna lista de ids eliminados y lista de ids no encontrados.
     */
    public Map<String, Object> eliminarMultiplesHongos(List<Long> ids) {
        List<Long> deleted = new java.util.ArrayList<>();
        List<Long> notFound = new java.util.ArrayList<>();

        for (Long id : ids) {
            if (id == null) continue;
            if (!sanitarioHongoRepository.existsById(id)) {
                notFound.add(id);
                continue;
            }
            try {
                sanitarioHongoRepository.deleteById(id);
                deleted.add(id);
            } catch (Exception ex) {
                notFound.add(id);
            }
        }

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("deleted", deleted);
        resp.put("notFound", notFound);
        return resp;
    }
}
