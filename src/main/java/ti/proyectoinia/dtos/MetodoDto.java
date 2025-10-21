package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;

import java.util.Objects;

@Data
public class MetodoDto {

    private Long id;

    private String nombre;

    private String autor;

    private String descripcion;

    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MetodoDto that = (MetodoDto) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(nombre, that.nombre);
    }

    @Generated
    protected boolean canEqual(final Object other) {
        return other instanceof MetodoDto;
    }

    @Generated
    public int hashCode() {
        int result = 1;
        Object $id = this.getId();
        result = result * 59 + ($id == null ? 43 : $id.hashCode());
        Object $nombre = this.getNombre();
        result = result * 59 + ($nombre == null ? 43 : $nombre.hashCode());
        return result;
    }

    @Generated
    public String toString() {
        return "MetodoDto(id=" + this.getId() + ", nombre=" + this.getNombre() + ", autor=" + this.getAutor() + ", descripcion=" + this.getDescripcion() + ", activo=" + this.isActivo() + ")";
    }
}
