package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoUsuarios;
import ti.proyectoinia.business.entities.Usuario;
import ti.proyectoinia.business.repositories.UsuarioRepository;
import ti.proyectoinia.dtos.UsuarioDto;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public UsuarioService(UsuarioRepository usuarioRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.usuarioRepository = usuarioRepository;
    }

    public String crearUsuario(UsuarioDto usuarioDto) {
        // Validar que no exista otro usuario activo con el mismo email
        Usuario usuarioExistente = this.usuarioRepository.findByEmailAndActivoTrue(usuarioDto.getEmail());
        if (usuarioExistente != null) {
            throw new IllegalArgumentException("Ya existe un usuario activo con el email: " + usuarioDto.getEmail());
        }

        return "Usuario creado correctamente ID:" + this.usuarioRepository.save(mapsDtoEntityService.mapToEntityUsuario(usuarioDto)).getId();
    }

    public UsuarioDto obtenerUsuarioPorId(Long id) {
        Usuario usuario = this.usuarioRepository.findById(id).orElse(null);
        if (usuario == null || !usuario.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoUsuarioSinPassword(usuario);  // ✅ Sin contraseña por seguridad
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
        // Validar que no exista otro usuario activo con el mismo email (solo usuarios no borrados lógicamente)
        Usuario usuarioExistente = this.usuarioRepository.findByEmailAndActivoTrue(usuarioDto.getEmail());
        if (usuarioExistente != null && !usuarioExistente.getId().equals(usuarioDto.getId())) {
            throw new IllegalArgumentException("Ya existe un usuario activo con el email: " + usuarioDto.getEmail() + 
                ". Solo se consideran usuarios que no han sido eliminados lógicamente.");
        }
        
        // Obtener el usuario existente para preservar la contraseña si no se proporciona una nueva
        Usuario usuarioActual = this.usuarioRepository.findById(usuarioDto.getId()).orElse(null);
        if (usuarioActual == null) {
            throw new IllegalArgumentException("Usuario no encontrado con ID: " + usuarioDto.getId());
        }
        
        // Lógica de contraseña corregida: solo cambiar si se proporciona una nueva válida
        if (usuarioDto.getPassword() == null || 
            usuarioDto.getPassword().trim().isEmpty()) {
            // NO modificar la contraseña en el DTO, dejarla null para que no se encripte de nuevo
            usuarioDto.setPassword(null);
        }
        // Si la contraseña es válida, se mantiene para ser encriptada en mapToEntityUsuario
        
        Usuario usuarioActualizado = mapsDtoEntityService.mapToEntityUsuario(usuarioDto);
        
        // Si la contraseña es null, mantener la contraseña actual del usuario existente
        if (usuarioActualizado.getPassword() == null) {
            usuarioActualizado.setPassword(usuarioActual.getPassword());
        }
        
        this.usuarioRepository.save(usuarioActualizado);
        return "Usuario actualizado correctamente ID:" + usuarioDto.getId();
    }

    public UsuarioDto obtenerUsuarioPorEmail(String email) {
        Usuario usuario = this.usuarioRepository.findByEmailAndActivoTrue(email);
        if (usuario == null) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoUsuarioSinPassword(usuario);  // ✅ Sin contraseña por seguridad
    }

    public ResponseEntity<ResponseListadoUsuarios> listadoUsuarios() {
        var usuariosActivos = this.usuarioRepository.findByActivoTrue();
        var usuariosDto = usuariosActivos.stream()
                .map(mapsDtoEntityService::mapToDtoUsuarioSinPassword)  // ✅ Sin contraseña por seguridad
                .toList();
        ResponseListadoUsuarios responseListadoUsuarios = new ResponseListadoUsuarios(usuariosDto);
        return ResponseEntity.ok(responseListadoUsuarios);
    }

    public String extraerEmailDelToken(String token) {
        try {
            // Remover "Bearer " del token si está presente
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            // Decodificar el token JWT
            Claims claims = Jwts.parser()
                    .setSigningKey("iniaSecretKey") // Usar la misma clave que en SeguridadController
                    .parseClaimsJws(token)
                    .getBody();
            
            return claims.getSubject(); // El email está en el subject del token
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Verifica si existe al menos un usuario ADMIN activo en el sistema
     * @return true si existe al menos un admin activo, false en caso contrario
     */
    public boolean existeAdminActivo() {
        List<Usuario> admins = this.usuarioRepository.findByRolAndActivoTrue(ti.proyectoinia.business.entities.RolUsuario.ADMIN);
        return admins != null && !admins.isEmpty();
    }
}