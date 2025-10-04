package ti.proyectoinia.dtos;

import lombok.Data;
import ti.proyectoinia.business.entities.Estado;
import ti.proyectoinia.business.entities.Metodo;

import java.util.Date;
import java.util.List;

@Data
public class SanitarioDto {
    private Long id;

    private Date fechaSiembra;

    private Date fecha;

    private Metodo metodo;

    private Integer temperatura;

    private Integer horasLuz;

    private Integer horasOscuridad;

    private Integer nroDias;

    private Estado estadoProductoDosis;

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