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
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.AutocompletadoController;
import ti.proyectoinia.api.responses.ResponseListadoAutocompletados;
import ti.proyectoinia.dtos.AutocompletadoDto;
import ti.proyectoinia.services.AutocompletadoService;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AutocompletadoController.class)
@Import(TestSecurityConfig.class)
public class AutocompletadoSecurityTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    AutocompletadoService autocompletadoService;

    String apiUrl = "/api/v1/autocompletado";

    @TestConfiguration
    static class TestConfig {
        @Bean
        public AutocompletadoService autocompletadoService() {
            return mock(AutocompletadoService.class);
        }
    }

    // ============================================================================
    //  POST /crear → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrear() throws Exception {
        AutocompletadoDto dto = new AutocompletadoDto();
        dto.setParametro("hola");

        when(autocompletadoService.crearAutocompletado(any())).thenReturn("Creado");

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeCrear() throws Exception {
        AutocompletadoDto dto = new AutocompletadoDto();
        dto.setParametro("halo?");

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
    //  GET /listar → ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeListar() throws Exception {
        ResponseListadoAutocompletados response = new ResponseListadoAutocompletados();
        response.setAutocompletados(Collections.emptyList());

        when(autocompletadoService.listadoAutocompletados()).thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void AnalistaNoPuedeListar() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoListarDebeDar401() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /{id} → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void analistaPuedeVerPorId() throws Exception {
        AutocompletadoDto dto = new AutocompletadoDto();
        dto.setId(1L);
        dto.setParametro("Chau");

        when(autocompletadoService.obtenerAutocompletadoPorId(1L)).thenReturn(dto);

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
    //  GET Por Parametros /{id} → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void analistaPuedePorParametros() throws Exception {
        ResponseListadoAutocompletados response = new ResponseListadoAutocompletados();
        response.setAutocompletados(Collections.emptyList());

        String parametro = "Chau";

        when(autocompletadoService.obtenerPorParametro(parametro)).thenReturn(response);

        mockMvc.perform(get(apiUrl + "/por-parametro/" + parametro))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void userNoPuedePorParametro() throws Exception {
        mockMvc.perform(get(apiUrl + "/por-parametro/holis"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoPorParametroDebeDar401() throws Exception {
        mockMvc.perform(get(apiUrl + "/por-parametro/holis"))
                .andExpect(status().isUnauthorized());
    }


    // ============================================================================
    //  PUT /editar → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEditar() throws Exception {
        AutocompletadoDto dto = new AutocompletadoDto();
        dto.setId(1L);
        dto.setParametro("Nuevo Nombre");

        when(autocompletadoService.editarAutocompletado(any())).thenReturn("Editado");

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
        when(autocompletadoService.eliminarAutocompletado(1L)).thenReturn("Eliminado");

        mockMvc.perform(put(apiUrl + "/eliminar/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeEliminar() throws Exception {
        mockMvc.perform(put(apiUrl + "/eliminar/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoEliminarDebeDar401() throws Exception {
        mockMvc.perform(put(apiUrl + "/eliminar/1"))
                .andExpect(status().isUnauthorized());
    }
}
