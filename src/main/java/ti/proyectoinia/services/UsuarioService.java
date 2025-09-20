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
        return "Usuario creado correctamente ID:" + usuarioDto.getId();
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
        return "Usuario eliminado correctamente ID:" + id;
    }

    public String editarUsuario(UsuarioDto usuarioDto) {
        // Validar que no exista otro usuario activo con el mismo email
        Usuario usuarioExistente = this.usuarioRepository.findByEmailAndActivoTrue(usuarioDto.getEmail());
        if (usuarioExistente != null && !usuarioExistente.getId().equals(usuarioDto.getId())) {
            throw new IllegalArgumentException("Ya existe un usuario activo con el email: " + usuarioDto.getEmail());
        }
        
        // Obtener el usuario existente para preservar la contraseña si no se proporciona una nueva
        Usuario usuarioActual = this.usuarioRepository.findById(usuarioDto.getId()).orElse(null);
        if (usuarioActual != null) {
            // Si no se proporciona contraseña o está vacía, mantener la contraseña actual
            if (usuarioDto.getPassword() == null || usuarioDto.getPassword().trim().isEmpty()) {
                usuarioDto.setPassword(usuarioActual.getPassword());
            }
        }
        
        this.usuarioRepository.save(mapsDtoEntityService.mapToEntityUsuario(usuarioDto));
        return "Usuario actualizado correctamente ID:" + usuarioDto.getId();
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