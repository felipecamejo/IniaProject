package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import lombok.Getter;

@Data
public class LoteDto {

    private Long id;

    private String nombre;

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
