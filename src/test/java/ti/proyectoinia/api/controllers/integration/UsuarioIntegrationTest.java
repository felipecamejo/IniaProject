package ti.proyectoinia.api.controllers.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import ti.proyectoinia.dtos.UsuarioDto;
import ti.proyectoinia.business.entities.RolUsuario;
import ti.proyectoinia.services.UsuarioService;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test de integración para UsuarioController usando Testcontainers.
 * 
 * Este test usa una base de datos PostgreSQL real en un contenedor Docker,
 * lo que permite probar la integración completa entre el controlador,
 * los servicios y la base de datos.
 * 
 * Características:
 * - Usa Testcontainers para crear una base de datos PostgreSQL real
 * - Ejecuta transacciones reales en la base de datos
 * - Verifica el comportamiento completo del sistema
 * - Limpia la base de datos entre tests usando @Transactional
 */
@AutoConfigureMockMvc
@Transactional
@DisplayName("Tests de Integración de Usuario con Testcontainers")
class UsuarioIntegrationTest extends AbstractTestcontainersIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioService usuarioService;

    private final ObjectMapper mapper = new ObjectMapper();
    private final String baseUrl = "/api/v1/usuario";

    @BeforeEach
    void setUp() {
        // La base de datos se limpia automáticamente con @Transactional
        // No es necesario limpiar manualmente
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("Debería crear un usuario en la base de datos real")
    void crearUsuario_ConBaseDeDatosReal_DeberiaCrearCorrectamente() throws Exception {
        // Arrange
        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setNombre("Usuario Test");
        usuarioDto.setEmail("test@inia.com");
        usuarioDto.setPassword("password123");
        usuarioDto.setRol(RolUsuario.ANALISTA);
        usuarioDto.setActivo(true);

        // Act & Assert
        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(usuarioDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$").exists());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("Debería obtener un usuario creado en la base de datos")
    void obtenerUsuario_ConUsuarioCreado_DeberiaRetornarUsuario() throws Exception {
        // Arrange - Crear usuario primero
        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setNombre("Usuario para Obtener");
        usuarioDto.setEmail("obtener@inia.com");
        usuarioDto.setPassword("password123");
        usuarioDto.setRol(RolUsuario.ANALISTA);
        usuarioDto.setActivo(true);

       
        // Obtener el ID del usuario creado (asumiendo que el servicio retorna el ID)
        // En este caso, necesitarías ajustar según tu implementación del servicio
        
        // Act & Assert - Buscar por email
        mockMvc.perform(get(baseUrl + "/perfil/obtener@inia.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("obtener@inia.com"))
                .andExpect(jsonPath("$.nombre").value("Usuario para Obtener"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("Debería actualizar un usuario en la base de datos")
    void actualizarUsuario_ConUsuarioExistente_DeberiaActualizarCorrectamente() throws Exception {
        // Arrange - Crear usuario primero
        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setNombre("Usuario Original");
        usuarioDto.setEmail("actualizar@inia.com");
        usuarioDto.setPassword("password123");
        usuarioDto.setRol(RolUsuario.ANALISTA);
        usuarioDto.setActivo(true);

        usuarioService.crearUsuario(usuarioDto);

        // Obtener el usuario para tener su ID
        UsuarioDto usuarioExistente = usuarioService.obtenerUsuarioPorEmail("actualizar@inia.com");
        
        // Actualizar datos
        UsuarioDto usuarioActualizado = new UsuarioDto();
        usuarioActualizado.setId(usuarioExistente.getId());
        usuarioActualizado.setNombre("Usuario Actualizado");
        usuarioActualizado.setEmail("actualizar@inia.com");
        usuarioActualizado.setRol(RolUsuario.ANALISTA);
        usuarioActualizado.setActivo(true);

        // Act & Assert
        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(usuarioActualizado)))
                .andExpect(status().isOk());

        // Verificar que se actualizó
        UsuarioDto usuarioVerificado = usuarioService.obtenerUsuarioPorEmail("actualizar@inia.com");
        assert usuarioVerificado.getNombre().equals("Usuario Actualizado");
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("Debería listar usuarios de la base de datos")
    void listarUsuarios_ConUsuariosEnBaseDeDatos_DeberiaRetornarLista() throws Exception {
        // Arrange - Crear varios usuarios
        for (int i = 1; i <= 3; i++) {
            UsuarioDto usuarioDto = new UsuarioDto();
            usuarioDto.setNombre("Usuario " + i);
            usuarioDto.setEmail("usuario" + i + "@inia.com");
            usuarioDto.setPassword("password123");
            usuarioDto.setRol(RolUsuario.ANALISTA);
            usuarioDto.setActivo(true);
            usuarioService.crearUsuario(usuarioDto);
        }

        // Act & Assert
        mockMvc.perform(get(baseUrl + "/listar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").exists())
                .andExpect(jsonPath("$.usuarios").isArray());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("Debería eliminar un usuario de la base de datos")
    void eliminarUsuario_ConUsuarioExistente_DeberiaEliminarCorrectamente() throws Exception {
        // Arrange - Crear usuario
        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setNombre("Usuario a Eliminar");
        usuarioDto.setEmail("eliminar@inia.com");
        usuarioDto.setPassword("password123");
        usuarioDto.setRol(RolUsuario.ANALISTA);
        usuarioDto.setActivo(true);

        usuarioService.crearUsuario(usuarioDto);
        UsuarioDto usuarioCreado = usuarioService.obtenerUsuarioPorEmail("eliminar@inia.com");

        // Act & Assert
        mockMvc.perform(delete(baseUrl + "/eliminar/" + usuarioCreado.getId())
                        .with(csrf()))
                .andExpect(status().isOk());

        // Verificar que ya no existe (el servicio retorna null para usuarios inactivos)
        UsuarioDto usuarioEliminado = usuarioService.obtenerUsuarioPorId(usuarioCreado.getId());
        assert usuarioEliminado == null : "El usuario debería haber sido eliminado";
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("No debería crear usuario con email duplicado")
    void crearUsuario_ConEmailDuplicado_DeberiaRetornarError() throws Exception {
        // Arrange - Crear primer usuario
        UsuarioDto usuarioDto1 = new UsuarioDto();
        usuarioDto1.setNombre("Usuario 1");
        usuarioDto1.setEmail("duplicado@inia.com");
        usuarioDto1.setPassword("password123");
        usuarioDto1.setRol(RolUsuario.ANALISTA);
        usuarioDto1.setActivo(true);

        usuarioService.crearUsuario(usuarioDto1);

        // Intentar crear segundo usuario con mismo email
        UsuarioDto usuarioDto2 = new UsuarioDto();
        usuarioDto2.setNombre("Usuario 2");
        usuarioDto2.setEmail("duplicado@inia.com");
        usuarioDto2.setPassword("password456");
        usuarioDto2.setRol(RolUsuario.ANALISTA);
        usuarioDto2.setActivo(true);

        // Act & Assert
        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(usuarioDto2)))
                .andExpect(status().isConflict());
    }
}

