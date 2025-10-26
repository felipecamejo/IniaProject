package ti.proyectoinia.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class ConteoGerminacionDto {
    private Long id;
    private Long germinacionId;
    private Integer numeroConteo;
    private Date fechaConteo;
    private boolean activo;
}
