package ti.proyectoinia.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ti.proyectoinia.business.entities.ViabilidadRepsTetrazolio;
import ti.proyectoinia.business.repositories.ViabilidadRepsTetrazolioRepository;
import ti.proyectoinia.dtos.ViabilidadRepsTetrazolioDto;
@Service
public class ViabilidadRepsTetrazolioService {

    @Autowired
    private ViabilidadRepsTetrazolioRepository repository;

    @Autowired
    private MapsDtoEntityService mapsDtoEntityService;

    public List<ViabilidadRepsTetrazolioDto> obtenerViabilidadPorTetrazolio(Long tetrazolioId) {
        List<ViabilidadRepsTetrazolio> lista = repository.findByTetrazolioIdAndActivoTrue(tetrazolioId);
        return lista.stream()
                .map(mapsDtoEntityService::mapToDtoViabilidadRepsTetrazolio)
                .collect(Collectors.toList());
    }

    public List<ViabilidadRepsTetrazolioDto> crearMultiplesViabilidad(List<ViabilidadRepsTetrazolioDto> dtos) {
    List<ViabilidadRepsTetrazolio> entities = dtos.stream()
        .map(mapsDtoEntityService::mapToEntityViabilidadRepsTetrazolio)
        .collect(Collectors.toList());
    List<ViabilidadRepsTetrazolio> guardadas = repository.saveAll(entities);
    return guardadas.stream()
        .map(mapsDtoEntityService::mapToDtoViabilidadRepsTetrazolio)
        .collect(Collectors.toList());
    }

    public java.util.Map<String, Object> editarMultiplesViabilidad(List<ViabilidadRepsTetrazolioDto> dtos) {
        java.util.List<ViabilidadRepsTetrazolioDto> edited = new java.util.ArrayList<>();
        java.util.List<ViabilidadRepsTetrazolioDto> created = new java.util.ArrayList<>();
        java.util.List<java.util.Map<String, Object>> errors = new java.util.ArrayList<>();

        // Collect those that must be created (id == null or id not found)
        java.util.List<ViabilidadRepsTetrazolioDto> toCreate = new java.util.ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            ViabilidadRepsTetrazolioDto dto = dtos.get(i);

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
                ViabilidadRepsTetrazolio entity = mapsDtoEntityService.mapToEntityViabilidadRepsTetrazolio(dto);
                ViabilidadRepsTetrazolio saved = repository.save(entity);
                ViabilidadRepsTetrazolioDto savedDto = mapsDtoEntityService.mapToDtoViabilidadRepsTetrazolio(saved);
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
                List<ViabilidadRepsTetrazolioDto> creadas = crearMultiplesViabilidad(toCreate);
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
     * Elimina (soft-delete) múltiples Viabilidad por id: marca activo = false.
     * Retorna lista de ids eliminados y lista de ids no encontrados.
     */
    public java.util.Map<String, Object> eliminarMultiplesViabilidad(java.util.List<Long> ids) {
        java.util.List<Long> deleted = new java.util.ArrayList<>();
        java.util.List<Long> notFound = new java.util.ArrayList<>();

        for (Long id : ids) {
            if (id == null) continue;
            if (!repository.existsById(id)) {
                notFound.add(id);
                continue;
            }
            ViabilidadRepsTetrazolio v = repository.findById(id).orElse(null);
            if (v == null) {
                notFound.add(id);
                continue;
            }
            v.setActivo(false);
            repository.save(v);
            deleted.add(id);
        }

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("deleted", deleted);
        resp.put("notFound", notFound);
        return resp;
    }
}
