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

import ti.proyectoinia.api.controllers.GramosPmsController;
import ti.proyectoinia.dtos.GramosPmsDto;
import ti.proyectoinia.services.GramosPmsService;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GramosPmsController.class)
@Import(TestSecurityConfig.class)
public class GramosPMSSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    GramosPmsService gramosPmsService;

    String apiUrl = "/api/v1/gramos-pms";

    // ============================================================================
    //  GET /pms/{pmsId}  → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeObtenerGramosPorPms() throws Exception {
        when(gramosPmsService.obtenerGramosPorPms(1L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get(apiUrl + "/pms/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void analistaPuedeObtenerGramosPorPms() throws Exception {
        when(gramosPmsService.obtenerGramosPorPms(1L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get(apiUrl + "/pms/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void observadorPuedeObtenerGramosPorPms() throws Exception {
        when(gramosPmsService.obtenerGramosPorPms(1L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get(apiUrl + "/pms/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeObtenerGramosPorPms() throws Exception {
        mockMvc.perform(get(apiUrl + "/pms/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeDar401AlObtenerGramos() throws Exception {
        mockMvc.perform(get(apiUrl + "/pms/1"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  POST /crear-multiple  → ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrearMultiples() throws Exception {
        List<GramosPmsDto> respuesta = Collections.emptyList();
        when(gramosPmsService.crearMultiplesGramos(any())).thenReturn(respuesta);

        mockMvc.perform(post(apiUrl + "/crear-multiple")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void analistaNoPuedeCrearMultiples() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear-multiple")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void observadorNoPuedeCrearMultiples() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear-multiple")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeCrearMultiples() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear-multiple")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeDar401AlCrearMultiples() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear-multiple")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isUnauthorized());
    }
}
