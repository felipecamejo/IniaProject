package ti.proyectoinia.dtos;

import lombok.Data;
import ti.proyectoinia.business.entities.Metodo;
import ti.proyectoinia.business.entities.PreFrio;
import ti.proyectoinia.business.entities.PreTratamiento;
import ti.proyectoinia.business.entities.Tratamiento;

import java.util.Date;

@Data
public class GerminacionDto {

    private Long id;

    private Date fechaInicio;

    private Integer totalDias;

    private Tratamiento tratamiento;

    private Integer nroSemillaPorRepeticion;

    // Mantener el mismo tipo que la entidad para minimizar cambios en mapeos actuales
    private Metodo metodo;

    private Float temperatura;

    private PreFrio preFrio;

    private PreTratamiento preTratamiento;

    private Integer nroDias;

    private Date fechaFinal;

    private Integer pRedondeo;

    // Métricas INIA / INASE
    private Integer pNormalINIA;
    private Integer pNormalINASE;

    private Integer pAnormalINIA;
    private Integer pAnormalINASE;

    private Integer pMuertasINIA;
    private Integer pMuertasINASE;

    private Integer pFrescasINIA;
    private Integer pFrescasINASE;

    private Integer semillasDurasINIA;
    private Integer semillasDurasINASE;

    private Integer germinacionINIA;
    private Integer germinacionINASE;

    private String comentarios;

    private Long reciboId;

    private boolean activo;

    private boolean repetido;

    private Date fechaCreacion;

    private Date fechaRepeticion;
}
