package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;
import java.util.Date;
import ti.proyectoinia.business.entities.Metodo;
import ti.proyectoinia.business.entities.Estado;

public class SanitarioDto {
    @Getter
    private Long id;
    @Getter
    private Date fechaSiembra;
    @Getter
    private Date fecha;
    @Getter
    private Metodo metodo;
    @Getter
    private int temperatura;
    @Getter
    private int horasLuzOscuridad;
    @Getter
    private int nroDias;
    @Getter
    private Estado estadoProductoDosis;
    @Getter
    private int observaciones;
    @Getter
    private int nroSemillasRepeticion;
    @Getter
    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof SanitarioDto)) return false;
        SanitarioDto other = (SanitarioDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "SanitarioDto(id=" + id + ", fechaSiembra=" + fechaSiembra + ")";
    }
}

