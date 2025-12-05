package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import java.util.Date;
import java.util.List;

@Data
public class PMSDto {
    private Long id;

    private List<Float> gramosPorRepeticiones;

    private Float pesoMilSemillas;

    private String comentarios;

    private boolean activo;

    private boolean repetido;

    private Long reciboId;

    private Date fechaMedicion;

    private Date fechaCreacion;

    private Date fechaRepeticion;

    private boolean estandar;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PMSDto that = (PMSDto) o;
        return java.util.Objects.equals(id, that.id) &&
                Float.compare(pesoMilSemillas, that.pesoMilSemillas) == 0 &&
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
        result = result * 59 + (this.isActivo() ? 79 : 97);
        return result;
    }

    @Generated
    public String toString() {
        return "PMSDto(id=" + this.getId() + ", pesoMilSemillas=" + this.getPesoMilSemillas() + ")";
    }
}
