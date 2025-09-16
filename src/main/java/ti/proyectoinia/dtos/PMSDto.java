package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import lombok.Getter;
import ti.proyectoinia.business.entities.Lote;
@Data
public class PMSDto {

    private Long id;

    private Lote lote;

    private float pesoMilSemillas;

    private float humedadPorcentual;

    private float fechaMedicion;

    private String metodo;

    private String observaciones;

    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof PMSDto)) return false;
        PMSDto other = (PMSDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "PMSDto(id=" + id + ", pesoMilSemillas=" + pesoMilSemillas + ")";
    }
}
