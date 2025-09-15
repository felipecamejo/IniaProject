package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;
import ti.proyectoinia.business.entities.Lote;

public class PMSDto {
    @Getter
    private Long id;
    @Getter
    private Lote lote;
    @Getter
    private float pesoMilSemillas;
    @Getter
    private float humedadPorcentual;
    @Getter
    private float fechaMedicion;
    @Getter
    private String metodo;
    @Getter
    private String observaciones;
    @Getter
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
