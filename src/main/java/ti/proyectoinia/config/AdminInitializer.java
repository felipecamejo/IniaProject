package ti.proyectoinia.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import ti.proyectoinia.business.entities.RolUsuario;
import ti.proyectoinia.dtos.UsuarioDto;
import ti.proyectoinia.services.UsuarioService;

/**
 * Componente que se ejecuta automáticamente al iniciar la aplicación
 * para asegurar que existe al menos un usuario ADMIN en el sistema
 */
@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    @Autowired
    private UsuarioService usuarioService;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Verificando existencia de usuario admin...");
        
        try {
            // Verificar si existe al menos un admin activo
            boolean existeAdmin = usuarioService.existeAdminActivo();
            
            if (existeAdmin) {
                logger.info("✓ Ya existe al menos un usuario admin activo en el sistema");
                return;
            }
            
            // No existe ningún admin, crear uno por defecto
            logger.warn("⚠ No se encontró ningún usuario admin activo. Creando usuario admin por defecto...");
            
            UsuarioDto adminDto = new UsuarioDto();
            adminDto.setEmail("admin@inia.com");
            adminDto.setNombre("Administrador");
            adminDto.setPassword("password123"); // El servicio se encargará de encriptarla
            adminDto.setTelefono("+598-099-000-001");
            adminDto.setActivo(true);
            adminDto.setRol(RolUsuario.ADMIN);
            adminDto.setLotesId(null);
            
            try {
                usuarioService.crearUsuario(adminDto);
                logger.info("✓ Usuario admin por defecto creado exitosamente");
                logger.info("  Email: admin@inia.com");
                logger.info("  Contraseña: password123");
            } catch (IllegalArgumentException e) {
                // El usuario ya existe pero puede estar inactivo
                logger.warn("El usuario admin@inia.com ya existe: {}", e.getMessage());
            }
            
        } catch (Exception e) {
            logger.error("Error al verificar/crear usuario admin: {}", e.getMessage(), e);
            // No lanzar excepción para que la aplicación pueda iniciar
        }
    }
}

