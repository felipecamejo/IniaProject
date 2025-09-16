package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.DOSN;
import ti.proyectoinia.business.repositories.DOSNRepository;
import ti.proyectoinia.dtos.DOSNDto;


@Service
public class DOSNService {

    private final DOSNRepository DOSNRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public DOSNService(DOSNRepository DOSNRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.DOSNRepository = DOSNRepository;
    }

    public String crearDOSN(DOSNDto DOSNDto) {
        this.DOSNRepository.save(mapsDtoEntityService.mapToEntityDOSN(DOSNDto));
        return "DOSN creada correctamente";
    }

    public DOSNDto obtenerDOSNPorId(Long id) {
        DOSN DOSN = this.DOSNRepository.findById(id).orElse(null);
        if (DOSN == null || !DOSN.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoDOSN(DOSN);
    }

    public String eliminarDOSN(Long id) {
        this.DOSNRepository.deleteById(id);
        return "DOSN eliminada correctamente";
    }

    public String editarDOSN(DOSNDto DOSNDto) {
        this.DOSNRepository.save(mapsDtoEntityService.mapToEntityDOSN(DOSNDto));
        return "DOSN actualizada correctamente";
    }

}
