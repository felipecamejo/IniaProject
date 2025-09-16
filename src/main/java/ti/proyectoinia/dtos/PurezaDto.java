package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import lombok.Getter;
import java.time.LocalDateTime;

@Data
public class PurezaDto {
    
    private Long id;
    
    private LocalDateTime fecha;
    
    private float pesoInicial;
    
    private float semillaPura;
    
    private float materialInerte;
    
    private float otrosCultivos;
    
    private float malezas;
    
    private float malezasToleradas;
    
    private float pesoTotal;
    
    private float otrosCultivo;
    
    private LocalDateTime fechaEstandar;
    
    private boolean estandar;
    
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
