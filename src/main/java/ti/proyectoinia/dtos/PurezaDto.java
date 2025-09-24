package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import java.util.Date;

@Data
public class PurezaDto {
    private Long id;

    private Date fecha;

    private float pesoInicial;

    private float semillaPura;

    private float materialInerte;

    private float otrosCultivos;

    private float malezas;

    private float malezasToleradas;

    private float pesoTotal;

    private float otrosCultivo;

    private Date fechaEstandar;

    private boolean estandar;

    private boolean activo;

    private Long reciboId;

    private boolean repetido;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PurezaDto that = (PurezaDto) o;
        return java.util.Objects.equals(id, that.id) &&
                java.util.Objects.equals(fecha, that.fecha) &&
                Float.compare(pesoInicial, that.pesoInicial) == 0 &&
                Float.compare(semillaPura, that.semillaPura) == 0 &&
                Float.compare(materialInerte, that.materialInerte) == 0 &&
                Float.compare(otrosCultivos, that.otrosCultivos) == 0 &&
                Float.compare(malezas, that.malezas) == 0 &&
                Float.compare(malezasToleradas, that.malezasToleradas) == 0 &&
                Float.compare(pesoTotal, that.pesoTotal) == 0 &&
                Float.compare(otrosCultivo, that.otrosCultivo) == 0 &&
                java.util.Objects.equals(fechaEstandar, that.fechaEstandar) &&
                estandar == that.estandar &&
                activo == that.activo;
    }

    @Generated
    protected boolean canEqual(final Object other) {
        return other instanceof PurezaDto;
    }

    @Generated
    public int hashCode() {
        int result = 1;
        Object $id = this.getId();
        result = result * 59 + ($id == null ? 43 : $id.hashCode());
        Object $fecha = this.getFecha();
        result = result * 59 + ($fecha == null ? 43 : $fecha.hashCode());
        result = result * 59 + Float.floatToIntBits(this.getPesoInicial());
        result = result * 59 + Float.floatToIntBits(this.getSemillaPura());
        result = result * 59 + Float.floatToIntBits(this.getMaterialInerte());
        result = result * 59 + Float.floatToIntBits(this.getOtrosCultivos());
        result = result * 59 + Float.floatToIntBits(this.getMalezas());
        result = result * 59 + Float.floatToIntBits(this.getMalezasToleradas());
        result = result * 59 + Float.floatToIntBits(this.getPesoTotal());
        result = result * 59 + Float.floatToIntBits(this.getOtrosCultivo());
        Object $fechaEstandar = this.getFechaEstandar();
        result = result * 59 + ($fechaEstandar == null ? 43 : $fechaEstandar.hashCode());
        result = result * 59 + (this.isEstandar() ? 79 : 97);
        result = result * 59 + (this.isActivo() ? 79 : 97);
        return result;
    }

    @Generated
    public String toString() {
        return "PurezaDto(id=" + this.getId() + ", fecha=" + String.valueOf(this.getFecha()) + ")";
    }
}
