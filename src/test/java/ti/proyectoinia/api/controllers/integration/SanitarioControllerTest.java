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
import ti.proyectoinia.api.controllers.SanitarioController;
import ti.proyectoinia.api.responses.ResponseListadoSanitario;
import ti.proyectoinia.dtos.SanitarioDto;
import ti.proyectoinia.dtos.SanitarioHongoDto;
import ti.proyectoinia.services.SanitarioService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SanitarioController.class)
public class SanitarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SanitarioService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/sanitario";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        SanitarioDto dto = new SanitarioDto();
        dto.setId(1L);
        dto.setFechaCreacion("now");

        Mockito.when(service.obtenerSanitarioPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsNotFound() throws Exception {
        Mockito.when(service.obtenerSanitarioPorId(2L)).thenReturn(null);

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
        SanitarioDto input = new SanitarioDto();
        input.setId(null);
        input.setFechaCreacion("now");

        Mockito.when(service.crearSanitario(any(SanitarioDto.class))).thenReturn(1L);

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
        SanitarioDto input = new SanitarioDto();
        input.setId(1L);
        input.setFechaCreacion("now");

        Mockito.when(service.editarSanitario(any(SanitarioDto.class))).thenReturn(input.getId());

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void editar_ReturnsBadRequest_WhenIdNull() throws Exception {
        SanitarioDto input = new SanitarioDto();
        input.setFechaCreacion("now");

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
        Mockito.when(service.eliminarSanitario(1L)).thenReturn("Eliminado");

        mockMvc.perform(delete(baseUrl + "/eliminar/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Eliminado. ID:1"));

        Mockito.verify(service).eliminarSanitario(1L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void eliminar_ReturnsBadRequest() throws Exception {
        Mockito.doThrow(new EntityNotFoundException("No existe"))
                .when(service).eliminarSanitario(2L);

        mockMvc.perform(delete(baseUrl + "/eliminar/2")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        Mockito.verify(service).eliminarSanitario(2L);
    }

    //----- GET /listar/recibo/{id} -----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarPorRecibo_ReturnsOk() throws Exception {
        Long reciboId = 1L;

        SanitarioDto entity1 = new SanitarioDto();
        entity1.setId(1L);
        SanitarioDto entity2 = new SanitarioDto();
        entity2.setId(2L);

        ResponseListadoSanitario response = new ResponseListadoSanitario((List.of(entity1, entity2)));

        Mockito.when(service.listadoSanitarioPorReciboId(reciboId))
                .thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(baseUrl + "/listar/recibo/" + reciboId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarPorRecibo_ReturnsNotFound() throws Exception {
        Long reciboId = 99L;

        Mockito.when(service.listadoSanitarioPorReciboId(reciboId))
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

    //---- Listar Hongos ----

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarHongos_ReturnsOk() throws Exception {
        Long id = 5L;

        List<SanitarioHongoDto> mockList = List.of(new SanitarioHongoDto());
        Mockito.when(service.listarHongosPorSanitario(id)).thenReturn(mockList);

        mockMvc.perform(get(baseUrl + "/listar-hongos/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        Mockito.verify(service).listarHongosPorSanitario(id);
    }

    //---- PUT /actualizar-hongos/{sanitarioId} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarHongos_ReturnsOk() throws Exception {
        Long id = 5L;

        List<SanitarioHongoDto> body = List.of(new SanitarioHongoDto());

        mockMvc.perform(put(baseUrl + "/actualizar-hongos/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().string("Hongos actualizados correctamente"));

        Mockito.verify(service).actualizarHongosCompleto(eq(id), anyList());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarHongos_ReturnsInternalServerError() throws Exception {
        Long id = 5L;

        List<SanitarioHongoDto> body = List.of(new SanitarioHongoDto());

        Mockito.doThrow(new RuntimeException("boom"))
                .when(service).actualizarHongosCompleto(eq(id), anyList());

        mockMvc.perform(put(baseUrl + "/actualizar-hongos/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Error al actualizar hongos")));

        Mockito.verify(service).actualizarHongosCompleto(eq(id), anyList());
    }



}
