package ti.proyectoinia.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("pRedondeo")
    private Integer pRedondeo;

    // Métricas INIA / INASE
    @JsonProperty("pNormalINIA")
    private Integer pNormalINIA;
    @JsonProperty("pNormalINASE")
    private Integer pNormalINASE;

    @JsonProperty("pAnormalINIA")
    private Integer pAnormalINIA;
    @JsonProperty("pAnormalINASE")
    private Integer pAnormalINASE;

    @JsonProperty("pMuertasINIA")
    private Integer pMuertasINIA;
    @JsonProperty("pMuertasINASE")
    private Integer pMuertasINASE;

    @JsonProperty("pFrescasINIA")
    private Integer pFrescasINIA;
    @JsonProperty("pFrescasINASE")
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
