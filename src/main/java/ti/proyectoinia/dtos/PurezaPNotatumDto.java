package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;

import java.util.Date;

@Data
public class PurezaPNotatumDto {
    
    private Long id;

    private Float gramosSemillaPura;

    private Float gramosSemillasCultivos;

    private Float gramosSemillasMalezas;

    private Float gramosMateriaInerte;

    private boolean activo;

    private boolean repetido;

    private boolean estandar;

    private Long reciboId;

    private Date fechaCreacion;

    private Date fechaRepeticion;

    private String observaciones;

    private Integer semillaPuraPorcentaje;

    private Integer semillacultivoPorcentaje;

    private Integer semillaMalezaPorcentaje;

    private Integer materiaInertePorcentaje;


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
        return "PurezaPnotatumDto(id=" + id + ", gramosSemillaPura=" + gramosSemillaPura + ", gramosSemillasCultivos=" + gramosSemillasCultivos + ", gramosSemillasMalezas=" + gramosSemillasMalezas + ", gramosMateriaInerte=" + gramosMateriaInerte + ", activo=" + activo + ", repetido=" + repetido + ", reciboId=" + reciboId + ", fechaCreacion=" + fechaCreacion + ", fechaRepeticion=" + fechaRepeticion + ")";
    }
}