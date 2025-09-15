package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;

import java.time.LocalDateTime;

public class TetrazolioDto {
    @Getter
    private Integer tetrazolioId;
    @Getter
    private Integer repeticion;
    @Getter
    private Integer nroSemillasPorRepeticion;
    @Getter
    private Integer pretratamientoId;
    @Getter
    private float concentracion;
    @Getter
    private float tincionHoras;
    @Getter
    private float tincionGrados;
    @Getter
    private LocalDateTime fecha;
    @Getter
    private float viables;
    @Getter
    private float noViables;
    @Getter
    private float duras;
    @Getter
    private float total;
    @Getter
    private float promedio;
    @Getter
    private Integer porcentaje;
    @Getter
    private Integer viabilidadPorTetrazolioId;
    @Getter
    private Integer nroSemillas;
    @Getter
    private Integer daniosNroSemillas;
    @Getter
    private Integer daniosMecanicos;
    @Getter
    private Integer danioAmbiente;
    @Getter
    private Integer daniosChinches;
    @Getter
    private Integer daniosFracturas;
    @Getter
    private Integer daniosOtros;
    @Getter
    private Integer daniosDuras;
    @Getter
    private Integer viabilidadVigorTzId;
    @Getter
    private Integer porcentajeFinal;
    @Getter
    private Integer daniosPorPorcentajes;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof TetrazolioDto)) return false;
        TetrazolioDto other = (TetrazolioDto) o;
        return tetrazolioId != null && tetrazolioId.equals(other.tetrazolioId);
    }

    @Generated
    public int hashCode() {
        return tetrazolioId != null ? tetrazolioId.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "TetrazolioDto(tetrazolioId=" + tetrazolioId + ", repeticion=" + repeticion + ", porcentajeFinal=" + porcentajeFinal + ")";
    }
}