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
import ti.proyectoinia.api.controllers.GerminacionTablasController;
import ti.proyectoinia.dtos.ConteoGerminacionDto;
import ti.proyectoinia.dtos.GerminacionDto;
import ti.proyectoinia.dtos.NormalPorConteoDto;
import ti.proyectoinia.dtos.RepeticionFinalDto;
import ti.proyectoinia.services.GerminacionMatrizService;
import ti.proyectoinia.services.GerminacionService;

import java.util.List;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GerminacionTablasController.class)
public class GerminacionTablasControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GerminacionMatrizService service;

    @MockitoBean
    private GerminacionService germinacionService;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/germinacion/tablas";

    // ---- POST /{germinacionId}/conteos ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void crearConteo_ReturnsCreated() throws Exception {
        Long germinacionId = 1L;

        ConteoGerminacionDto input = new ConteoGerminacionDto();
        input.setNumeroConteo(1);

        ConteoGerminacionDto output = new ConteoGerminacionDto();
        output.setId(10L);
        output.setNumeroConteo(1);

        Mockito.when(service.addConteo(germinacionId, input)).thenReturn(output);

        mockMvc.perform(post(baseUrl + "/" + germinacionId + "/conteos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.numeroConteo").value(1));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void crearConteo_ReturnsBadRequest() throws Exception {
        Long germinacionId = 2L;

        ConteoGerminacionDto input = new ConteoGerminacionDto();
        input.setNumeroConteo(5);

        Mockito.when(service.addConteo(Mockito.eq(germinacionId), Mockito.any()))
                .thenThrow(new IllegalArgumentException("Número de conteo inválido"));

        mockMvc.perform(post(baseUrl + "/" + germinacionId + "/conteos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Número de conteo inválido"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void crearConteo_ReturnsInternalServerError() throws Exception {
        Long germinacionId = 3L;

        ConteoGerminacionDto input = new ConteoGerminacionDto();

        Mockito.when(service.addConteo(Mockito.eq(germinacionId), Mockito.any()))
                .thenThrow(new RuntimeException("Fallo inesperado"));

        mockMvc.perform(post(baseUrl + "/" + germinacionId + "/conteos")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error al crear conteo: Fallo inesperado"));
    }

    //----- GET Germinacion/conteos -----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarConteos_ReturnsOk() throws Exception {
        Long germinacionId = 1L;

        ConteoGerminacionDto c1 = new ConteoGerminacionDto();
        c1.setId(1L);
        c1.setNumeroConteo(1);

        ConteoGerminacionDto c2 = new ConteoGerminacionDto();
        c2.setId(2L);
        c2.setNumeroConteo(2);

        List<ConteoGerminacionDto> lista = List.of(c1, c2);

        Mockito.when(service.listConteos(germinacionId)).thenReturn(lista);

        mockMvc.perform(get(baseUrl + "/" + germinacionId + "/conteos"))
                .andExpect(status().isOk());
    }

    // ---- GET /normales/{tabla} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void upsertNormal_ReturnsOk() throws Exception {
        String tabla = "SIN_CURAR";

        NormalPorConteoDto input = new NormalPorConteoDto();
        input.setId(1L);

        NormalPorConteoDto output = new NormalPorConteoDto();
        output.setId(1L);

        Mockito.when(service.upsertNormal(tabla, input)).thenReturn(output);

        mockMvc.perform(put(baseUrl + "/normales/" + tabla)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void upsertNormal_ReturnsBadRequest() throws Exception {
        String tabla = "CURADA_PLANTA";

        NormalPorConteoDto input = new NormalPorConteoDto();
        input.setId(2L);

        Mockito.when(service.upsertNormal(Mockito.eq(tabla), Mockito.any()))
                .thenThrow(new IllegalArgumentException("Tabla inválida"));

        mockMvc.perform(put(baseUrl + "/normales/" + tabla)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void upsertNormal_ReturnsInternalServerError() throws Exception {
        String tabla = "CURADA_LABORATORIO";

        NormalPorConteoDto input = new NormalPorConteoDto();

        Mockito.when(service.upsertNormal(Mockito.eq(tabla), Mockito.any()))
                .thenThrow(new RuntimeException("Fallo inesperado"));

        mockMvc.perform(put(baseUrl + "/normales/" + tabla)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isInternalServerError());
        }

    // ---- PUT /finales/{tabla} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void upsertFinales_ReturnsOk() throws Exception {
        String tabla = "SIN_CURAR";

        RepeticionFinalDto input = new RepeticionFinalDto();
        input.setId(1L);
        input.setAnormal(2);
        input.setDuras(1);
        input.setFrescas(3);
        input.setMuertas(0);

        RepeticionFinalDto output = new RepeticionFinalDto();
        output.setId(1L);
        output.setAnormal(2);
        output.setDuras(1);
        output.setFrescas(3);
        output.setMuertas(0);

        Mockito.when(service.upsertRepeticionFinal(tabla, input)).thenReturn(output);

        mockMvc.perform(put(baseUrl + "/finales/" + tabla)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.anormal").value(2))
                .andExpect(jsonPath("$.duras").value(1))
                .andExpect(jsonPath("$.frescas").value(3))
                .andExpect(jsonPath("$.muertas").value(0));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void upsertFinales_ReturnsBadRequest() throws Exception {
        String tabla = "CURADA_PLANTA";

        RepeticionFinalDto input = new RepeticionFinalDto();
        input.setAnormal(1);

        Mockito.when(service.upsertRepeticionFinal(Mockito.eq(tabla), Mockito.any()))
                .thenThrow(new IllegalArgumentException("Tabla inválida"));

        mockMvc.perform(put(baseUrl + "/finales/" + tabla)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Tabla inválida"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void upsertFinales_ReturnsInternalServerError() throws Exception {
        String tabla = "CURADA_LABORATORIO";

        RepeticionFinalDto input = new RepeticionFinalDto();

        Mockito.when(service.upsertRepeticionFinal(Mockito.eq(tabla), Mockito.any()))
                .thenThrow(new RuntimeException("Fallo inesperado"));

        mockMvc.perform(put(baseUrl + "/finales/" + tabla)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error al guardar finales: Fallo inesperado"));
    }

    // ----- GET /{germinacionId}/resumen -----

    @Test
    @WithMockUser(authorities = "ADMIN")
    void obtenerResumen_ReturnsOk() throws Exception {
        Long germinacionId = 1L;

        GerminacionDto gDto = new GerminacionDto();
        gDto.setId(germinacionId);
        Mockito.when(germinacionService.obtenerGerminacionPorId(germinacionId)).thenReturn(gDto);

        Map<String, Object> resumen = Map.of(
                "conteos", List.of(1, 2),
                "normales", Map.of("SIN_CURAR", List.of(), "CURADA_PLANTA", List.of()),
                "finales", List.of()
        );

        Mockito.when(service.listMatriz(germinacionId)).thenReturn(resumen);

        mockMvc.perform(get(baseUrl + "/" + germinacionId + "/resumen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conteos").isArray())
                .andExpect(jsonPath("$.normales.SIN_CURAR").isArray())
                .andExpect(jsonPath("$.finales").isArray());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void obtenerResumen_ReturnsNotFound_WhenGerminacionNoExiste() throws Exception {
        Long germinacionId = 50L;

        Mockito.when(germinacionService.obtenerGerminacionPorId(germinacionId)).thenReturn(null);

        mockMvc.perform(get(baseUrl + "/" + germinacionId + "/resumen"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void obtenerResumen_ReturnsNotFound_WhenResumenNull() throws Exception {
        Long germinacionId = 8L;

        GerminacionDto gDto = new GerminacionDto();
        gDto.setId(germinacionId);
        Mockito.when(germinacionService.obtenerGerminacionPorId(germinacionId)).thenReturn(gDto);

        Mockito.when(service.listMatriz(germinacionId)).thenReturn(null);

        mockMvc.perform(get(baseUrl + "/" + germinacionId + "/resumen"))
                .andExpect(status().isNotFound());
    }

    //----- POST /{germinacionId}/celdas/{tabla}/repeticiones/{numeroRepeticion} -----

    @Test
    @WithMockUser(authorities = "ADMIN")
    void agregarRepeticion_ReturnsCreated() throws Exception {
        Long germinacionId = 1L;
        String tabla = "finales";
        Integer repeticion = 0;

        Map<String, Object> response = Map.of(
                "msg", "Repetición creada",
                "repeticion", 1
        );

        Mockito.when(service.addRepeticionAcrossConteos(germinacionId, tabla, repeticion))
                .thenReturn(response);

        mockMvc.perform(post(baseUrl + "/" + germinacionId + "/celdas/" + tabla + "/repeticiones/" + repeticion).with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.msg").value("Repetición creada"))
                .andExpect(jsonPath("$.repeticion").value(1));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void agregarRepeticion_ReturnsBadRequest_WhenIllegalArgument() throws Exception {
        Long germinacionId = 2L;
        String tabla = "normales";
        Integer repeticion = 5;

        Mockito.when(service.addRepeticionAcrossConteos(germinacionId, tabla, repeticion))
                .thenThrow(new IllegalArgumentException("Tabla inválida"));

        mockMvc.perform(post(baseUrl + "/" + germinacionId + "/celdas/" + tabla + "/repeticiones/" + repeticion).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Tabla inválida"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void agregarRepeticion_ReturnsInternalServerError_WhenException() throws Exception {
        Long germinacionId = 3L;
        String tabla = "finales";
        Integer repeticion = 1;

        Mockito.when(service.addRepeticionAcrossConteos(germinacionId, tabla, repeticion))
                .thenThrow(new RuntimeException("Fallo interno"));

        mockMvc.perform(post(baseUrl + "/" + germinacionId + "/celdas/" + tabla + "/repeticiones/" + repeticion).with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error al agregar repetición: Fallo interno"));
    }

    // POST /{germinacionId}/celdas/{tabla}/repeticiones"

    @Test
    @WithMockUser(authorities = "ADMIN")
    void agregarRepeticionAutoNumerada_ReturnsCreated() throws Exception {
        Long germinacionId = 1L;
        String tabla = "finales";

        Map<String, Object> response = Map.of(
                "msg", "Repetición creada",
                "repeticion", 3
        );

        Mockito.when(service.addRepeticionAcrossConteos(germinacionId, tabla, null))
                .thenReturn(response);

        mockMvc.perform(post(baseUrl + "/" + germinacionId + "/celdas/" + tabla + "/repeticiones")
                        .with(csrf()))  // OBLIGATORIO
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.msg").value("Repetición creada"))
                .andExpect(jsonPath("$.repeticion").value(3));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void agregarRepeticionAutoNumerada_ReturnsBadRequest_WhenIllegalArgument() throws Exception {
        Long germinacionId = 1L;
        String tabla = "finales";

        Mockito.when(service.addRepeticionAcrossConteos(germinacionId, tabla, null))
                .thenThrow(new IllegalArgumentException("Tabla inválida"));

        mockMvc.perform(post(baseUrl + "/" + germinacionId + "/celdas/" + tabla + "/repeticiones")
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Tabla inválida"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void agregarRepeticionAutoNumerada_ReturnsInternalServerError_WhenException() throws Exception {
        Long germinacionId = 1L;
        String tabla = "finales";

        Mockito.when(service.addRepeticionAcrossConteos(germinacionId, tabla, null))
                .thenThrow(new RuntimeException("Falló la BD"));

        mockMvc.perform(post(baseUrl + "/" + germinacionId + "/celdas/" + tabla + "/repeticiones")
                        .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error al agregar repetición: Falló la BD"));
    }

}
