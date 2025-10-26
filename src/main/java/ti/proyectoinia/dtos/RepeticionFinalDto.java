package ti.proyectoinia.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class RepeticionFinalDto {
    private Long id;
    private boolean activo;

    private Long germinacionId;
    private Integer numeroRepeticion;

    private Integer anormal;
    private Integer duras;
    private Integer frescas;
    private Integer muertas;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Campo calculado en backend (fines de documentación; derivable si aplica)")
    private Integer totales;

    private Float promedioRedondeado;
}
