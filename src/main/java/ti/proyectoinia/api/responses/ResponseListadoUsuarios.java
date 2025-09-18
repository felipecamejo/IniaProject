package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.UsuarioDto;

import java.util.List;

public class ResponseListadoUsuarios {
    private List<UsuarioDto> usuarios;

    public ResponseListadoUsuarios() {}

    public ResponseListadoUsuarios(List<UsuarioDto> usuarios) {
        this.usuarios = usuarios;
    }

    public List<UsuarioDto> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(List<UsuarioDto> usuarios) {
        this.usuarios = usuarios;
    }
}
