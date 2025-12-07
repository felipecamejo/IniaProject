package ti.proyectoinia.dtos;

import lombok.Data;

@Data
public class NormalPorConteoDto {
    private Long id;
    private boolean activo;

    private Long germinacionId;
    private String tabla; // SIN_CURAR | CURADA_PLANTA | CURADA_LABORATORIO
    private Integer numeroRepeticion;
    private Long conteoId;

    private Integer normal;
    private Float promedioNormal;
}
