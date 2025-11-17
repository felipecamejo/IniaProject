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
import ti.proyectoinia.api.controllers.TetrazolioController;
import ti.proyectoinia.api.responses.ResponseListadoTetrazolio;
import ti.proyectoinia.dtos.DetalleSemillasTetrazolioDto;
import ti.proyectoinia.dtos.RepeticionTetrazolioDto;
import ti.proyectoinia.dtos.TetrazolioDto;
import ti.proyectoinia.services.TetrazolioService;

import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TetrazolioController.class)
public class TetrazolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TetrazolioService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/tetrazolio";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        TetrazolioDto dto = new TetrazolioDto();
        dto.setId(1L);
        dto.setFechaCreacion(new Date());

        Mockito.when(service.obtenerTetrazolioPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsNotFound() throws Exception {
        Mockito.when(service.obtenerTetrazolioPorId(2L)).thenReturn(null);

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
        TetrazolioDto input = new TetrazolioDto();
        input.setId(null);
        input.setFechaCreacion(new Date());

        Mockito.when(service.editarTetrazolio(any(TetrazolioDto.class))).thenReturn("Editado");

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
        TetrazolioDto input = new TetrazolioDto();
        input.setId(1L);
        input.setFechaCreacion(new Date());

        Mockito.when(service.editarTetrazolio(any(TetrazolioDto.class))).thenReturn("Editado");

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void editar_ReturnsBadRequest_WhenIdNull() throws Exception {
        TetrazolioDto input = new TetrazolioDto();
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
        Mockito.when(service.eliminarTetrazolio(1L)).thenReturn("Eliminado");

        mockMvc.perform(delete(baseUrl + "/eliminar/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Eliminado. ID:1"));

        Mockito.verify(service).eliminarTetrazolio(1L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void eliminar_ReturnsBadRequest() throws Exception {
        Mockito.doThrow(new EntityNotFoundException("No existe"))
                .when(service).eliminarTetrazolio(2L);

        mockMvc.perform(delete(baseUrl + "/eliminar/2")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        Mockito.verify(service).eliminarTetrazolio(2L);
    }

    //----- GET /listar/recibo/{id} -----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarPorRecibo_ReturnsOk() throws Exception {
        Long reciboId = 1L;

        TetrazolioDto entity1 = new TetrazolioDto();
        entity1.setId(1L);
        TetrazolioDto entity2 = new TetrazolioDto();
        entity2.setId(2L);

        ResponseListadoTetrazolio response = new ResponseListadoTetrazolio((List.of(entity1, entity2)));

        Mockito.when(service.listadoTetrazolioPorReciboId(reciboId))
                .thenReturn(ResponseEntity.ok(response));

        mockMvc.perform(get(baseUrl + "/listar/recibo/" + reciboId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarPorRecibo_ReturnsNotFound() throws Exception {
        Long reciboId = 99L;

        Mockito.when(service.listadoTetrazolioPorReciboId(reciboId))
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

  //----- GET /listar-repeticiones/{id} ------
  @Test
  @WithMockUser(authorities = "ADMIN")
  void listarRepeticiones_ReturnsOk() throws Exception {
      Long id = 10L;

      List<RepeticionTetrazolioDto> mockList = List.of(new RepeticionTetrazolioDto());
      Mockito.when(service.listarRepeticionesPorTetrazolio(id)).thenReturn(mockList);

      mockMvc.perform(get(baseUrl + "/listar-repeticiones/" + id))
              .andExpect(status().isOk())
              .andExpect(jsonPath("$").isArray())
              .andExpect(jsonPath("$.length()").value(1));

      Mockito.verify(service).listarRepeticionesPorTetrazolio(id);
  }

  //----- PUT /actualizar-repeticiones/{id} ------
  @Test
  @WithMockUser(authorities = "ADMIN")
  void actualizarRepeticiones_ReturnsOk() throws Exception {
      Long id = 10L;

      List<RepeticionTetrazolioDto> body = List.of(new RepeticionTetrazolioDto());

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

        List<RepeticionTetrazolioDto> body = List.of(new RepeticionTetrazolioDto());

        Mockito.doThrow(new RuntimeException("boom"))
                .when(service).actualizarRepeticionesCompleto(eq(id), anyList());

        mockMvc.perform(put(baseUrl + "/actualizar-repeticiones/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Error al actualizar repeticiones")));

        Mockito.verify(service).actualizarRepeticionesCompleto(eq(id), anyList());
    }

    //----- PUT /actualizar-detalles/{id} -----

    @Test
    @WithMockUser(authorities = "ADMIN")
    void listarDetalles_ReturnsOk() throws Exception {
        Long id = 20L;

        List<DetalleSemillasTetrazolioDto> mockList = List.of(new DetalleSemillasTetrazolioDto());
        Mockito.when(service.listarDetalles(id)).thenReturn(mockList);

        mockMvc.perform(get(baseUrl + "/listar-detalles/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        Mockito.verify(service).listarDetalles(id);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void actualizarDetalles_ReturnsOk() throws Exception {
        Long id = 20L;

        List<DetalleSemillasTetrazolioDto> body = List.of(new DetalleSemillasTetrazolioDto());

        mockMvc.perform(put(baseUrl + "/actualizar-detalles/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().string("Detalles actualizados correctamente"));

        Mockito.verify(service).actualizarDetallesCompleto(eq(id), anyList());
    }






}
