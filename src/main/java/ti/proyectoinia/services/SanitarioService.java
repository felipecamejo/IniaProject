package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.Sanitario;
import ti.proyectoinia.business.repositories.SanitarioRepository;
import ti.proyectoinia.dtos.SanitarioDto;

@Service
public class SanitarioService {

    private final SanitarioRepository sanitarioRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public SanitarioService(SanitarioRepository sanitarioRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.sanitarioRepository = sanitarioRepository;
    }

    public String crearSanitario(SanitarioDto sanitarioDto) {
        this.sanitarioRepository.save(mapsDtoEntityService.mapToEntitySanitario(sanitarioDto));
        return "Sanitario creado correctamente";
    }

    public SanitarioDto obtenerSanitarioPorId(Long id) {
        Sanitario sanitario = this.sanitarioRepository.findById(id).orElse(null);
        if (sanitario == null || !sanitario.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoSanitario(sanitario);
    }

    public String editarSanitario(SanitarioDto sanitarioDto) {
        this.sanitarioRepository.save(mapsDtoEntityService.mapToEntitySanitario(sanitarioDto));
        return "Sanitario actualizado correctamente";
    }

    public String eliminarSanitario(Long id) {
        this.sanitarioRepository.deleteById(id);
        return "Sanitario eliminado correctamente";
    }

}
