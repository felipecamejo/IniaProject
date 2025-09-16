package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoUsuarios;
import ti.proyectoinia.business.entities.Usuario;
import ti.proyectoinia.business.repositories.UsuarioRepository;
import ti.proyectoinia.dtos.UsuarioDto;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public UsuarioService(UsuarioRepository usuarioRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.usuarioRepository = usuarioRepository;
    }

    public String crearUsuario(UsuarioDto usuarioDto) {
        this.usuarioRepository.save(mapsDtoEntityService.mapToEntityUsuario(usuarioDto));
        return "Usuario creado correctamente";
    }

    public UsuarioDto obtenerUsuarioPorId(Long id) {
        Usuario usuario = this.usuarioRepository.findById(id == null ? null : id.intValue()).orElse(null);
        if (usuario == null || !usuario.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoUsuario(usuario);
    }

    public String eliminarUsuario(Long id) {
        if (id != null) {
            this.usuarioRepository.deleteById(id.intValue());
        }
        return "Usuario eliminado correctamente";
    }

    public String editarUsuario(UsuarioDto usuarioDto) {
        this.usuarioRepository.save(mapsDtoEntityService.mapToEntityUsuario(usuarioDto));
        return "Usuario actualizado correctamente";
    }

    public ResponseEntity<ResponseListadoUsuarios> listadoUsuarios() {
        ResponseListadoUsuarios responseListadoUsuarios = (ResponseListadoUsuarios) this.usuarioRepository.findByActivoTrue();
        return ResponseEntity.ok(responseListadoUsuarios);
    }
}


