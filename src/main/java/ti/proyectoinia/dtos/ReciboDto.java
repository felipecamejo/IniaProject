package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;
import java.time.LocalDateTime;

public class ReciboDto {
    @Getter
    private Long id;
    @Getter
    private int nroAnalisis;
    @Getter
    private String especie;
    @Getter
    private String ficha;
    @Getter
    private LocalDateTime fechaRecibo;
    @Getter
    private String remitente;
    @Getter
    private String origen;
    @Getter
    private String cultivar;
    @Getter
    private String deposito;
    @Getter
    private String estado;
    @Getter
    private int lote;
    @Getter
    private float kgLimpios;
    @Getter
    private String analisisSolicitados;
    @Getter
    private int articulo;
    @Getter
    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof ReciboDto)) return false;
        ReciboDto other = (ReciboDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "ReciboDto(id=" + id + ", nroAnalisis=" + nroAnalisis + ")";
    }
}
