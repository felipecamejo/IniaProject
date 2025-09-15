package ti.proyectoinia.business.entities;

public enum ViabilidadPorTz {
    VIABLE_SIN_DEFECTOS(1, "Viable sin defectos"),
    DEFECTOS_LEVES(2, "Viables con defectos leves"),
    DEFECTOS_MODERADOS(3, "Viables con defectos moderados"),
    DEFECTOS_SEVEROS(4, "Viables con defectos severos"),
    NO_VIABLES(5, "No viables");

    private final int codigo;
    private final String descripcion;

    ViabilidadPorTz(int codigo, String descripcion) {
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
