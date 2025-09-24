package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;

import java.util.Objects;

@Data
public class HongoDto {
    

    private Long id;

    private String nombre;

    private String descripcion;

    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HongoDto that = (HongoDto) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(nombre, that.nombre) &&
                Objects.equals(descripcion, that.descripcion) &&
                activo == that.activo;
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
        Object $descripcion = this.getDescripcion();
        result = result * 59 + ($descripcion == null ? 43 : $descripcion.hashCode());
        result = result * 59 + (this.isActivo() ? 79 : 97);
        return result;
    }

    @Generated
    public String toString() {
        return "HongoDto(id=" + this.getId() + ", nombre=" + this.getNombre() + ", descripcion=" + String.valueOf(this.getDescripcion()) + ", activo=" + this.isActivo() + ")";
    }

}
