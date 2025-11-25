package ti.proyectoinia.api.controllers.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.GramosPmsController;
import ti.proyectoinia.dtos.GramosPmsDto;
import ti.proyectoinia.services.GramosPmsService;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GramosPmsController.class)
public class GramosPMSControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GramosPmsService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/gramos-pms";

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getGramosPorPms_ReturnsOk() throws Exception {
        Long pmsId = 1L;

        GramosPmsDto g1 = new GramosPmsDto();
        g1.setId(1L);
        g1.setPmsId(pmsId);

        GramosPmsDto g2 = new GramosPmsDto();
        g2.setId(2L);
        g2.setPmsId(pmsId);

        Mockito.when(service.obtenerGramosPorPms(pmsId))
                .thenReturn(List.of(g1, g2));

        mockMvc.perform(get(baseUrl + "/pms/" + pmsId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void getGramosPorPms_ReturnsEmptyList() throws Exception {
        Long pmsId = 10L;

        Mockito.when(service.obtenerGramosPorPms(pmsId))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/v1/gramos-pms/pms/" + pmsId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void crearMultiples_ReturnsCreatedWithErrors() throws Exception {
        GramosPmsDto dtoInvalido = new GramosPmsDto();  // pmsId null → error

        GramosPmsDto dtoValido = new GramosPmsDto();
        dtoValido.setPmsId(5L);

        List<GramosPmsDto> creadas = List.of(dtoValido);

        Mockito.when(service.crearMultiplesGramos(Mockito.anyList()))
                .thenReturn(creadas);

        mockMvc.perform(post("/api/v1/gramos-pms/crear-multiple")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(List.of(dtoInvalido, dtoValido))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.created").isArray())
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors[0].index").value(0))
                .andExpect(jsonPath("$.errors[0].message").value("pmsId es obligatorio"));
    }


    @Test
    @WithMockUser(authorities = "ADMIN")
    void crearMultiples_ReturnsCreated_AllValid() throws Exception {
        GramosPmsDto dto1 = new GramosPmsDto();
        dto1.setPmsId(5L);

        GramosPmsDto dto2 = new GramosPmsDto();
        dto2.setPmsId(5L);

        List<GramosPmsDto> creadas = List.of(dto1, dto2);

        Mockito.when(service.crearMultiplesGramos(Mockito.anyList()))
                .thenReturn(creadas);

        mockMvc.perform(post("/api/v1/gramos-pms/crear-multiple")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(List.of(dto1, dto2))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.created.length()").value(2))
                .andExpect(jsonPath("$.errors.length()").value(0));
    }

}
