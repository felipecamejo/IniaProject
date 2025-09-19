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
        Usuario usuario = this.usuarioRepository.findById(id).orElse(null);
        if (usuario == null || !usuario.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoUsuario(usuario);
    }

    public String eliminarUsuario(Long id) {
        if (id != null) {
            this.usuarioRepository.findById(id).ifPresent(usuario -> {
                usuario.setActivo(false);
                this.usuarioRepository.save(usuario);
            });
        }
        return "Usuario eliminado correctamente";
    }

    public String editarUsuario(UsuarioDto usuarioDto) {
        this.usuarioRepository.save(mapsDtoEntityService.mapToEntityUsuario(usuarioDto));
        return "Usuario actualizado correctamente";
    }

    public ResponseEntity<ResponseListadoUsuarios> listadoUsuarios() {
        var usuariosActivos = this.usuarioRepository.findByActivoTrue();
        var usuariosDto = usuariosActivos.stream()
                .map(mapsDtoEntityService::mapToDtoUsuario)
                .toList();
        ResponseListadoUsuarios responseListadoUsuarios = new ResponseListadoUsuarios(usuariosDto);
        return ResponseEntity.ok(responseListadoUsuarios);
    }
}