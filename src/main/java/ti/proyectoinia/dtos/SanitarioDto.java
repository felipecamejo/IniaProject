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

    private int temperatura;

    private int horasLuzOscuridad;

    private int nroDias;

    private Estado estadoProductoDosis;

    private String observaciones;

    private int nroSemillasRepeticion;

    private Long reciboId;

    private boolean activo;

    private boolean repetido;

    private List<Long> SanitarioHongoids;
}