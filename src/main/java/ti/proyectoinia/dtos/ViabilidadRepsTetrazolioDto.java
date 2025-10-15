package ti.proyectoinia.dtos;

import lombok.Data;

@Data
public class ViabilidadRepsTetrazolioDto {
    private Long id;
    private boolean activo;
    private Long tetrazolioId;
    private int viables;
    private int noViables;
    private int duras;
    private int numeroRepeticion;
}
