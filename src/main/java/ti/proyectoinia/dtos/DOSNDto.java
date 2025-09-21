package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;

import java.util.Date;
import java.util.List;

@Data
public class DOSNDto {
    
    private Long id;
    
    private Date fecha;
    
    private float gramosAnalizados;
    
    private String tiposDeanalisis;
    
    private boolean completoReducido;
    
    private float malezasToleranciaCero;
    
    private float otrosCultivos;
    
    private float determinacionBrassica;
    
    private float determinacionCuscuta;
    
    private boolean estandar;
    
    private Date fechaAnalisis;

    private List<CultivoDto> cultivos;

    private boolean activo;

    private boolean repetido;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof DOSNDto)) return false;
        DOSNDto other = (DOSNDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "DOSNDto(id=" + id + ", fecha=" + fecha + ", tiposDeanalisis=" + tiposDeanalisis + ")";
    }
}