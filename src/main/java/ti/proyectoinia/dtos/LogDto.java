package ti.proyectoinia.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class LogDto {

    private Long id;

    private String texto;

    private Date fechaCreacion;

}
