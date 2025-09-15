package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;

public class LoteDto {
    @Getter
    private Long id;
    @Getter
    private String nombre;
    @Getter
    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof LoteDto)) return false;
        LoteDto other = (LoteDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "LoteDto(id=" + id + ", nombre=" + nombre + ")";
    }
}
