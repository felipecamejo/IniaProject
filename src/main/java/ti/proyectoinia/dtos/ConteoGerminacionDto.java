package ti.proyectoinia.dtos;

import lombok.Data;


@Data
public class ConteoGerminacionDto {
    private Long id;
    private Long germinacionId;
    private Integer numeroConteo;
    private String fechaConteo;
    private boolean activo;
}
