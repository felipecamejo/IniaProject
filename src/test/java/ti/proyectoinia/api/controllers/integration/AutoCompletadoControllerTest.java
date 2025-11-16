package ti.proyectoinia.api.controllers.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ti.proyectoinia.api.controllers.AutocompletadoController;
import ti.proyectoinia.api.responses.ResponseListadoAutocompletados;
import ti.proyectoinia.dtos.AutocompletadoDto;
import ti.proyectoinia.services.AutocompletadoService;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AutocompletadoController.class)
class AutoCompletadoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AutocompletadoService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/autocompletado";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        AutocompletadoDto dto = new AutocompletadoDto();
        dto.setParametro("Felipe");
        Mockito.when(service.obtenerAutocompletadoPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_IdIncorrect() throws Exception {
        Mockito.when(service.obtenerAutocompletadoPorId(1L)).thenReturn(null);

        mockMvc.perform(get(baseUrl + "/2"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_IdInvalid() throws Exception {
        mockMvc.perform(get(baseUrl + "/molleja"))
                .andExpect(status().isBadRequest());
    }

    // ---- GET /por-parametro/{parametro} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getByParam_ReturnsOk() throws Exception {
        ResponseListadoAutocompletados resp = new ResponseListadoAutocompletados();
        String parametro = "ala";
        Mockito.when(service.obtenerPorParametro(parametro)).thenReturn(resp);

        mockMvc.perform(get(baseUrl + "/por-parametro/" + parametro))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getbyParam_ParamInvalid() throws Exception {
        mockMvc.perform(get(baseUrl + "/por-parametro/" + 1L))
                .andExpect(status().isBadRequest());
    }

    // ---- POST /crear ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void crearAutocompletado_Correcto() throws Exception {
        AutocompletadoDto input = new AutocompletadoDto();
        input.setParametro("Felipe");

        Mockito.when(service.crearAutocompletado(any(AutocompletadoDto.class)))
                .thenReturn("Autocompletado creado correctamente");

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void crearAutocompletado_ParametroObligatorio() throws Exception {
        AutocompletadoDto input = new AutocompletadoDto();
        input.setParametro(""); // parámetro vacío -> BAD_REQUEST

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    // ---- PUT /editar ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void update_ReturnsUpdated() throws Exception {
        AutocompletadoDto input = new AutocompletadoDto();
        input.setId(null);
        input.setParametro("Actualizado");

        Mockito.when(service.editarAutocompletado(any(AutocompletadoDto.class))).thenReturn("Creado");

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
        AutocompletadoDto input = new AutocompletadoDto();
        input.setId(null);
        input.setParametro("");

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

        Mockito.verify(service).eliminarAutocompletado(1L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsNotFound() throws Exception {
        Mockito.doThrow(new EntityNotFoundException("No existe"))
                .when(service).eliminarAutocompletado(2L);

        mockMvc.perform(put(baseUrl + "/eliminar/2")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        Mockito.verify(service).eliminarAutocompletado(2L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsBadRequest() throws Exception {
        mockMvc.perform(put(baseUrl + "/eliminar/feliaoda")
                        .with(csrf()))
                .andExpect(status().isBadRequest());

        Mockito.verifyNoInteractions(service);
    }
}
