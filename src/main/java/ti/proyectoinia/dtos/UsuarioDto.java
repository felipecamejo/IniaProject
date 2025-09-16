package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;

@Data
public class UsuarioDto {

    private Long id;
    private String email;
    private String nombre;
    private String password;
    private String rol;
    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UsuarioDto that = (UsuarioDto) o;
        return java.util.Objects.equals(id, that.id) &&
                java.util.Objects.equals(email, that.email) &&
                java.util.Objects.equals(nombre, that.nombre) &&
                java.util.Objects.equals(password, that.password) &&
                java.util.Objects.equals(rol, that.rol) &&
                activo == that.activo;
    }

    @Generated
    protected boolean canEqual(final Object other) {
        return other instanceof UsuarioDto;
    }

    @Generated
    public int hashCode() {
        int result = 1;
        Object $id = this.getId();
        result = result * 59 + ($id == null ? 43 : $id.hashCode());
        Object $email = this.getEmail();
        result = result * 59 + ($email == null ? 43 : $email.hashCode());
        Object $nombre = this.getNombre();
        result = result * 59 + ($nombre == null ? 43 : $nombre.hashCode());
        Object $password = this.getPassword();
        result = result * 59 + ($password == null ? 43 : $password.hashCode());
        Object $rol = this.getRol();
        result = result * 59 + ($rol == null ? 43 : $rol.hashCode());
        result = result * 59 + (this.isActivo() ? 79 : 97);
        return result;
    }

    @Generated
    public String toString() {
        return "UsuarioDto(id=" + this.getId() + ", email=" + this.getEmail() + ", nombre=" + this.getNombre() + ", rol=" + this.getRol() + ")";
    }
}
