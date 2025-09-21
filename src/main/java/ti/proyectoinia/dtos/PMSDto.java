package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import java.util.Date;

@Data
public class PMSDto {
    private Long id;

    private float pesoMilSemillas;

    private float humedadPorcentual;

    private Date fechaMedicion;

    private String metodo;

    private String observaciones;

    private boolean activo;

    private boolean repetido;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PMSDto that = (PMSDto) o;
        return java.util.Objects.equals(id, that.id) &&
                Float.compare(pesoMilSemillas, that.pesoMilSemillas) == 0 &&
                Float.compare(humedadPorcentual, that.humedadPorcentual) == 0 &&
                java.util.Objects.equals(fechaMedicion, that.fechaMedicion) &&
                java.util.Objects.equals(metodo, that.metodo) &&
                java.util.Objects.equals(observaciones, that.observaciones) &&
                activo == that.activo;
    }

    @Generated
    protected boolean canEqual(final Object other) {
        return other instanceof PMSDto;
    }

    @Generated
    public int hashCode() {
        int result = 1;
        Object $id = this.getId();
        result = result * 59 + ($id == null ? 43 : $id.hashCode());
        result = result * 59 + Float.floatToIntBits(this.getPesoMilSemillas());
        result = result * 59 + Float.floatToIntBits(this.getHumedadPorcentual());
        Object $fechaMedicion = this.getFechaMedicion();
        result = result * 59 + ($fechaMedicion == null ? 43 : $fechaMedicion.hashCode());
        Object $metodo = this.getMetodo();
        result = result * 59 + ($metodo == null ? 43 : $metodo.hashCode());
        Object $observaciones = this.getObservaciones();
        result = result * 59 + ($observaciones == null ? 43 : $observaciones.hashCode());
        result = result * 59 + (this.isActivo() ? 79 : 97);
        return result;
    }

    @Generated
    public String toString() {
        return "PMSDto(id=" + this.getId() + ", pesoMilSemillas=" + this.getPesoMilSemillas() + ")";
    }
}
