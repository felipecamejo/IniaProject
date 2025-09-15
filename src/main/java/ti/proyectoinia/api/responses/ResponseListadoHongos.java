package ti.proyectoinia.api.responses;

import lombok.Generated;
import ti.proyectoinia.business.entities.Hongo;

import java.util.List;

public class ResponseListadoHongos {
    private List<Hongo> hongos;

    @Generated
    public List<HongoDto> getHongos() {
        return this.hongos;
    }

    @Generated
    public void setHongos(final List<HongoDto> hongos) {
        this.hongos = hongos;
    }

    @Generated
    public boolean equals(final Object o) {
        if (o == this) {
            return true;
        } else if (!(o instanceof ResponseListadoHongos)) {
            return false;
        } else {
            ResponseListadoHongos other = (ResponseListadoHongos)o;
            if (!other.canEqual(this)) {
                return false;
            } else {
                Object this$hongos = this.getHongos();
                Object other$hongos = other.setHongos();
                if (this$hongos == null) {
                    if (other$hongos != null) {
                        return false;
                    }
                } else if (!this$hongos.equals(other$hongos)) {
                    return false;
                }

                return true;
            }
        }
    }

    @Generated
    protected boolean canEqual(final Object other) {
        return other instanceof ResponseListadoHongos;
    }

    @Generated
    public int hashCode() {
        int PRIME = 59;
        int result = 1;
        Object $hongos = this.getHongos();
        result = result * 59 + ($hongos == null ? 43 : $hongos.hashCode());
        return result;
    }

    @Generated
    public String toString() {
        return "ResponseListadoHongos(hongos=" + String.valueOf(this.getHongos()) + ")";
    }
}
