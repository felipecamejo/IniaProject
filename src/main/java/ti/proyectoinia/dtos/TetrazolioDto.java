package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import ti.proyectoinia.business.entities.ViabilidadPorTz;
import ti.proyectoinia.business.entities.ViabilidadVigorTZ;

import java.util.Date;

@Data
public class TetrazolioDto {
    
    private Long id;
    
    private Integer repeticion;
    
    private Integer nroSemillasPorRepeticion;
    
    private Integer pretratamientoId;
    
    private float concentracion;
    
    private float tincionHoras;
    
    private float tincionGrados;
    
    private Date fecha;
    
    private float viables;
    
    private float noViables;
    
    private float duras;
    
    private float total;
    
    private float promedio;
    
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

    private boolean repetido;

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