package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;

public class UsuarioDto {
    @Getter
    private Long id;
    @Getter
    private String email;
    @Getter
    private String nombre;
    @Getter
    private String password;
    @Getter
    private String rol;
    @Getter
    private boolean activo;

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
