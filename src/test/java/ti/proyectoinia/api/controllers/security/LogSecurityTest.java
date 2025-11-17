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

import ti.proyectoinia.api.controllers.LogController;
import ti.proyectoinia.api.responses.ResponseListadoLogs;
import ti.proyectoinia.dtos.LogDto;
import ti.proyectoinia.services.LogService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LogController.class)
@Import(TestSecurityConfig.class)
public class LogSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    LogService logService;

    String apiUrl = "/api/v1/log";

    // ============================================================================
    //  POST /crear → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================


    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrearLog() throws Exception {
        LogDto dto = new LogDto();
        dto.setTexto("Texto de prueba");

        when(logService.crear(any())).thenReturn("Creado");

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void analistaPuedeCrearLog() throws Exception {
        LogDto dto = new LogDto();
        dto.setTexto("Texto de prueba");

        when(logService.crear(any())).thenReturn("Creado");

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void observadorPuedeCrearLog() throws Exception {
        LogDto dto = new LogDto();
        dto.setTexto("Texto de prueba");

        when(logService.crear(any())).thenReturn("Creado");

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeCrearLog() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeDar401_CrearLog() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /listar/{loteId} → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeListarLogs() throws Exception {
        Long loteId = 1L;
        ResponseListadoLogs response = new ResponseListadoLogs();

        when(logService.listado(eq(loteId))).thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(apiUrl + "/listar/" + loteId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void analistaNoPuedeListarLogs() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void observadorNoPuedeListarLogs() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeListarLogs() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeDar401_ListarLogs() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar/1"))
                .andExpect(status().isUnauthorized());
    }
}
