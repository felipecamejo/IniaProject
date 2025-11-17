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

import ti.proyectoinia.api.controllers.LoteController;
import ti.proyectoinia.api.responses.ResponseListadoLotes;
import org.springframework.http.ResponseEntity;
import ti.proyectoinia.dtos.LoteDto;
import ti.proyectoinia.services.LoteService;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LoteController.class)
@Import(TestSecurityConfig.class)
public class LoteSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    LoteService loteService;

    String apiUrl = "/api/v1/lote";

    // ============================================================================
    //  POST /crear → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrearLote() throws Exception {
        when(loteService.crearLote(any(LoteDto.class))).thenReturn(1L);

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isCreated());
    }


    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeCrearLote() throws Exception {
        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlCrear() throws Exception {
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
    void adminPuedeListarLotes() throws Exception {
        when(loteService.listadoLotes()).thenReturn(ResponseEntity.ok(new ResponseListadoLotes()));

        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isOk());
    }


    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeListarLotes() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlListar() throws Exception {
        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /{id} → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeObtenerLote() throws Exception {
        when(loteService.obtenerLotePorId(1L)).thenReturn(new LoteDto());

        mockMvc.perform(get(apiUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    void noAutenticadoDebeRetornar401AlObtenerLote() throws Exception {
        mockMvc.perform(get(apiUrl + "/1"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  PUT /editar → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEditarLote() throws Exception {
        LoteDto dto = new LoteDto();
        dto.setId(1L);

        when(loteService.editarLote(any(LoteDto.class))).thenReturn(1L);

        mockMvc.perform(put(apiUrl + "/editar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    void noAutenticadoDebeRetornar401AlEditarLote() throws Exception {
        mockMvc.perform(put(apiUrl + "/editar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  PUT /eliminar/{id} → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeEliminarLote() throws Exception {
        when(loteService.eliminarLote(1L)).thenReturn("Lote eliminado");

        mockMvc.perform(delete(apiUrl + "/eliminar/1"))
                .andExpect(status().isOk());
    }


    @Test
    void noAutenticadoDebeRetornar401AlEliminarLote() throws Exception {
        mockMvc.perform(put(apiUrl + "/eliminar/1"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /recibo/{loteId} → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeObtenerReciboPorLoteId() throws Exception {
        when(loteService.obtenerReciboIdPorLoteId(1L)).thenReturn(Optional.of(10L));

        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeObtenerReciboPorLoteId() throws Exception {
        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlObtenerRecibo() throws Exception {
        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isUnauthorized());
    }

    // ============================================================================
    //  GET /verificar-asociacion/{loteId}/{reciboId} → ADMIN, ANALISTA, OBSERVADOR
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeVerificarAsociacion() throws Exception {
        when(loteService.verificarAsociacionReciboLote(1L, 2L)).thenReturn(true);

        mockMvc.perform(get(apiUrl + "/verificar-asociacion/1/2"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void guestNoPuedeVerificarAsociacion() throws Exception {
        mockMvc.perform(get(apiUrl + "/verificar-asociacion/1/2"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoDebeRetornar401AlVerificarAsociacion() throws Exception {
        mockMvc.perform(get(apiUrl + "/verificar-asociacion/1/2"))
                .andExpect(status().isUnauthorized());
    }
}
