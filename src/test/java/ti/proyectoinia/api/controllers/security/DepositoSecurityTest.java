package ti.proyectoinia.api.controllers.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.DepositoController;
import ti.proyectoinia.api.responses.ResponseListadoDepositos;
import ti.proyectoinia.dtos.DepositoDto;
import ti.proyectoinia.dtos.HongoDto;
import ti.proyectoinia.services.DepositoService;

import java.util.Collections;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(DepositoController.class)
@Import(TestSecurityConfig.class)
public class DepositoSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    DepositoService depositoService;

    String apiUrl = "/api/v1/deposito";

    @TestConfiguration
    static class TestConfig {
        @Bean
        public DepositoService depositoService() {
            return mock(DepositoService.class);
        }
    }

    // ============================================================================
    //  POST /crear → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrear() throws Exception {
        DepositoDto dto = new DepositoDto();
        dto.setNombre("Maíz");

        when(depositoService.crearDeposito(any())).thenReturn("Creado");

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeCrear() throws Exception {
        DepositoDto dto = new DepositoDto();
        dto.setNombre("Trigo");

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
    //  GET /listar → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeListar() throws Exception {
        ResponseListadoDepositos response = new ResponseListadoDepositos();
        response.setDepositos(Collections.emptyList());

        when(depositoService.listadoDepositos()).thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void userNoPuedeListar() throws Exception {
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
        DepositoDto dto = new DepositoDto();
        dto.setId(1L);
        dto.setNombre("Soja");

        when(depositoService.obtenerDepositoPorId(1L)).thenReturn(dto);

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
    //  PUT /editar → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEditar() throws Exception {
        HongoDto dto = new HongoDto();
        dto.setId(1L);
        dto.setNombre("Nuevo Nombre");

        when(depositoService.editarDeposito(any())).thenReturn("Editado");

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
        when(depositoService.eliminarDeposito(1L)).thenReturn("Eliminado");

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
