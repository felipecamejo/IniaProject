package ti.proyectoinia.business.entities;

public enum ViabilidadVigorTZ {
    VIGOR_ALTO(1, "Vigor Alto"),
    VIGOR_MEDIO(2, "Vigor Medio"),
    VIGOR_BAJO(3, "Vigor Bajo"),
    LIMITE_CRITICO(4, "Límite Crítico"),
    NO_VIABLES(5, "No Viables");

    private final int codigo;
    private final String descripcion;

    ViabilidadVigorTZ(int codigo, String descripcion) {
        this.codigo = codigo;
        this.descripcion = descripcion;
    }

    public int getCodigo() {
        return codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }
}