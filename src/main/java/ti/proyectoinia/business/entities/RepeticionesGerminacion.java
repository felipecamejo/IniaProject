package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@MappedSuperclass
@Data
public class RepeticionesGerminacion {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "Repeticiones_Germinacion_ID")
    private Long id;

    @Column(name = "Repeticiones_Germinacion_ACTIVO")
    private boolean activo;

    @Column(name = "GERMINACION_ID")
    private Long germinacionId;

    // Modelo normalizado: los valores 'normal' por conteo viven en NormalPorConteo.
    // Por eso, esta entidad base solo mantiene los campos finales por repetición.

    @Column(name = "ANORMAL")
    private Integer anormal;

    @Column(name = "DURAS")
    private Integer duras;

    @Column(name = "FRESCAS")
    private Integer frescas;

    @Column(name = "MUERTAS")
    private Integer muertas;

    @Column(name = "TOTALES")
    private Integer totales;

    // Promedios redondeados por cada columna
    @Column(name = "PROMEDIO_ANORMAL")
    private Float promedioAnormal;

    @Column(name = "PROMEDIO_DURAS")
    private Float promedioDuras;

    @Column(name = "PROMEDIO_FRESCAS")
    private Float promedioFrescas;

    @Column(name = "PROMEDIO_MUERTAS")
    private Float promedioMuertas;

    @Column(name = "PROMEDIO_TOTAL")
    private Float promedioTotal;

    @Column(name = "NUMERO_REPETICION")
    private Integer numeroRepeticion;

}
