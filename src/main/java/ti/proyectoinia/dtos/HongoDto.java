package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;
import ti.proyectoinia.business.entities.tipoHongo;

import java.util.Objects;

public class HongoDto {
    
    @Getter
    private Long id;
    @Getter
    private String nombre;
    @Getter
    private tipoHongo tipo;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HongoDto that = (HongoDto) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(nombre, that.nombre) &&
                Objects.equals(tipo, that.tipo);
    }

    @Generated
    protected boolean canEqual(final Object other) {
        return other instanceof HongoDto;
    }

    @Generated
    public int hashCode() {
        int result = 1;
        Object $id = this.getId();
        result = result * 59 + ($id == null ? 43 : $id.hashCode());
        Object $nombre = this.getNombre();
        result = result * 59 + ($nombre == null ? 43 : $nombre.hashCode());
        Object $tipo = this.getTipo();
        result = result * 59 + ($tipo == null ? 43 : $tipo.hashCode());
        return result;
    }

    @Generated
    public String toString() {
        return "HongoDto(id=" + this.getId() + ", nombre=" + this.getNombre() + ", tipo=" + String.valueOf(this.getTipo()) + ")";
    }
    
}
