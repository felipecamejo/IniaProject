package ti.proyectoinia.api.controllers.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.PandMiddlewareController;
import ti.proyectoinia.api.responses.MiddlewareResponse;
import ti.proyectoinia.services.PandMiddlewareService;
import ti.proyectoinia.services.PythonMiddlewareHttpService;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PandMiddlewareController.class)
@Import(TestSecurityConfig.class)
public class PandMiddlewareSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    PandMiddlewareService pandMiddlewareService;

    @MockitoBean
    PythonMiddlewareHttpService pythonHttpService;

    String apiUrl = "/api/v1/pandmiddleware";

    @TestConfiguration
    static class TestConfig {
        @Bean
        public PandMiddlewareService pandMiddlewareService() {
            return mock(PandMiddlewareService.class);
        }

        @Bean
        public PythonMiddlewareHttpService pythonHttpService() {
            return mock(PythonMiddlewareHttpService.class);
        }
    }

    // ======================== EXPORTAR (ADMIN, ANALISTA) ========================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeExportar() throws Exception {
        when(pythonHttpService.descargarExportZip(null, "xlsx")).thenReturn(new byte[]{1, 2, 3});

        mockMvc.perform(post(apiUrl + "/http/exportar"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ANALISTA")
    void analistaPuedeExportar() throws Exception {
        when(pythonHttpService.descargarExportZip(null, "xlsx")).thenReturn(new byte[]{1, 2, 3});

        mockMvc.perform(post(apiUrl + "/http/exportar"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeExportar() throws Exception {
        mockMvc.perform(post(apiUrl + "/http/exportar"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoNoPuedeExportar() throws Exception {
        mockMvc.perform(post(apiUrl + "/http/exportar"))
                .andExpect(status().isUnauthorized());
    }

    // ======================== IMPORTAR (ADMIN, ANALISTA) ========================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeImportar() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "files",
                "test.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "dummy".getBytes()
        );

        MiddlewareResponse resp = new MiddlewareResponse();
        resp.setExitoso(true);
        resp.setMensaje("ok");

        when(pythonHttpService.importarTabla(anyString(), any(Boolean.class), any(Boolean.class), anyString(), any(byte[].class)))
                .thenReturn(resp);

        mockMvc.perform(multipart(apiUrl + "/http/importar")
                        .file(file)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("table", "mi_tabla")
                        .param("upsert", "false")
                        .param("keep_ids", "false"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeImportar() throws Exception {
        MockMultipartFile file = new MockMultipartFile("files", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "d".getBytes());

        mockMvc.perform(multipart(apiUrl + "/http/importar").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoNoPuedeImportar() throws Exception {
        MockMultipartFile file = new MockMultipartFile("files", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "d".getBytes());

        mockMvc.perform(multipart(apiUrl + "/http/importar").file(file))
                .andExpect(status().isUnauthorized());
    }

    // ======================== ANALIZAR (ADMIN) ========================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeAnalizar() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "d".getBytes());

        MiddlewareResponse resp = new MiddlewareResponse();
        resp.setExitoso(true);
        resp.setMensaje("analizado");

        when(pythonHttpService.analizarExcel(anyString(), any(byte[].class), anyString(), any(Boolean.class), any(Double.class)))
                .thenReturn(resp);

        mockMvc.perform(multipart(apiUrl + "/http/analizar")
                        .file(file)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .param("formato", "json")
                        .param("contrastar_bd", "true")
                        .param("umbral_coincidencia", "30.0"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "GUEST")
    void userNoPuedeAnalizar() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "d".getBytes());

        mockMvc.perform(multipart(apiUrl + "/http/analizar").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoNoPuedeAnalizar() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "d".getBytes());

        mockMvc.perform(multipart(apiUrl + "/http/analizar").file(file))
                .andExpect(status().isUnauthorized());
    }

    // ======================== INSERTAR DATOS MASIVOS (ADMIN) ========================

    @Test
    @WithMockUser(authorities = "ADMIN")
    void adminPuedeInsertarDatosMasivos() throws Exception {
        when(pandMiddlewareService.ejecutarInsertarDatosMasivos(anyInt())).thenReturn("ExitCode: 0");

        mockMvc.perform(post(apiUrl + "/insertar-datos-masivos"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OBSERVADOR")
    void userNoPuedeInsertarDatosMasivos() throws Exception {
        mockMvc.perform(post(apiUrl + "/insertar-datos-masivos"))
                .andExpect(status().isForbidden());
    }

    @Test
    void noAutenticadoNoPuedeInsertarDatosMasivos() throws Exception {
        mockMvc.perform(post(apiUrl + "/insertar-datos-masivos"))
                .andExpect(status().isUnauthorized());
    }
}

