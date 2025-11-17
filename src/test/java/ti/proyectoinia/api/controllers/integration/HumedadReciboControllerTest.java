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
import ti.proyectoinia.api.controllers.HumedadReciboController;
import ti.proyectoinia.dtos.HumedadReciboDto;
import ti.proyectoinia.services.HumedadReciboService;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HumedadReciboController.class)
public class HumedadReciboControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HumedadReciboService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/humedadRecibo";

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getHumedadesPorRecibo_ReturnsOk() throws Exception {
        Long reciboId = 1L;

        HumedadReciboDto h1 = new HumedadReciboDto();
        h1.setId(1L);

        HumedadReciboDto h2 = new HumedadReciboDto();
        h2.setId(2L);

        Mockito.when(service.obtenerHumedadesPorRecibo(reciboId))
                .thenReturn(List.of(h1, h2));

        mockMvc.perform(get( baseUrl + "/recibo/" + reciboId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[1].id").value(2));
    }

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void getHumedadesPorRecibo_ReturnsEmptyList() throws Exception {
        Mockito.when(service.obtenerHumedadesPorRecibo(10L))
                .thenReturn(List.of());

        mockMvc.perform(get(baseUrl + "/recibo/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarHumedades_ReturnsCreated_WithErrors() throws Exception {

        HumedadReciboDto invalido = new HumedadReciboDto(); // lugar y numero son null → error

        HumedadReciboDto valido = new HumedadReciboDto();
        valido.setNumero(1);

        // El service recibe solo los válidos
        Mockito.doNothing().when(service)
                .actualizarHumedadesCompleto(Mockito.eq(5L), Mockito.anyList());

        // Simula que luego las creadas son estas:
        HumedadReciboDto creado = new HumedadReciboDto();
        creado.setId(10L);
        creado.setNumero(1);

        Mockito.when(service.obtenerHumedadesPorRecibo(5L))
                .thenReturn(List.of(creado));

        mockMvc.perform(put(baseUrl + "/actualizar-humedades/5")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(List.of(invalido, valido))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.created").isArray())
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors[0].index").value(0))
                .andExpect(jsonPath("$.errors[0].message").value("Lugar y número son obligatorios"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarHumedades_ReturnsCreated_AllValid() throws Exception {

        HumedadReciboDto d1 = new HumedadReciboDto();
        d1.setNumero(1);

        HumedadReciboDto d2 = new HumedadReciboDto();
        d2.setNumero(2);

        Mockito.doNothing().when(service)
                .actualizarHumedadesCompleto(Mockito.eq(1L), Mockito.anyList());

        Mockito.when(service.obtenerHumedadesPorRecibo(1L))
                .thenReturn(List.of(d1, d2));

        mockMvc.perform(put(baseUrl + "/actualizar-humedades/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(List.of(d1, d2))))
                .andExpect(status().isCreated());
    }




}
