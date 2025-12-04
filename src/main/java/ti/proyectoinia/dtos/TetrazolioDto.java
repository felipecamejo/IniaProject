package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import ti.proyectoinia.business.entities.PreTratamiento;
import ti.proyectoinia.business.entities.ViabilidadPorTz;
import ti.proyectoinia.business.entities.ViabilidadVigorTZ;

import java.util.Date;

@Data
public class TetrazolioDto {
    
    private Long id;
    
    private Integer repeticion;
    
    private Integer nroSemillasPorRepeticion;
    
    private PreTratamiento pretratamiento;
    
    private String concentracion;
    
    private String tincionHoras;
    
    private String tincionGrados;
    
    private Date fecha;
    
    // Segundo conjunto de datos (para tabla de detalles)
    private Integer nroSemillasPorRepeticion2;
    
    private PreTratamiento pretratamiento2;
    
    private String concentracion2;
    
    private String tincionHoras2;
    
    private String tincionGrados2;
    
    private Date fecha2;
    
    private String viables;
    
    private String noViables;
    
    private String duras;
    
    private String total;
    
    private String promedio;
    
    private Integer porcentaje;
    
    private ViabilidadPorTz viabilidadPorTetrazolio;
    
    private Integer nroSemillas;
    
    private Integer daniosNroSemillas;
    
    private Integer daniosMecanicos;
    
    private Integer danioAmbiente;
    
    private Integer daniosChinches;
    
    private Integer daniosFracturas;
    
    private Integer daniosOtros;
    
    private Integer daniosDuras;
    
    private ViabilidadVigorTZ viabilidadVigorTz;
    
    private Integer porcentajeFinal;
    
    private Integer daniosPorPorcentajes;

    private boolean activo;

    private boolean estandar;

    private boolean repetido;

    private Date fechaCreacion;

    private Date fechaRepeticion;

    private Long reciboId;

    private ReporteTetrazolioDto reporte;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof TetrazolioDto)) return false;
        TetrazolioDto other = (TetrazolioDto) o;
        return id != null && id.equals(other.getId());
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "TetrazolioDto(tetrazolioId=" + id + ", repeticion=" + repeticion + ", porcentajeFinal=" + porcentajeFinal + ")";
    }
}