package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;

@Data
public class SemillaDto {
    
    private Long id;
    
    private Integer nroSemillasPura;

    private String descripcion;

    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof SemillaDto)) return false;
        SemillaDto other = (SemillaDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "SemillaDto(id=" + id + ", nroSemillasPura=" + nroSemillasPura + ", activo=" + activo + ")";
    }
}
