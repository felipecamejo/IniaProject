package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import lombok.Getter;

@Data
public class CultivoDto {

    private Long id;

    private String nombre;

    private String descripcion;

    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof CultivoDto)) return false;
        CultivoDto other = (CultivoDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "CultivoDto(cultivoId=" + id + ", nombre=" + nombre + ")";
    }
}