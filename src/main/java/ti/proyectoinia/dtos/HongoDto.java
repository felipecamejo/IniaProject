package ti.proyectoinia.dtos;

import lombok.Generated;
import lombok.Getter;
import ti.proyectoinia.business.entities.tipoHongo;

public class HongoDto {
    
    @Getter
    private Long id;
    @Getter
    private String nombre;
    @Getter
    private tipoHongo tipo;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) {
            return true;
        } else if (!(o instanceof HongoDto)) {
            return false;
        } else {
            HongoDto other = (HongoDto)o;
            if (!other.canEqual(this)) {
                return false;
            } else {
                Object this$id = this.getId();
                Object other$id = other.getId();
                if (this$id == null) {
                    if (other$id != null) {
                        return false;
                    }
                } else if (!this$id.equals(other$id)) {
                    return false;
                }
                Object this$nombre = this.getNombre();
                Object other$nombre = other.getNombre();
                if (this$nombre == null) {
                    if (other$nombre != null) {
                        return false;
                    }
                } else if (!this$nombre.equals(other$nombre)) {
                    return false;
                }
                Object this$tipo = this.getTipo();
                Object other$tipo = other.getTipo();
                if (this$tipo == null) {
                    if (other$tipo != null) {
                        return false;
                    }
                } else if (!this$tipo.equals(other$tipo)) {
                    return false;
                }
                return true;
            }
        }
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
