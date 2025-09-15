package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;

import java.util.Date;

public class GerminacionDto {
    @Getter
    private Long id;
    @Getter
    private Date fechaInicio;
    @Getter
    private Date fechaConteo1;
    @Getter
    private Date fechaConteo2;
    @Getter
    private Date fechaConteo3;
    @Getter
    private Date fechaConteo4;
    @Getter
    private Date fechaConteo5;
    @Getter
    private int totalDias;
    @Getter
    private int repeticionNormal1;
    @Getter
    private int repeticionNormal2;
    @Getter
    private int repeticionNormal3;
    @Getter
    private int repeticionNormal4;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof GerminacionDto)) return false;
        GerminacionDto other = (GerminacionDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "GerminacionDto(id=" + id + ", fechaInicio=" + fechaInicio + ")";
    }
}
