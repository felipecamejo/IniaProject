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
import ti.proyectoinia.api.controllers.TetrazolioController;
import ti.proyectoinia.api.responses.ResponseListadoTetrazolio;
import ti.proyectoinia.dtos.TetrazolioDto;
import ti.proyectoinia.services.SanitarioService;
import ti.proyectoinia.services.TetrazolioService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TetrazolioController.class)
@Import(TestSecurityConfig.class)
public class TetrazolioSecurityService {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    TetrazolioService tetrazolioService;

    String apiUrl = "/api/v1/tetrazolio";

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
        TetrazolioDto dto = new TetrazolioDto();
        Date now = new Date();
        dto.setFechaCreacion(now);

        when(tetrazolioService.crearTetrazolio(any())).thenReturn("jola");

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeCrear() throws Exception {
        TetrazolioDto dto = new TetrazolioDto();
        Date now = new Date();
        dto.setFechaCreacion(now);

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
        ResponseListadoTetrazolio response = new ResponseListadoTetrazolio(new ArrayList<>());
        response.setTetrazolio(Collections.emptyList());

        Long id = 1L;

        when(tetrazolioService.listadoTetrazolioPorReciboId(id)).thenReturn(ResponseEntity.ok(response));

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
        TetrazolioDto dto = new TetrazolioDto();
        dto.setId(1L);
        Date now = new Date();
        dto.setFechaCreacion(now);

        when(tetrazolioService.obtenerTetrazolioPorId(1L)).thenReturn(dto);

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
        TetrazolioDto dto = new TetrazolioDto();
        dto.setId(1L);
        Date now = new Date();
        dto.setFechaCreacion(now);

        when(tetrazolioService.editarTetrazolio(any())).thenReturn("1L");

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
        when(tetrazolioService.eliminarTetrazolio(1L)).thenReturn("Eliminado");

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
