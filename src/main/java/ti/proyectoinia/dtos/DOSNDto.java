package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;

import java.time.LocalDateTime;

public class DOSNDto {
    @Getter
    private Integer DOSNId;
    @Getter
    private LocalDateTime fecha;
    @Getter
    private float gramosAnalizados;
    @Getter
    private String tiposDeanalisis;
    @Getter
    private boolean completoReducido;
    @Getter
    private float malezasToleranciaCero;
    @Getter
    private float otrosCultivos;
    @Getter
    private float determinacionBrassica;
    @Getter
    private float determinacionCuscuta;
    @Getter
    private boolean estandar;
    @Getter
    private LocalDateTime fechaAnalisis;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof DOSNDto)) return false;
        DOSNDto other = (DOSNDto) o;
        return DOSNId != null && DOSNId.equals(other.DOSNId);
    }

    @Generated
    public int hashCode() {
        return DOSNId != null ? DOSNId.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "DOSNDto(DOSNId=" + DOSNId + ", fecha=" + fecha + ", tiposDeanalisis=" + tiposDeanalisis + ")";
    }
}