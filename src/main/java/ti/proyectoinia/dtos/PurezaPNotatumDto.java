package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;

@Data
public class PurezaPNotatumDto {
    
    private Long id;
    
    private float porcentaje;
    
    private float pesoInicial;
    
    private int repeticiones;
    
    private float Pi;
    
    private float At;
    
    private float porcentajeA;
    
    private int totalA;
    
    private float semillasLS;

    private boolean activo;

    private boolean repetido;

    private Long reciboId;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof PurezaPNotatumDto)) return false;
        PurezaPNotatumDto other = (PurezaPNotatumDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "PurezaPnotatumDto(id=" + id + ", porcentaje=" + porcentaje + ", pesoInicial=" + pesoInicial + ")";
    }
}