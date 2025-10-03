package ti.proyectoinia.dtos;

import lombok.Data;
import ti.proyectoinia.business.entities.HumedadLugar;

@Data
public class HumedadReciboDto {

    private Long id;

    private HumedadLugar lugar;

    private Integer numero;
}
