package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;

public class PurezaPnotatumDto {
    @Getter
    private Integer purezaPnotatumId;
    @Getter
    private float porcentaje;
    @Getter
    private float pesoInicial;
    @Getter
    private int repeticiones;
    @Getter
    private float Pi;
    @Getter
    private float At;
    @Getter
    private float porcentajeA;
    @Getter
    private int totalA;
    @Getter
    private float semillasLS;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof PurezaPnotatumDto)) return false;
        PurezaPnotatumDto other = (PurezaPnotatumDto) o;
        return purezaPnotatumId != null && purezaPnotatumId.equals(other.purezaPnotatumId);
    }

    @Generated
    public int hashCode() {
        return purezaPnotatumId != null ? purezaPnotatumId.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "PurezaPnotatumDto(purezaPnotatumId=" + purezaPnotatumId + ", porcentaje=" + porcentaje + ", pesoInicial=" + pesoInicial + ")";
    }
}