package ti.proyectoinia.dtos;

import lombok.Data;

@Data
public class RepeticionTetrazolioDto {
    private Long id;
    private Integer numero;
    private Integer viables;
    private Integer noViables;
    private Integer duras;
    private Long tetrazolioId;
}
