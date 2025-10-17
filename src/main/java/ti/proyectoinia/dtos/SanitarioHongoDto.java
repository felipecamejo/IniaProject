package ti.proyectoinia.dtos;

import lombok.Data;

@Data
public class SanitarioHongoDto {

    private Long id;

    private Long sanitarioId;

    private Long hongoId;

    private Integer repeticion;

    private Integer valor;

    private Integer incidencia;

}
