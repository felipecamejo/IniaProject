package ti.proyectoinia.api.controllers.integration;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.PandMiddlewareController;
import ti.proyectoinia.api.responses.MiddlewareResponse;
import ti.proyectoinia.services.PandMiddlewareService;
import ti.proyectoinia.services.PythonMiddlewareHttpService;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PandMiddlewareController.class)
public class PandMiddlewareControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PandMiddlewareService service;

    @MockitoBean
    private PythonMiddlewareHttpService pythonService;


    @Test
    @WithMockUser(authorities = {"ADMIN"})
    void exportar_ReturnsZip_OK() throws Exception {
        byte[] zip = new byte[]{1,2,3};

        Mockito.when(pythonService.descargarExportZip(null, "xlsx"))
                .thenReturn(zip);

        mockMvc.perform(post("/api/v1/pandmiddleware/http/exportar").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition",
                        Matchers.containsString("attachment")))
                .andExpect(content().bytes(zip));
    }

    @Test
    @WithMockUser(authorities = {"ADMIN"})
    void exportar_Returns500_WhenNullReturned() throws Exception {
        Mockito.when(pythonService.descargarExportZip(null, "xlsx"))
                .thenReturn(null);

        mockMvc.perform(post("/api/v1/pandmiddleware/http/exportar").with(csrf()))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(authorities = {"ADMIN"})
    void exportar_Returns500_WhenZipIsEmpty() throws Exception {
        Mockito.when(pythonService.descargarExportZip(null, "xlsx"))
                .thenReturn(new byte[0]);

        mockMvc.perform(post("/api/v1/pandmiddleware/http/exportar").with(csrf()))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(authorities = {"ADMIN"})
    void importar_SingleFile_OK() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "files", "clientes.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "data".getBytes()
        );

        MiddlewareResponse okResp = new MiddlewareResponse();
        okResp.setExitoso(true);
        okResp.setMensaje("OK");
        okResp.setCodigo(200);


        Mockito.when(pythonService.importarTabla(
                Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyBoolean(),
                Mockito.anyString(), Mockito.any()
        )).thenReturn(okResp);

        mockMvc.perform(multipart("/api/v1/pandmiddleware/http/importar")
                        .file(file)
                        .with(csrf())
                        .param("upsert", "false")
                        .param("keep_ids", "false"))
                .andExpect(status().isOk());
    }


    @Test
    @WithMockUser(authorities = {"ADMIN"})
    void importar_NoFiles_Returns400() throws Exception {
        mockMvc.perform(multipart("/api/v1/pandmiddleware/http/importar")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }


    @Test
    @WithMockUser(authorities = {"ADMIN"})
    void importar_InvalidExtension_Returns400() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "files", "script.exe", "application/octet-stream",
                "dummy".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/pandmiddleware/http/importar")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = {"ADMIN"})
    void analizar_ValidFile_OK() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "datos.xlsx", "application/vnd.ms-excel",
                "excel-data".getBytes()
        );

        MiddlewareResponse resp = new MiddlewareResponse();
        resp.setExitoso(true);
        resp.setMensaje("OK");
        resp.setCodigo(200);

        Mockito.when(pythonService.analizarExcel(
                        Mockito.anyString(), Mockito.any(), Mockito.anyString(),
                        Mockito.anyBoolean(), Mockito.anyDouble()))
                .thenReturn(resp);

        mockMvc.perform(multipart("/api/v1/pandmiddleware/http/analizar")
                        .file(file)
                        .param("formato", "json")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exitoso").value(true));
    }


    @Test
    @WithMockUser(authorities = {"ADMIN"})
    void analizar_FileEmpty_Returns400() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.xlsx", "application/vnd.ms-excel", new byte[0]
        );

        mockMvc.perform(multipart("/api/v1/pandmiddleware/http/analizar")
                        .file(emptyFile)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Archivo vacío"));
    }


    @Test
    @WithMockUser(authorities = {"ADMIN"})
    void analizar_InvalidExtension_Returns400() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "data.json", "application/json", "{}".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/pandmiddleware/http/analizar")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Formato de archivo no válido"));
    }

}
