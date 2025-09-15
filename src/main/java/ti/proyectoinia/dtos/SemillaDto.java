package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;

public class SemillaDto {
    @Getter
    private Integer semillaId;
    @Getter
    private int nroSemillasPura;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof SemillaDto)) return false;
        SemillaDto other = (SemillaDto) o;
        return semillaId != null && semillaId.equals(other.semillaId);
    }

    @Generated
    public int hashCode() {
        return semillaId != null ? semillaId.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "SemillaDto(semillaId=" + semillaId + ", nroSemillasPura=" + nroSemillasPura + ")";
    }
}
