package ti.proyectoinia.dtos;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class SanitarioDto {
    private Long id;

    private Date fechaSiembra;

    private Date fecha;

    private String metodo;

    private Integer temperatura;

    private Integer horasLuz;

    private Integer horasOscuridad;

    private Integer nroDias;

    private String estadoProductoDosis;

    private String observaciones;

    private Integer nroSemillasRepeticion;

    private Long reciboId;

    private boolean activo;

    private boolean estandar;

    private boolean repetido;

    private List<Long> SanitarioHongoids;

    private Date fechaCreacion;

    private Date fechaRepeticion;
}