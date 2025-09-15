package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;

public class CultivoDto {
    @Getter
    private Integer cultivoId;
    @Getter
    private String nombre;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof CultivoDto)) return false;
        CultivoDto other = (CultivoDto) o;
        return cultivoId != null && cultivoId.equals(other.cultivoId);
    }

    @Generated
    public int hashCode() {
        return cultivoId != null ? cultivoId.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "CultivoDto(cultivoId=" + cultivoId + ", nombre=" + nombre + ")";
    }
}