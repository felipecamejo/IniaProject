package ti.proyectoinia.dtos;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
public class RepeticionesPPNDTO {

    private Long id;

    private Integer nroSemillasPuras;

    private Float peso;

    private Integer cantidadSemillasSanas;

    private Float  gramosSemillasSanas;

    private Integer contaminadasYVanas;

    private Float gramosContaminadasYVanas;

    private Float gramosControlDePesos;

    private Long purezaPNotatum;
}
