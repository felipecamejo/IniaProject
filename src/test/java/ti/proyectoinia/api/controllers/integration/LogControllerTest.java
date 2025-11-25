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
import ti.proyectoinia.api.controllers.LogController;
import ti.proyectoinia.dtos.LogDto;
import ti.proyectoinia.api.responses.ResponseListadoLogs;
import ti.proyectoinia.services.LogService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LogController.class)
public class LogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LogService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/log";

    // ---- POST ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void crear_Correcto() throws Exception {
        LogDto input = new LogDto();
        input.setTexto("Felipe");

        Mockito.when(service.crear(any(LogDto.class)))
                .thenReturn("Creado correctamente");

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void crear_NombreVacio() throws Exception {
        LogDto input = new LogDto();
        input.setTexto("");

        Mockito.when(service.crear(any(LogDto.class)))
                .thenReturn("Creado correctamente");

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    // ----- GET listar/{loteId} -----
    @Test
    @WithMockUser(roles = "ADMIN")
    void listarLog_ReturnsOk() throws Exception {
        Long loteId = 1L;

        ResponseListadoLogs response = new ResponseListadoLogs();
        LogDto log1 = new LogDto();
        log1.setTexto("Log1");
        LogDto log2 = new LogDto();
        log2.setTexto("Log2");
        response.setLogs(List.of(log1, log2));

        Mockito.when(service.listado(loteId))
                .thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(baseUrl + "/listar/{loteId}", loteId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs[0].texto").value("Log1"))
                .andExpect(jsonPath("$.logs[1].texto").value("Log2"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void listarLog_LoteNoExiste_ReturnsNotFound() throws Exception {
        Long loteId = 20L;

        Mockito.when(service.listado(loteId))
                .thenThrow(new EntityNotFoundException("Lote no encontrado"));

        mockMvc.perform(get(baseUrl + "/listar/{loteId}", loteId))
                .andExpect(status().isNotFound());
    }
}
