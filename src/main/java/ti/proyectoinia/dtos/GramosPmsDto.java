package ti.proyectoinia.dtos;

import lombok.Data;

@Data
public class GramosPmsDto {
    private Long id;
    private Long pmsId;
    private int gramos;
    private int numeroRepeticion;
}
