package ti.proyectoinia.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoLotes;
import ti.proyectoinia.business.entities.Lote;
import ti.proyectoinia.business.repositories.LoteRepository;
import ti.proyectoinia.business.repositories.UsuarioRepository;
import ti.proyectoinia.dtos.LoteDto;
import ti.proyectoinia.utils.SecurityUtils;

import java.util.List;

@Service
public class LoteService {

    private final LoteRepository loteRepository;
    private final MapsDtoEntityService mapsDtoEntityService;
    private final UsuarioRepository usuarioRepository;
    
    @Autowired
    private SecurityUtils securityUtils;

    public LoteService(LoteRepository loteRepository, MapsDtoEntityService mapsDtoEntityService, UsuarioRepository usuarioRepository) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.loteRepository = loteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public String crearLote(LoteDto loteDto) {
        // Auto-asignar el usuario logueado al lote
        autoAsignarUsuarioAlLote(loteDto);
        
        Lote lote = mapsDtoEntityService.mapToEntityLote(loteDto);
        Lote loteGuardado = this.loteRepository.save(lote);
        
        return "Lote creado correctamente ID:" + loteGuardado.getId();
    }

    /**
     * Auto-asigna el usuario autenticado al lote si no hay usuarios asignados
     */
    private void autoAsignarUsuarioAlLote(LoteDto loteDto) {
        // Solo auto-asignar si no hay usuarios ya asignados
        if (loteDto.getUsuariosId() == null || loteDto.getUsuariosId().isEmpty()) {
            String emailUsuario = securityUtils.getCurrentUserEmail();
            if (emailUsuario != null) {
                usuarioRepository.findByEmail(emailUsuario).ifPresent(usuario -> {
                    loteDto.setUsuariosId(List.of(usuario.getId()));
                });
            }
        }
    }

    public LoteDto obtenerLotePorId(Long id) {
        Lote lote = this.loteRepository.findById(id).orElse(null);
        if (lote == null || !lote.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoLote(lote);
    }

    public String eliminarLote(Long id) {
        if (id != null) {
            this.loteRepository.findById(id).ifPresent(lote -> {
                lote.setActivo(false);
                this.loteRepository.save(lote);
            });
        }
        return "Lote eliminado correctamente ID:" + id;
    }

    public String editarLote(LoteDto loteDto) {
        this.loteRepository.save(mapsDtoEntityService.mapToEntityLote(loteDto));
        return "Lote actualizado correctamente ID:" + loteDto.getId();
    }

    public ResponseEntity<ResponseListadoLotes> listadoLotes() {
        var lotesActivos = this.loteRepository.findByActivoTrue();
        var lotesDto = lotesActivos.stream()
                .map(mapsDtoEntityService::mapToDtoLote)
                .toList();
        ResponseListadoLotes responseListadoLotes = new ResponseListadoLotes(lotesDto);
        return ResponseEntity.ok(responseListadoLotes);
    }
}


