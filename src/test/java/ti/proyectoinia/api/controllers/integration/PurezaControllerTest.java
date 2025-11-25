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
import ti.proyectoinia.api.controllers.PurezaController;
import ti.proyectoinia.api.responses.ResponseListadoPurezas;
import ti.proyectoinia.dtos.PurezaDto;
import ti.proyectoinia.services.PurezaService;

import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PurezaController.class)
public class PurezaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PurezaService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/pureza";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        PurezaDto dto = new PurezaDto();
        dto.setId(1L);
        dto.setFechaCreacion(new Date());

        Mockito.when(service.obtenerPurezaPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsNotFound() throws Exception {
        Mockito.when(service.obtenerPurezaPorId(2L)).thenReturn(null);

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
    void crear_ReturnsCreated() throws Exception {
        PurezaDto input = new PurezaDto();
        input.setId(null);
        input.setFechaCreacion(new Date());

        Mockito.when(service.crearPureza(any(PurezaDto.class))).thenReturn(1L);

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isCreated());
    }

    // ---- PUT /editar ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void editar_ReturnsOk() throws Exception {
        PurezaDto input = new PurezaDto();
        input.setId(1L);
        input.setFechaCreacion(new Date());

        Mockito.when(service.editarPureza(any(PurezaDto.class))).thenReturn(input.getId());

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void editar_ReturnsBadRequest_WhenIdNull() throws Exception {
        PurezaDto input = new PurezaDto();
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
    void eliminar_ReturnsOk() throws Exception {
        Mockito.when(service.eliminarPureza(1L)).thenReturn("Eliminado");

        mockMvc.perform(delete(baseUrl + "/eliminar/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Eliminado. ID:1"));

        Mockito.verify(service).eliminarPureza(1L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void eliminar_ReturnsBadRequest() throws Exception {
        Mockito.doThrow(new EntityNotFoundException("No existe"))
                .when(service).eliminarPureza(2L);

        mockMvc.perform(delete(baseUrl + "/eliminar/2")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        Mockito.verify(service).eliminarPureza(2L);
    }

    //----- GET /listar/recibo/{id} -----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarPorRecibo_ReturnsOk() throws Exception {
        Long reciboId = 1L;

        PurezaDto entity1 = new PurezaDto();
        entity1.setId(1L);
        PurezaDto entity2 = new PurezaDto();
        entity2.setId(2L);

        ResponseListadoPurezas response = new ResponseListadoPurezas((List.of(entity1, entity2)));

        Mockito.when(service.listadoPurezasPorRecibo(reciboId))
                .thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(baseUrl + "/listar/recibo/" + reciboId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarPorRecibo_ReturnsNotFound() throws Exception {
        Long reciboId = 99L;

        Mockito.when(service.listadoPurezasPorRecibo(reciboId))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get(baseUrl + "/listar/recibo/" + reciboId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarPorRecibo_IdInvalid_ReturnsBadRequest() throws Exception {
        mockMvc.perform(get(baseUrl + "/listar/recibo/abc"))
                .andExpect(status().isBadRequest());
    }

}
