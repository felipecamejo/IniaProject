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

import ti.proyectoinia.api.controllers.MetodoController;
import ti.proyectoinia.api.responses.ResponseListadoMetodos;
import ti.proyectoinia.dtos.MetodoDto;
import ti.proyectoinia.services.MetodoService;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MetodoController.class)
@Import(TestSecurityConfig.class)
public class MetodoSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    MetodoService metodoService;

    String apiUrl = "/api/v1/metodo";

    // ============================================================================
    //  POST /crear  → SOLO ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrearMetodo() throws Exception {
        when(metodoService.crearMetodo(any(MetodoDto.class)))
                .thenReturn("Método creado");

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"ABC\",\"autor\":\"Juan\"}"))
                .andExpect(status().isCreated());
    }


    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeCrearMetodo() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlCrearMetodo() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /listar  → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void adminPuedeListarMetodos() throws Exception {
        ResponseListadoMetodos listado = new ResponseListadoMetodos();
        listado.setMetodos(Collections.emptyList());

        when(metodoService.listadoMetodos())
                .thenReturn(ResponseEntity.ok(listado));


        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeListarMetodos() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlListarMetodos() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /{id}  → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeObtenerMetodo() throws Exception {
        when(metodoService.obtenerMetodoPorId(1L))
                .thenReturn(new MetodoDto());

        mockMvc.perform(get(apiUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    void noAutenticadoDebeRetornar401AlObtenerMetodo() throws Exception {
        mockMvc.perform(get(apiUrl + "/1"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  PUT /editar  → SOLO ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEditarMetodo() throws Exception {
        when(metodoService.editarMetodo(any(MetodoDto.class)))
                .thenReturn("Método editado");

        mockMvc.perform(put(apiUrl + "/editar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":1,\"nombre\":\"ABC\",\"autor\":\"Juan\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeEditarMetodo() throws Exception {
        mockMvc.perform(put(apiUrl + "/editar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlEditarMetodo() throws Exception {
        mockMvc.perform(put(apiUrl + "/editar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  PUT /eliminar/{id}  → SOLO ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEliminarMetodo() throws Exception {
        when(metodoService.eliminarMetodo(1L))
                .thenReturn("Método eliminado");

        mockMvc.perform(delete(apiUrl + "/eliminar/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeEliminarMetodo() throws Exception {
        mockMvc.perform(delete(apiUrl + "/eliminar/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlEliminarMetodo() throws Exception {
        mockMvc.perform(delete(apiUrl + "/eliminar/1"))
                .andExpect(status().isUnauthorized());
    }
}
