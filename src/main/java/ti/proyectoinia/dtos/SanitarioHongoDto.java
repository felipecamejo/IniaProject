package ti.proyectoinia.dtos;

import lombok.Data;
import ti.proyectoinia.business.entities.TipoSanitarioHongo;

@Data
public class SanitarioHongoDto {

    private Long id;

    private Long sanitarioId;

    private Long hongoId;

    private Integer repeticion;

    private Integer valor;

    private boolean activo;

    private TipoSanitarioHongo tipo;

}
