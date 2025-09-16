package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.DOSN;
import ti.proyectoinia.business.repositories.DOSNRepository;
import ti.proyectoinia.dtos.DOSNDto;


@Service
public class DOSNService {

    private final DOSNRepository dosnRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public DOSNService(DOSNRepository dosnRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.dosnRepository = dosnRepository;
    }

    public String crearDOSN(DOSNDto dosnDto) {
        this.dosnRepository.save(mapsDtoEntityService.mapToEntityDOSN(dosnDto));
        return "DOSN creada correctamente";
    }

    public DOSNDto obtenerDOSNPorId(Long id) {
        DOSN DOSN = this.dosnRepository.findById(id).orElse(null);
        if (DOSN == null || !DOSN.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoDOSN(DOSN);
    }

    public String eliminarDOSN(Long id) {
        this.dosnRepository.deleteById(id);
        return "DOSN eliminada correctamente";
    }

    public String editarDOSN(DOSNDto dosnDto) {
        this.dosnRepository.save(mapsDtoEntityService.mapToEntityDOSN(dosnDto));
        return "DOSN actualizada correctamente";
    }

}
