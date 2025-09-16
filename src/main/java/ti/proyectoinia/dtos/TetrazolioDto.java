package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import lombok.Getter;

import java.time.LocalDateTime;

@Data
public class TetrazolioDto {
    
    private Long id;
    
    private Integer repeticion;
    
    private Integer nroSemillasPorRepeticion;
    
    private Integer pretratamientoId;
    
    private float concentracion;
    
    private float tincionHoras;
    
    private float tincionGrados;
    
    private LocalDateTime fecha;
    
    private float viables;
    
    private float noViables;
    
    private float duras;
    
    private float total;
    
    private float promedio;
    
    private Integer porcentaje;
    
    private Integer viabilidadPorTetrazolioId;
    
    private Integer nroSemillas;
    
    private Integer daniosNroSemillas;
    
    private Integer daniosMecanicos;
    
    private Integer danioAmbiente;
    
    private Integer daniosChinches;
    
    private Integer daniosFracturas;
    
    private Integer daniosOtros;
    
    private Integer daniosDuras;
    
    private Integer viabilidadVigorTzId;
    
    private Integer porcentajeFinal;
    
    private Integer daniosPorPorcentajes;

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