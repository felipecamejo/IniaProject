package ti.proyectoinia.api.responses;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenUsuario {
    private String nombre;
    private String email;
    private String token;
    private String[] roles;

    public TokenUsuario() {
    }

    public TokenUsuario(String nombre, String email, String token, String[] roles) {
        this.nombre = nombre;
        this.email = email;
        this.token = token;
        this.roles = roles;
    }
}