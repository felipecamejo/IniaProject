package ti.proyectoinia.business.entities;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PreTratamientoGerminacion {
    NINGUNO("NINGUNO"),
    KNO3("KNO3"),
    PRE_LAVADO("Pre-lavado"),
    PRE_SECADO("Pre-secado"),
    GA3("GA3");

    private final String valor;

    PreTratamientoGerminacion(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static PreTratamientoGerminacion fromString(String text) {
        for (PreTratamientoGerminacion pt : PreTratamientoGerminacion.values()) {
            if (pt.valor.equalsIgnoreCase(text)) {
                return pt;
            }
        }
        return NINGUNO;
    }
}
