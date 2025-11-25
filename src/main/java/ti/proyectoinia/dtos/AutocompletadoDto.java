package ti.proyectoinia.dtos;

import lombok.Data;

@Data
public class AutocompletadoDto {
    private Long id;

    private String tipoDato;

    private String parametro;

    private String valor;

    private boolean activo;
}

