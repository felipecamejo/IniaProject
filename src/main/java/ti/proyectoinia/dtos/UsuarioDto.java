package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import lombok.Getter;
import ti.proyectoinia.business.entities.Lote;

import java.util.List;

@Data
public class UsuarioDto {
    private Long id;

    private String email;

    private String nombre;

    private String password;

    private String rol;

    private boolean activo;

    private List<LoteDto> lotes;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof UsuarioDto)) return false;
        UsuarioDto other = (UsuarioDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "UsuarioDto(id=" + id + ", email=" + email + ")";
    }
}
