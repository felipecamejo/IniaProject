package ti.proyectoinia.api.controllers.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.UsuarioController;
import ti.proyectoinia.api.responses.ResponseListadoUsuarios;
import ti.proyectoinia.dtos.UsuarioDto;
import ti.proyectoinia.services.UsuarioService;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UsuarioController.class)
@Import(TestSecurityConfig.class)
class UsuarioSecurityService {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    private final String base = "/api/v1/usuario";

    // -------------------------------------------------------------
    // 1) CREAR
    // -------------------------------------------------------------
    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrearUsuario() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setEmail("test@inia.com");
        dto.setNombre("Test User");
        dto.setPassword("1234");

        when(usuarioService.crearUsuario(any())).thenReturn("Usuario creado");

        mockMvc.perform(post(base + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void GuestPuedeCrearUsuario() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setEmail("test@inia.com");
        dto.setNombre("Test User");
        dto.setPassword("1234");

        when(usuarioService.crearUsuario(any())).thenReturn("Usuario creado");

        mockMvc.perform(post(base + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void NoAutorizadoNoPuedeCrearUsuario() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setEmail("test@inia.com");
        dto.setNombre("Test User");
        dto.setPassword("1234");

        when(usuarioService.crearUsuario(any())).thenReturn("Usuario creado");

        mockMvc.perform(post(base + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------
    // 2) LISTAR
    // -------------------------------------------------------------
    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeListarUsuarios() throws Exception {
        ResponseListadoUsuarios response = new ResponseListadoUsuarios();
        response.setUsuarios(Collections.emptyList());

        when(usuarioService.listadoUsuarios())
                .thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(base + "/listar"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void GuestNoPuedeListarUsuarios() throws Exception {
        mockMvc.perform(get(base + "/listar"))
                .andExpect(status().isForbidden());
    }

    @Test
    void NoautorizadoNoPuedeListarUsuarios() throws Exception {
        mockMvc.perform(get(base + "/listar"))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------
    // 3) OBTENER POR ID
    // -------------------------------------------------------------
    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeObtenerUsuarioPorId() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setId(1L);
        dto.setEmail("test@inia.com");
        dto.setNombre("Test");

        when(usuarioService.obtenerUsuarioPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(base + "/obtener/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void GuestPuedeObtenerUsuarioPorId() throws Exception {

        mockMvc.perform(get(base + "/obtener/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void obtenerUsuarioPorIdNotFound() throws Exception {
        when(usuarioService.obtenerUsuarioPorId(99L)).thenReturn(null);

        mockMvc.perform(get(base + "/obtener/99"))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------
    // 4) EDITAR
    // -------------------------------------------------------------
    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEditarUsuario() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setId(1L);
        dto.setEmail("edit@test.com");

        when(usuarioService.editarUsuario(any())).thenReturn("Usuario editado");

        mockMvc.perform(put(base + "/editar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    // -------------------------------------------------------------
    // 5) ELIMINAR
    // -------------------------------------------------------------
    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEliminarUsuario() throws Exception {
        when(usuarioService.eliminarUsuario(1L)).thenReturn("Usuario eliminado");

        mockMvc.perform(delete(base + "/eliminar/1"))
                .andExpect(status().isOk());
    }

    // -------------------------------------------------------------
    // 6) PERFIL POR EMAIL
    // -------------------------------------------------------------
    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeObtenerPerfil() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setEmail("perfil@inia.com");

        when(usuarioService.obtenerUsuarioPorEmail("perfil@inia.com")).thenReturn(dto);

        mockMvc.perform(get(base + "/perfil/perfil@inia.com"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void GuestNoPuedeObtenerPerfil() throws Exception {

        mockMvc.perform(get(base + "/perfil/perfil@inia.com"))
                .andExpect(status().isForbidden());
    }

    @Test
    void NoAutorizadoPuedeObtenerPerfil() throws Exception {
        mockMvc.perform(get(base + "/perfil/perfil@inia.com"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void perfilNotFound() throws Exception {
        when(usuarioService.obtenerUsuarioPorEmail("x@inia.com")).thenReturn(null);

        mockMvc.perform(get(base + "/perfil/x@inia.com"))
                .andExpect(status().isNotFound());
    }

    // -------------------------------------------------------------
    // 7) PERFIL ACTUAL (JWT mockeado)
    // -------------------------------------------------------------
    @Test
    @WithMockUser(authorities = "ADMIN")
    void obtenerPerfilActual() throws Exception {
        when(usuarioService.extraerEmailDelToken(anyString())).thenReturn("admin@inia.com");

        UsuarioDto dto = new UsuarioDto();
        dto.setEmail("admin@inia.com");

        when(usuarioService.obtenerUsuarioPorEmail("admin@inia.com")).thenReturn(dto);

        mockMvc.perform(get(base + "/perfil/actual")
                        .header("Authorization", "Bearer xxx"))
                .andExpect(status().isOk());
    }

    // -------------------------------------------------------------
    // 8) ACTUALIZAR PERFIL
    // -------------------------------------------------------------
    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarPerfilUsuario() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setId(1L);
        dto.setNombre("Nuevo Nombre");

        when(usuarioService.editarUsuario(any())).thenReturn("Perfil actualizado");

        mockMvc.perform(put(base + "/perfil/actualizar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }
}
