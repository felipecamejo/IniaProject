package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import lombok.Getter;
import java.time.LocalDateTime;

@Data
public class ReciboDto {
    
    private Long id;
    
    private int nroAnalisis;
    
    private String especie;
    
    private String ficha;
    
    private LocalDateTime fechaRecibo;
    
    private String remitente;
    
    private String origen;
    
    private String cultivar;
    
    private String deposito;
    
    private String estado;
    
    private int lote;
    
    private float kgLimpios;
    
    private String analisisSolicitados;
    
    private int articulo;
    
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
