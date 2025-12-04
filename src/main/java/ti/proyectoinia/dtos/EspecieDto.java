package ti.proyectoinia.dtos;

import jakarta.persistence.*;
import lombok.Data;

@Data
public class EspecieDto {


    private Long id;

    private String nombre;

    private String descripcion;

    private boolean activo;

}