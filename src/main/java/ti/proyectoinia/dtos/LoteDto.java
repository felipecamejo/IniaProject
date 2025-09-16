package ti.proyectoinia.dtos;

import java.util.List;

import lombok.Data;
import lombok.Generated;

@Data
public class LoteDto {
    private Long id;
    private String nombre;
    private boolean activo;

    private List<UsuarioDto> usuarios;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LoteDto that = (LoteDto) o;
        return java.util.Objects.equals(id, that.id) &&
                java.util.Objects.equals(nombre, that.nombre) &&
                activo == that.activo;
    }

    @Generated
    protected boolean canEqual(final Object other) {
        return other instanceof LoteDto;
    }

    @Generated
    public int hashCode() {
        int result = 1;
        Object $id = this.getId();
        result = result * 59 + ($id == null ? 43 : $id.hashCode());
        Object $nombre = this.getNombre();
        result = result * 59 + ($nombre == null ? 43 : $nombre.hashCode());
        result = result * 59 + (this.isActivo() ? 79 : 97);
        return result;
    }

    @Generated
    public String toString() {
        return "LoteDto(id=" + this.getId() + ", nombre=" + this.getNombre() + ")";
    }
}
