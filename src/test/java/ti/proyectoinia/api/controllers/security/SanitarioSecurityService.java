package ti.proyectoinia.api.controllers.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.SanitarioController;
import ti.proyectoinia.api.responses.ResponseListadoSanitario;
import ti.proyectoinia.dtos.SanitarioDto;
import ti.proyectoinia.services.SanitarioService;

import java.util.ArrayList;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SanitarioController.class)
@Import(TestSecurityConfig.class)
public class SanitarioSecurityService {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    SanitarioService sanitarioService;

    String apiUrl = "/api/v1/sanitario";

    @TestConfiguration
    static class TestConfig {
        @Bean
        public SanitarioService sanitarioService() {
            return mock(SanitarioService.class);
        }
    }

    // ============================================================================
    //  POST /crear → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrear() throws Exception {
        SanitarioDto dto = new SanitarioDto();
        dto.setFechaCreacion("now");

        when(sanitarioService.crearSanitario(any())).thenReturn(dto.getId());

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeCrear() throws Exception {
        SanitarioDto dto = new SanitarioDto();
        dto.setFechaCreacion("now");

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoNoPuedeCrear() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /listar por recibo → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeListarPorRecibo() throws Exception {
        ResponseListadoSanitario response = new ResponseListadoSanitario(new ArrayList<>());
        response.setSanitario(Collections.emptyList());

        Long id = 1L;

        when(sanitarioService.listadoSanitarioPorReciboId(id)).thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(apiUrl + "/listar/recibo/" + id))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void userNoPuedeListarPorRecibo() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar/recibo/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoListarPorReciboDebeDar401() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar/recibo/1"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /{id} → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void analistaPuedeVerPorId() throws Exception {
        SanitarioDto dto = new SanitarioDto();
        dto.setId(1L);
        dto.setFechaCreacion("now");

        when(sanitarioService.obtenerSanitarioPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(apiUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void userNoPuedeVerPorId() throws Exception {
        mockMvc.perform(get(apiUrl + "/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoVerPorIdDebeDar401() throws Exception {
        mockMvc.perform(get(apiUrl + "/1"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  PUT /editar → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEditar() throws Exception {
        SanitarioDto dto = new SanitarioDto();
        dto.setId(1L);
        dto.setFechaCreacion("now");

        when(sanitarioService.editarSanitario(any())).thenReturn(1L);

        mockMvc.perform(put(apiUrl + "/editar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeEditar() throws Exception {
        mockMvc.perform(put(apiUrl + "/editar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    // ============================================================================
    //  PUT /eliminar/{id} → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEliminar() throws Exception {
        when(sanitarioService.eliminarSanitario(1L)).thenReturn("Eliminado");

        mockMvc.perform(delete(apiUrl + "/eliminar/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeEliminar() throws Exception {
        mockMvc.perform(delete(apiUrl + "/eliminar/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoEliminarDebeDar401() throws Exception {
        mockMvc.perform(delete(apiUrl + "/eliminar/1"))
                .andExpect(status().isUnauthorized());
    }

}
