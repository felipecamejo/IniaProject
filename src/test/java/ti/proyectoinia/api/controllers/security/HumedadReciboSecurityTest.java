package ti.proyectoinia.api.controllers.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import ti.proyectoinia.api.controllers.HumedadReciboController;
import ti.proyectoinia.dtos.HumedadReciboDto;
import ti.proyectoinia.services.HumedadReciboService;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HumedadReciboController.class)
@Import(TestSecurityConfig.class)
public class HumedadReciboSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    HumedadReciboService humedadReciboService;

    String apiUrl = "/api/v1/humedadRecibo";

    // ============================================================================
    //  GET /recibo/{reciboId} → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeObtenerHumedadesPorRecibo() throws Exception {
        when(humedadReciboService.obtenerHumedadesPorRecibo(1L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void analistaPuedeObtenerHumedadesPorRecibo() throws Exception {
        when(humedadReciboService.obtenerHumedadesPorRecibo(1L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void observadorPuedeObtenerHumedadesPorRecibo() throws Exception {
        when(humedadReciboService.obtenerHumedadesPorRecibo(1L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeObtenerHumedadesPorRecibo() throws Exception {
        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlObtenerHumedades() throws Exception {
        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  PUT /actualizar-humedades/{reciboId} → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeActualizarHumedades() throws Exception {
        when(humedadReciboService.obtenerHumedadesPorRecibo(1L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(put(apiUrl + "/actualizar-humedades/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void observadorNoPuedeActualizarHumedades() throws Exception {
        mockMvc.perform(put(apiUrl + "/actualizar-humedades/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeActualizarHumedades() throws Exception {
        mockMvc.perform(put(apiUrl + "/actualizar-humedades/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlActualizarHumedades() throws Exception {
        mockMvc.perform(put(apiUrl + "/actualizar-humedades/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isUnauthorized());
    }
}
