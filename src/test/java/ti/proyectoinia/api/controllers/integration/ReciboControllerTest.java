package ti.proyectoinia.api.controllers.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.ReciboController;
import ti.proyectoinia.dtos.ReciboDto;
import ti.proyectoinia.services.ReciboService;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReciboController.class)
public class ReciboControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReciboService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/recibo";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        ReciboDto dto = new ReciboDto();
        dto.setId(1L);

        Mockito.when(service.obtenerReciboPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsNotFound() throws Exception {
        Mockito.when(service.obtenerReciboPorId(2L)).thenReturn(null);

        mockMvc.perform(get(baseUrl + "/2"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsBadRequest_WhenIdInvalid() throws Exception {
        mockMvc.perform(get(baseUrl + "/molleja"))
                .andExpect(status().isBadRequest());
    }

    // ---- POST /crear ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void crear_ReturnsCreated() throws Exception {
        ReciboDto input = new ReciboDto();
        input.setId(null);

        Mockito.when(service.crearRecibo(any(ReciboDto.class))).thenReturn(input);

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isCreated());
    }

    // ---- PUT /editar ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void editar_ReturnsOk() throws Exception {
        ReciboDto input = new ReciboDto();
        input.setId(1L);

        Mockito.when(service.editarRecibo(any(ReciboDto.class))).thenReturn("Editado");

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void editar_ReturnsBadRequest_WhenIdNull() throws Exception {
        ReciboDto input = new ReciboDto();

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

}
