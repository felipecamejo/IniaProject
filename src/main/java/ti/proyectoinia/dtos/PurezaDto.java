package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;
import java.time.LocalDateTime;

public class PurezaDto {
    @Getter
    private Long id;
    @Getter
    private LocalDateTime fecha;
    @Getter
    private float pesoInicial;
    @Getter
    private float semillaPura;
    @Getter
    private float materialInerte;
    @Getter
    private float otrosCultivos;
    @Getter
    private float malezas;
    @Getter
    private float malezasToleradas;
    @Getter
    private float pesoTotal;
    @Getter
    private float otrosCultivo;
    @Getter
    private LocalDateTime fechaEstandar;
    @Getter
    private boolean estandar;
    @Getter
    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof PurezaDto)) return false;
        PurezaDto other = (PurezaDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "PurezaDto(id=" + id + ", fecha=" + fecha + ")";
    }
}
