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
import ti.proyectoinia.api.controllers.DOSNController;
import ti.proyectoinia.api.responses.ResponseListadoDOSN;
import ti.proyectoinia.dtos.DOSNDto;
import ti.proyectoinia.services.DOSNService;

import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DOSNController.class)
public class DOSNControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DOSNService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/DOSN";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        DOSNDto dto = new DOSNDto();
        dto.setId(1L);
        dto.setFechaCreacion(new Date());

        Mockito.when(service.obtenerDOSNPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsNotFound() throws Exception {
        Mockito.when(service.obtenerDOSNPorId(2L)).thenReturn(null);

        mockMvc.perform(get(baseUrl + "/2"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsBadRequest_WhenIdInvalid() throws Exception {
        mockMvc.perform(get(baseUrl + "/molleja"))
                .andExpect(status().isBadRequest());
    }

    // ---- POST /crear ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void crearDOSN_ReturnsCreated() throws Exception {
        DOSNDto input = new DOSNDto();
        input.setId(null);
        input.setFechaCreacion(new Date());

        Mockito.when(service.crearDOSN(any(DOSNDto.class))).thenReturn(1L);

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isCreated());
    }

    // ---- PUT /editar ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void editarDOSN_ReturnsOk() throws Exception {
        DOSNDto input = new DOSNDto();
        input.setId(1L);
        input.setFechaCreacion(new Date());

        Mockito.when(service.editarDOSN(any(DOSNDto.class))).thenReturn("Actualizado");

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(content().string("Actualizado"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void editarDOSN_ReturnsBadRequest_WhenIdNull() throws Exception {
        DOSNDto input = new DOSNDto();
        input.setFechaCreacion(new Date());

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    // ---- DELETE /eliminar/{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void eliminarDOSN_ReturnsOk() throws Exception {
        Mockito.when(service.eliminarDOSN(1L)).thenReturn("Eliminado");

        mockMvc.perform(delete(baseUrl + "/eliminar/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Eliminado. ID:1"));

        Mockito.verify(service).eliminarDOSN(1L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void eliminarDOSN_ReturnsBadRequest() throws Exception {
        Mockito.doThrow(new EntityNotFoundException("No existe"))
                .when(service).eliminarDOSN(2L);

        mockMvc.perform(delete(baseUrl + "/eliminar/2")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        Mockito.verify(service).eliminarDOSN(2L);
    }

    //----- GET /listar/recibo/{id} -----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarDosnPorRecibo_ReturnsOk() throws Exception {
        Long reciboId = 1L;

        ResponseListadoDOSN response = new ResponseListadoDOSN();
        DOSNDto dosn1 = new DOSNDto();
        dosn1.setId(1L);
        DOSNDto dosn2 = new DOSNDto();
        dosn2.setId(2L);
        response.setDOSN(List.of(dosn1, dosn2));

        Mockito.when(service.listadoDOSNporRecibo(reciboId))
                .thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(baseUrl + "/listar/recibo/" + reciboId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarDosnPorRecibo_ReturnsNotFound() throws Exception {
        Long reciboId = 99L;

        Mockito.when(service.listadoDOSNporRecibo(reciboId))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get(baseUrl + "/listar/recibo/" + reciboId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarDosnPorRecibo_IdInvalid_ReturnsBadRequest() throws Exception {
        mockMvc.perform(get(baseUrl + "/listar/recibo/abc"))
                .andExpect(status().isBadRequest());
    }

}
