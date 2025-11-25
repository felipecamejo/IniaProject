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
import ti.proyectoinia.api.controllers.GerminacionTablasController;
import ti.proyectoinia.dtos.ConteoGerminacionDto;
import ti.proyectoinia.dtos.GerminacionDto;
import ti.proyectoinia.dtos.NormalPorConteoDto;
import ti.proyectoinia.dtos.RepeticionFinalDto;
import ti.proyectoinia.services.GerminacionMatrizService;
import ti.proyectoinia.services.GerminacionService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GerminacionTablasController.class)
@Import(TestSecurityConfig.class)
public class GerminacionTablasSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    GerminacionMatrizService germinacionMatrizService;

    @MockitoBean
    GerminacionService germinacionService;

    String apiUrl = "/api/v1/germinacion/tablas";

    // ============================================================================
    //  POST /{germinacionId}/conteos → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrearConteo() throws Exception {
        ConteoGerminacionDto dto = new ConteoGerminacionDto();
        Date now = new Date();
        dto.setFechaConteo(now);
        dto.setId(1L);

        when(germinacionMatrizService.addConteo(anyLong(), any())).thenReturn(dto);

        mockMvc.perform(post(apiUrl + "/1/conteos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeCrearConteo() throws Exception {
        ConteoGerminacionDto dto = new ConteoGerminacionDto();
        dto.setFechaConteo(new Date());

        mockMvc.perform(post(apiUrl + "/1/conteos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoNoPuedeCrearConteo() throws Exception {
        mockMvc.perform(post(apiUrl + "/1/conteos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /{germinacionId}/conteos → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeListarConteos() throws Exception {
        List<ConteoGerminacionDto> response = new ArrayList<>();

        Long id = 1L;

        when(germinacionMatrizService.listConteos(id)).thenReturn(response);

        mockMvc.perform(get(apiUrl + "/" + id + "/conteos"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void userNoPuedeListarConteos() throws Exception {
        mockMvc.perform(get(apiUrl + "/1/conteos"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoListarConteosDebeDar401() throws Exception {
        mockMvc.perform(get(apiUrl + "/1/conteos"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  PUT /normales/{tabla} → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeUpsertNormal() throws Exception {
        NormalPorConteoDto dto = new NormalPorConteoDto();
        dto.setId(1L);
        dto.setTabla("now");

        when(germinacionMatrizService.upsertNormal(eq("now"), any())).thenReturn(dto);

        mockMvc.perform(put(apiUrl + "/normales/now")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeUpsertNormal() throws Exception {
        mockMvc.perform(put(apiUrl + "/normales/now")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    // ============================================================================
    //  PUT /finales/{tabla} → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeUpsertFinales() throws Exception {
        RepeticionFinalDto dto = new RepeticionFinalDto();
        dto.setId(1L);
        dto.setDuras(2);

        when(germinacionMatrizService.upsertRepeticionFinal(eq("now"), any())).thenReturn(dto);

        mockMvc.perform(put(apiUrl + "/finales/now")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeUpsertFinales() throws Exception {
        mockMvc.perform(put(apiUrl + "/finales/now")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    // ============================================================================
    //  GET /{germinacionId}/resumen → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeObtenerResumen() throws Exception {
        Long id = 1L;
        Map<String, Object> mapa = new HashMap<>();
        mapa.put("conteos", Collections.emptyList());

        when(germinacionMatrizService.listMatriz(id)).thenReturn(mapa);
        when(germinacionService.obtenerGerminacionPorId(id)).thenReturn(new GerminacionDto()); // <-- mock añadido

        mockMvc.perform(get(apiUrl + "/" + id + "/resumen"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void GuestNoPuedeObtenerResumen() throws Exception {
        mockMvc.perform(get(apiUrl + "/1/resumen"))
                .andExpect(status().isForbidden());
    }

    @Test
    void NoAutorizadoNoPuedeObtenerResumen() throws Exception {

        mockMvc.perform(get(apiUrl + "/1/resumen"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  POST /{germinacionId}/celdas/{tabla}/repeticiones/{numeroRepeticion} → ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeAgregarRepeticionConNumero() throws Exception {
        Long id = 1L;
        String tabla = "now";
        Integer numero = 2;

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("numero", numero);

        when(germinacionMatrizService.addRepeticionAcrossConteos(id, tabla, numero)).thenReturn(respuesta);

        mockMvc.perform(post(apiUrl + "/" + id + "/celdas/" + tabla + "/repeticiones/" + numero))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void GuestNoPuedeAgregarRepeticionConNumero() throws Exception {

        mockMvc.perform(post(apiUrl + "/1/celdas/lalal/repeticiones/2"))
                .andExpect(status().isForbidden());
    }

    @Test

    void NoAutorizadoNoPuedeAgregarRepeticionConNumero() throws Exception {

        mockMvc.perform(post(apiUrl + "/1/celdas/lalal/repeticiones/2"))
                .andExpect(status().isUnauthorized());
    }

}
