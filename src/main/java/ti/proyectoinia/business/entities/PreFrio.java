package ti.proyectoinia.business.entities;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PreFrio {
    NINGUNO("NINGUNO"),
    TRES_DIAS("3 dias"),
    CUATRO_DIAS("4 dias"),
    CINCO_DIAS("5 dias"),
    SEIS_DIAS("6 dias"),
    SIETE_DIAS("7 dias"),
    OCHO_DIAS("8 dias"),
    NUEVE_DIAS("9 dias"),
    DIEZ_DIAS("10 dias"),
    ONCE_DIAS("11 dias"),
    DOCE_DIAS("12 dias"),
    TRECE_DIAS("13 dias"),
    CATORCE_DIAS("14 dias"),
    QUINCE_DIAS("15 dias");

    private final String valor;

    PreFrio(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static PreFrio fromString(String text) {
        for (PreFrio pf : PreFrio.values()) {
            if (pf.valor.equalsIgnoreCase(text)) {
                return pf;
            }
        }
        return NINGUNO;
    }
}

