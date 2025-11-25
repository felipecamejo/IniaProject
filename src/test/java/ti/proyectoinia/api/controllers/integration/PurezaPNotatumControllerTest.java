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
import ti.proyectoinia.api.controllers.PurezaPNotatumController;
import ti.proyectoinia.api.responses.ResponseListadoPurezaPNotatum;
import ti.proyectoinia.dtos.PurezaPNotatumDto;
import ti.proyectoinia.dtos.RepeticionesPPNDTO;
import ti.proyectoinia.services.PurezaPNotatumService;

import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PurezaPNotatumController.class)
public class PurezaPNotatumControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PurezaPNotatumService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/PurezaPNotatum";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        PurezaPNotatumDto dto = new PurezaPNotatumDto();
        dto.setId(1L);
        dto.setFechaCreacion(new Date());

        Mockito.when(service.obtenerPurezaPNotatumPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsNotFound() throws Exception {
        Mockito.when(service.obtenerPurezaPNotatumPorId(2L)).thenReturn(null);

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
        PurezaPNotatumDto input = new PurezaPNotatumDto();
        input.setId(null);
        input.setFechaCreacion(new Date());

        Mockito.when(service.crearPurezaPNotatum(any(PurezaPNotatumDto.class))).thenReturn(1L);

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
        PurezaPNotatumDto input = new PurezaPNotatumDto();
        input.setId(1L);
        input.setFechaCreacion(new Date());

        Mockito.when(service.editarPurezaPNotatum(any(PurezaPNotatumDto.class))).thenReturn(input.getId());

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void editar_ReturnsBadRequest_WhenIdNull() throws Exception {
        PurezaPNotatumDto input = new PurezaPNotatumDto();
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
        Mockito.when(service.eliminarPurezaPNotatum(1L)).thenReturn("Eliminado");

        mockMvc.perform(delete(baseUrl + "/eliminar/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Eliminado. ID:1"));

        Mockito.verify(service).eliminarPurezaPNotatum(1L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void eliminar_ReturnsBadRequest() throws Exception {
        Mockito.doThrow(new EntityNotFoundException("No existe"))
                .when(service).eliminarPurezaPNotatum(2L);

        mockMvc.perform(delete(baseUrl + "/eliminar/2")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        Mockito.verify(service).eliminarPurezaPNotatum(2L);
    }

    //----- GET /listar/recibo/{id} -----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarPorRecibo_ReturnsOk() throws Exception {
        Long reciboId = 1L;

        PurezaPNotatumDto entity1 = new PurezaPNotatumDto();
        entity1.setId(1L);
        PurezaPNotatumDto entity2 = new PurezaPNotatumDto();
        entity2.setId(2L);

        ResponseListadoPurezaPNotatum response = new ResponseListadoPurezaPNotatum(List.of(entity1, entity2));

        Mockito.when(service.listadoPurezaPNotatumporRecibo(reciboId))
                .thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(baseUrl + "/listar/recibo/" + reciboId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarPorRecibo_ReturnsNotFound() throws Exception {
        Long reciboId = 99L;

        Mockito.when(service.listadoPurezaPNotatumporRecibo(reciboId))
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

    // ------ POST Actualizar Repeticiones ------
    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarRepeticiones_ReturnsOk() throws Exception {
        Long id = 10L;

        List<RepeticionesPPNDTO> body = List.of(new RepeticionesPPNDTO());

        mockMvc.perform(put(baseUrl + "/actualizar-repeticiones/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().string("Repeticiones actualizadas correctamente"));

        Mockito.verify(service).actualizarRepeticionesCompleto(eq(id), anyList());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarRepeticiones_ReturnsInternalServerError() throws Exception {
        Long id = 10L;

        List<RepeticionesPPNDTO> body = List.of(new RepeticionesPPNDTO());

        Mockito.doThrow(new RuntimeException("falló"))
                .when(service).actualizarRepeticionesCompleto(eq(id), anyList());

        mockMvc.perform(put(baseUrl + "/actualizar-repeticiones/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Error al actualizar")));

        Mockito.verify(service).actualizarRepeticionesCompleto(eq(id), anyList());
    }

    // ------ GET Repeticiones ------

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarRepeticiones_ReturnsOk() throws Exception {
        Long id = 10L;

        List<RepeticionesPPNDTO> mockList = List.of(new RepeticionesPPNDTO());
        Mockito.when(service.listarRepeticionesPorPPN(id)).thenReturn(mockList);

        mockMvc.perform(get(baseUrl + "/listar-repeticiones/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        Mockito.verify(service).listarRepeticionesPorPPN(id);
    }


}
