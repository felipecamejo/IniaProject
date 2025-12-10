package ti.proyectoinia.dtos;

import lombok.Data;

import java.util.List;

@Data
public class SanitarioDto {

    private Long id;

    private String fechaSiembra;

    private String fecha;

    private String metodo;

    private Integer temperatura;

    private Integer horasLuz;

    private Integer horasOscuridad;

    private Integer nroDias;

    private String estado;

    private String observaciones;

    private Integer nroSemillasRepeticion;

    private Long reciboId;

    private boolean activo;

    private boolean estandar;

    private boolean repetido;

    private List<Long> sanitarioHongosId;

    private String fechaCreacion;

}