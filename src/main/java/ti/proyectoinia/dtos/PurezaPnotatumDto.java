package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import lombok.Getter;

@Data
public class PurezaPnotatumDto {
    
    private Long id;
    
    private float porcentaje;
    
    private float pesoInicial;
    
    private int repeticiones;
    
    private float Pi;
    
    private float At;
    
    private float porcentajeA;
    
    private int totalA;
    
    private float semillasLS;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof PurezaPnotatumDto)) return false;
        PurezaPnotatumDto other = (PurezaPnotatumDto) o;
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