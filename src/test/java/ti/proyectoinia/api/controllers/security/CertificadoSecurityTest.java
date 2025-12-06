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
import ti.proyectoinia.api.controllers.CertificadoController;
import ti.proyectoinia.api.responses.ResponseListadoCertificados;
import ti.proyectoinia.dtos.CertificadoDto;
import ti.proyectoinia.services.CertificadoService;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CertificadoController.class)
@Import(TestSecurityConfig.class)
public class CertificadoSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    CertificadoService certificadoService;

    String apiUrl = "/api/v1/certificado";

    @TestConfiguration
    static class TestConfig {
        @Bean
        public CertificadoService certificadoService() {
            return mock(CertificadoService.class);
        }
    }

    // ============================================================================
    //  POST /crear → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeCrear() throws Exception {
        CertificadoDto dto = new CertificadoDto();
        dto.setCategoria("Ropa");

        when(certificadoService.crearCertificado(any())).thenReturn(dto);

        mockMvc.perform(post(apiUrl + "/crear")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeCrear() throws Exception {
        CertificadoDto dto = new CertificadoDto();
        dto.setCategoria("Electrodomesticos");

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
    //  GET /listar → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeListar() throws Exception {
        ResponseListadoCertificados response = new ResponseListadoCertificados();
        response.setCertificados(Collections.emptyList());

        when(certificadoService.listadoCertificados()).thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(apiUrl + "/listar"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
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
    //  GET /{id} → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeVerPorId() throws Exception {
        CertificadoDto dto = new CertificadoDto();
        dto.setId(1L);
        dto.setCategoria("Soja");

        when(certificadoService.obtenerCertificadoPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(apiUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
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
        CertificadoDto dto = new CertificadoDto();
        dto.setId(1L);
        dto.setCategoria("Nueva Categoria");

        when(certificadoService.editarCertificado(any())).thenReturn("Editado");

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
        when(certificadoService.eliminarCertificado(1L)).thenReturn("Eliminado");

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

    // ============================================================================
    //  GET por Recibo /listar → solo ADMIN
    // ============================================================================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeListarPorRecibo() throws Exception {
        ResponseListadoCertificados response = new ResponseListadoCertificados();
        response.setCertificados(Collections.emptyList());

        Long id = 1L;

        when(certificadoService.listadoCertificadosPorRecibo(id)).thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(apiUrl + "/recibo/" + id))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeListarPorRecibo() throws Exception {
        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoListarPorReciboDebeDar401() throws Exception {
        mockMvc.perform(get(apiUrl + "/recibo/1"))
                .andExpect(status().isUnauthorized());
    }

}
