package ti.proyectoinia.api.controllers.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.CertificadoController;
import ti.proyectoinia.api.responses.ResponseListadoCertificados;
import ti.proyectoinia.dtos.CertificadoDto;
import ti.proyectoinia.services.CertificadoService;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CertificadoController.class)
class CertificadoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CertificadoService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/certificado";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        CertificadoDto dto = new CertificadoDto();
        dto.setCultivar("Felipe");
        Mockito.when(service.obtenerCertificadoPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_IdIncorrect() throws Exception {
        Mockito.when(service.listadoCertificadosPorRecibo(1L)).thenReturn(null);

        mockMvc.perform(get(baseUrl + "/2"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_IdInvalid() throws Exception {
        mockMvc.perform(get(baseUrl + "/molleja"))
                .andExpect(status().isBadRequest());
    }

    // ---- GET /recibo/{reciboId} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getByRecibo_ReturnsOk() throws Exception {
        ResponseListadoCertificados resp = new ResponseListadoCertificados();
        Long parametro = 1L;
        Mockito.when(service.listadoCertificadosPorRecibo(parametro)).thenReturn(ResponseEntity.ok(resp));

        mockMvc.perform(get(baseUrl + "/recibo/" + parametro))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getByRecibo_ReciboInvalid() throws Exception {
        mockMvc.perform(get(baseUrl + "/recibo/" + 1L))
                .andExpect(status().isBadRequest());
    }

    // ---- POST /crear ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void crearAutocompletado_Correcto() throws Exception {
        CertificadoDto input = new CertificadoDto();
        input.setCultivar("Felipe");

        Mockito.when(service.crearCertificado(any(CertificadoDto.class)))
                .thenReturn(input);

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isCreated());
    }

    // ---- PUT /editar ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void update_ReturnsUpdated() throws Exception {
        CertificadoDto input = new CertificadoDto();
        input.setId(1L);
        input.setCultivar("Actualizado");

        Mockito.when(service.editarCertificado(any(CertificadoDto.class))).thenReturn("Creado");

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(content().string("Creado"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void update_ReturnsBadRequest_WhenParametroIsEmpty() throws Exception {
        CertificadoDto input = new CertificadoDto();
        input.setId(null);
        input.setCultivar("");

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    // ---- PUT /eliminar/{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsOk() throws Exception {
        mockMvc.perform(put(baseUrl + "/eliminar/1")
                        .with(csrf()))
                .andExpect(status().isOk());

        Mockito.verify(service).eliminarCertificado(1L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsNotFound() throws Exception {
        Mockito.doThrow(new EntityNotFoundException("No existe"))
                .when(service).eliminarCertificado(2L);

        mockMvc.perform(put(baseUrl + "/eliminar/2")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        Mockito.verify(service).eliminarCertificado(2L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsBadRequest() throws Exception {
        mockMvc.perform(put(baseUrl + "/eliminar/feliaoda")
                        .with(csrf()))
                .andExpect(status().isBadRequest());

        Mockito.verifyNoInteractions(service);
    }

    // ---- GET ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void get_ReturnsOk() throws Exception {
        ResponseListadoCertificados dto = new ResponseListadoCertificados();
        Mockito.when(service.listadoCertificados()).thenReturn(ResponseEntity.ok(dto));

        //listar

        mockMvc.perform(get(baseUrl + "/listar"))
                .andExpect(status().isOk());
    }
}
