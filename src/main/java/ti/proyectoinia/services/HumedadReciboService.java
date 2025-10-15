package ti.proyectoinia.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ti.proyectoinia.dtos.HumedadReciboDto;
import ti.proyectoinia.business.entities.HumedadRecibo;
import ti.proyectoinia.business.repositories.HumedadReciboRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HumedadReciboService {

    @Autowired
    private HumedadReciboRepository humedadReciboRepository;
    @Autowired
    private MapsDtoEntityService mapsDtoEntityService;

    public List<HumedadReciboDto> obtenerHumedadesPorRecibo(Long reciboId) {
        List<HumedadRecibo> lista = humedadReciboRepository.findByActivoTrueAndReciboId(reciboId);
        return lista.stream()
                .map(mapsDtoEntityService::mapToDtoHumedadRecibo)
                .collect(Collectors.toList());
    }

    public List<HumedadReciboDto> crearMultiplesHumedades(List<HumedadReciboDto> dtos) {
        List<HumedadRecibo> entities = dtos.stream()
                .map(mapsDtoEntityService::mapToEntityHumedadRecibo)
                .collect(Collectors.toList());
        List<HumedadRecibo> guardadas = humedadReciboRepository.saveAll(entities);
        return guardadas.stream()
                .map(mapsDtoEntityService::mapToDtoHumedadRecibo)
                .collect(Collectors.toList());
    }

    public java.util.Map<String, Object> editarMultiplesHumedades(List<HumedadReciboDto> dtos) {
        java.util.List<HumedadReciboDto> edited = new java.util.ArrayList<>();
        java.util.List<HumedadReciboDto> created = new java.util.ArrayList<>();
        java.util.List<java.util.Map<String, Object>> errors = new java.util.ArrayList<>();

        // Collect those that must be created (id == null or id not found)
        java.util.List<HumedadReciboDto> toCreate = new java.util.ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            HumedadReciboDto dto = dtos.get(i);

            // If id is null -> treat as new
            if (dto.getId() == null) {
                // ensure id is null for creation
                dto.setId(null);
                toCreate.add(dto);
                continue;
            }

            // If id provided but not present in DB -> treat as new (create)
            if (!humedadReciboRepository.existsById(dto.getId())) {
                dto.setId(null);
                toCreate.add(dto);
                continue;
            }

            // Otherwise try to edit
            try {
                HumedadRecibo entity = mapsDtoEntityService.mapToEntityHumedadRecibo(dto);
                HumedadRecibo saved = humedadReciboRepository.save(entity);
                HumedadReciboDto savedDto = mapsDtoEntityService.mapToDtoHumedadRecibo(saved);
                edited.add(savedDto);
            } catch (Exception ex) {
                java.util.Map<String, Object> err = new java.util.HashMap<>();
                err.put("index", i);
                err.put("message", "Error al editar: " + ex.getMessage());
                err.put("dto", dto);
                errors.add(err);
            }
        }

        // If there are items to create, call crearMultiplesHumedades
        if (!toCreate.isEmpty()) {
            try {
                List<HumedadReciboDto> creadas = crearMultiplesHumedades(toCreate);
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
         * Elimina (soft-delete) múltiples humedades por id: marca activo = false.
         * Retorna lista de ids eliminados y lista de ids no encontrados.
         */
        public java.util.Map<String, Object> eliminarMultiplesHumedades(java.util.List<Long> ids) {
            java.util.List<Long> deleted = new java.util.ArrayList<>();
            java.util.List<Long> notFound = new java.util.ArrayList<>();

            for (Long id : ids) {
                if (id == null) continue;
                if (!humedadReciboRepository.existsById(id)) {
                    notFound.add(id);
                    continue;
                }
                HumedadRecibo h = humedadReciboRepository.findById(id).orElse(null);
                if (h == null) {
                    notFound.add(id);
                    continue;
                }
                h.setActivo(false);
                humedadReciboRepository.save(h);
                deleted.add(id);
            }

            java.util.Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("deleted", deleted);
            resp.put("notFound", notFound);
            return resp;
        }
}
