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
import ti.proyectoinia.api.controllers.DepositoController;
import ti.proyectoinia.api.responses.ResponseListadoDepositos;
import ti.proyectoinia.dtos.DepositoDto;
import ti.proyectoinia.services.DepositoService;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(DepositoController.class)
class DepositoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DepositoService service;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String baseUrl = "/api/v1/deposito";

    // ---- GET /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_ReturnsOk() throws Exception {
        DepositoDto dto = new DepositoDto();
        dto.setNombre("Felipe");
        Mockito.when(service.obtenerDepositoPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_IdIncorrect() throws Exception {
        DepositoDto dto = new DepositoDto();
        dto.setNombre("Felipe");
        Mockito.when(service.obtenerDepositoPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/2"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getById_IdInvalid() throws Exception {
        DepositoDto dto = new DepositoDto();
        dto.setNombre("Felipe");
        Mockito.when(service.obtenerDepositoPorId(1L)).thenReturn(dto);

        mockMvc.perform(get(baseUrl + "/molleja"))
                .andExpect(status().isBadRequest());
    }


    // ---- POST ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void crear_Correcto() throws Exception {

        DepositoDto input = new DepositoDto();
        input.setNombre("Felipe");


        Mockito.when(service.crearDeposito(any(DepositoDto.class)))
                .thenReturn("Creado correctamente");

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void crear_NombreVacio() throws Exception {

        DepositoDto input = new DepositoDto();
        input.setNombre("");


        Mockito.when(service.crearDeposito(any(DepositoDto.class)))
                .thenReturn("Creado correctamente");

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void crear_NombreNumerico() throws Exception {

        DepositoDto input = new DepositoDto();
        input.setNombre("22");


        Mockito.when(service.crearDeposito(any(DepositoDto.class)))
                .thenReturn("Creado correctamente");

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void crear_YaExiste() throws Exception {

        DepositoDto input = new DepositoDto();
        input.setId(1L); // simulamos que ya existe
        input.setNombre("Felipe");

        Mockito.when(service.obtenerDepositoPorId(input.getId())).thenReturn(input);

        mockMvc.perform(post(baseUrl + "/crear")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isConflict())
                .andExpect(content().string("Ya existe"));
    }


    // ---- PUT /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void update_ReturnsUpdated() throws Exception {
        DepositoDto input = new DepositoDto();
        input.setId(1L);            // ✅ ID válido
        input.setNombre("Actualizado");

        Mockito.when(service.editarDeposito(any(DepositoDto.class))).thenReturn("Creado");

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(content().string("Creado"));
    }


    @Test
    @WithMockUser(authorities = "ADMIN")
    void update_ReturnsBadRequest_WhenIdIsNull() throws Exception {
        DepositoDto input = new DepositoDto();
        input.setId(null);
        input.setNombre("Actualizado");

        mockMvc.perform(put(baseUrl + "/editar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }



    // ---- DELETE /{id} ----
    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsOk() throws Exception {
        mockMvc.perform(delete(baseUrl + "/eliminar/1")
                        .with(csrf()))
                .andExpect(status().isOk());

        Mockito.verify(service).eliminarDeposito(1L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsNotFound() throws Exception {

        Mockito.doThrow(new EntityNotFoundException("No existe"))
                .when(service).eliminarDeposito(2L);

        mockMvc.perform(delete(baseUrl + "/eliminar/2")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        Mockito.verify(service).eliminarDeposito(2L);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void delete_ReturnsBadRequest() throws Exception {
        mockMvc.perform(delete(baseUrl + "/eliminar/feliaoda")
                        .with(csrf()))
                .andExpect(status().isBadRequest());

        Mockito.verifyNoInteractions(service);
    }

    // ---- GET ----

    @Test
    @WithMockUser(authorities = "ADMIN")
    void get_ReturnsOk() throws Exception {
        ResponseListadoDepositos dto = new ResponseListadoDepositos();
        Mockito.when(service.listadoDepositos()).thenReturn(ResponseEntity.ok(dto));

        mockMvc.perform(get(baseUrl + "/listar"))
                .andExpect(status().isOk());
    }


}
