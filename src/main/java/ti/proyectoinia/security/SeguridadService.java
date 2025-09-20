package ti.proyectoinia.security;

import ti.proyectoinia.business.entities.Usuario;
import ti.proyectoinia.business.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
public class SeguridadService {

    private static final Logger logger = LoggerFactory.getLogger(SeguridadService.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Optional<Usuario> autenticarUsuario(String email,
                                               String password) {
        logger.info("Intentando autenticar usuario con email: {}", email);
        
        Optional<Usuario> objUsuario = usuarioRepository.findByEmail(email);

        if (objUsuario.isEmpty()) {
            logger.warn("Usuario no encontrado con email: {}", email);
            return Optional.empty();
        }
        
        Usuario usuario = objUsuario.get();
        logger.info("Usuario encontrado: {} - Activo: {}", usuario.getNombre(), usuario.isActivo());
        
        if (!usuario.isActivo()) {
            logger.warn("Usuario inactivo: {}", email);
            return Optional.empty();
        }
        
        logger.info("Verificando contraseña para usuario: {}", email);
        boolean passwordMatch = passwordEncoder.matches(password, usuario.getPassword());
        logger.info("Contraseña coincide: {}", passwordMatch);
        
        if (!passwordMatch) {
            logger.warn("Contraseña incorrecta para usuario: {}", email);
            return Optional.empty();
        }
        
        logger.info("Autenticación exitosa para usuario: {}", email);
        return objUsuario;
    }

    public String[] listarRolesPorUsuario(Usuario usuario) {
        if (usuario.getRol() != null) {
            return new String[]{usuario.getRol().name()};
        }
        return new String[0];
    }
}
