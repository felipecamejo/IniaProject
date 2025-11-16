package ti.proyectoinia.api.controllers.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.UsuarioController;
import ti.proyectoinia.api.responses.ResponseListadoUsuarios;
import ti.proyectoinia.dtos.UsuarioDto;
import ti.proyectoinia.services.UsuarioService;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import ti.proyectoinia.business.entities.RolUsuario;


@WebMvcTest(UsuarioController.class)
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UsuarioService service;

    private final ObjectMapper mapper = new ObjectMapper();
    
    private final String baseUrl = "/api/v1/usuario";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setNombre("Felipe");
        Mockito.when(service.obtenerUsuarioPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/obtener/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_IdIncorrect() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setNombre("Felipe");
        Mockito.when(service.obtenerUsuarioPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/obtener/2"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_IdInvalid() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setNombre("Felipe");
        Mockito.when(service.obtenerUsuarioPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/obtener/molleja"))
                .andExpect(status().isBadRequest());
    }

    // ---- GET /{email} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getByEmail_ReturnsOk() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setNombre("Felipe");
        String email = "felipe@yahoo.com";
        Mockito.when(service.obtenerUsuarioPorEmail(email)).thenReturn(dto);

        //perfil/{email}

        mockMvc.perform(get(baseUrl + "/perfil/" + email))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getbyEmail_EmailIncorrect() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setNombre("Felipe");
        String email = "felipe@yahoo.com";
        Mockito.when(service.obtenerUsuarioPorEmail(email)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/perfil/felipe@gmail.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getbyEmail_EmailInvalid() throws Exception {
        UsuarioDto dto = new UsuarioDto();
        dto.setNombre("Felipe");
        String email = "felipe@yahoo.com";
        Mockito.when(service.obtenerUsuarioPorEmail(email)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/perfil/" + 1L))
                .andExpect(status().isBadRequest());
    }


    // ---- POST ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void crear_Correcto() throws Exception {

        UsuarioDto input = new UsuarioDto();
        input.setNombre("Felipe");
        input.setEmail("felipe@gmail.com");

        input.setRol(RolUsuario.ADMIN);

        Mockito.when(service.crearUsuario(any(UsuarioDto.class)))
                .thenReturn("Creado correctamente");

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void crear_YaExiste() throws Exception {

        UsuarioDto input = new UsuarioDto();
        input.setNombre("Felipe");
        input.setEmail("felipe@gmail.com");
        input.setRol(RolUsuario.ADMIN);

        Mockito.when(service.crearUsuario(any(UsuarioDto.class)))
                .thenThrow(new IllegalArgumentException("Ya existe"));

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isConflict());
    }


    // ---- PUT /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void update_ReturnsUpdated() throws Exception {
        UsuarioDto input = new UsuarioDto();
        input.setId(null);
        input.setNombre("Actualizado");
        input.setRol(RolUsuario.ADMIN);
        input.setEmail("actualizado@example.com");

        Mockito.when(service.editarUsuario(any(UsuarioDto.class))).thenReturn("Creado");

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(content().string("Creado"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void update_ReturnsBadRequest_WhenIdIsNull() throws Exception {
        UsuarioDto input = new UsuarioDto();
        input.setId(null);
        input.setNombre("Actualizado");
        input.setRol(RolUsuario.ADMIN);

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }



    // ---- DELETE /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsOk() throws Exception {
        mockMvc.perform(delete(baseUrl + "/eliminar/1")
                        .with(csrf()))
                .andExpect(status().isOk());

        Mockito.verify(service).eliminarUsuario(1L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsNotFound() throws Exception {

        Mockito.doThrow(new EntityNotFoundException("No existe"))
                .when(service).eliminarUsuario(2L);

        mockMvc.perform(delete(baseUrl + "/eliminar/2")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        Mockito.verify(service).eliminarUsuario(2L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsBadRequest() throws Exception {
        mockMvc.perform(delete(baseUrl + "/eliminar/feliaoda")
                        .with(csrf()))
                .andExpect(status().isBadRequest());

        Mockito.verifyNoInteractions(service);
    }

    // ---- GET ----

    @Test
    @WithMockUser(authorities = "ADMIN")
    void get_ReturnsOk() throws Exception {
        ResponseListadoUsuarios dto = new ResponseListadoUsuarios();
        Mockito.when(service.listadoUsuarios()).thenReturn(ResponseEntity.ok(dto));

        //listar

        mockMvc.perform(get(baseUrl + "/listar"))
                .andExpect(status().isOk());
    }

    // ---- GET Actual ----

    @Test
    @WithMockUser(authorities = "ADMIN")
    void obtenerPerfilUsuarioActual_ReturnsOk_WhenTokenValid() throws Exception {
        String token = "Bearer valid.token";
        UsuarioDto dto = new UsuarioDto();
        dto.setNombre("Felipe");

        Mockito.when(service.extraerEmailDelToken(token)).thenReturn("felipe@yahoo.com");
        Mockito.when(service.obtenerUsuarioPorEmail("felipe@yahoo.com")).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/perfil/actual")
                        .header("Authorization", token))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void obtenerPerfilUsuarioActual_ReturnsUnauthorized_WhenTokenInvalid() throws Exception {
        String token = "Bearer invalid.token";

        Mockito.when(service.extraerEmailDelToken(token))
                .thenThrow(new IllegalArgumentException("Token inválido"));

        mockMvc.perform(get(baseUrl + "/perfil/actual")
                        .header("Authorization", token))
                .andExpect(status().isUnauthorized());
    }


    // ---- ActualizarPerfil  ----

    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarPerfilUsuario_ReturnsOk() throws Exception {
        UsuarioDto input = new UsuarioDto();
        input.setId(1L);
        input.setNombre("Modificado");
        input.setEmail("modificado@example.com");
        input.setPassword("shouldBeIgnored");
        input.setRol(RolUsuario.ADMIN);

        Mockito.when(service.editarUsuario(any(UsuarioDto.class))).thenReturn("Actualizado");

        mockMvc.perform(put(baseUrl + "/perfil/actualizar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(content().string("Actualizado"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarPerfilUsuario_ReturnsBadRequest_WhenDatosInvalidos() throws Exception {
        UsuarioDto input = new UsuarioDto();
        // No seteamos nombre ni email → violación de @Valid
        input.setId(1L);
        input.setRol(RolUsuario.ADMIN);

        mockMvc.perform(put(baseUrl + "/perfil/actualizar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }


}
