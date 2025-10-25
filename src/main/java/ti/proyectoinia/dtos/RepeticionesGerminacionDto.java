package ti.proyectoinia.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class RepeticionesGerminacionDto {
    private Long id;
    private boolean activo;

    private Long germinacionId;
    private Long conteoId; // FK a ConteoGerminacion

    // Métricas por celda (usar Integer para permitir null = no informado)
    private Integer normal;
    private Integer anormal;
    private Integer duras;
    private Integer frescas;
    private Integer muertas;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Campo calculado en backend: normal+anormal+duras+frescas+muertas")
    private Integer totales;            // calculado en el servicio (fuente de verdad)
    private Float promedioRedondeado;   // alineado con la entidad (Float)

    private Integer numeroRepeticion;
}
