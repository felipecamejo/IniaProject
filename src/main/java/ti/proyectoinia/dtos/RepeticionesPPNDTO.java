package ti.proyectoinia.dtos;


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

    private Long purezaPNotatum;
}
