package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
    name = "GERMINACION_NORMAL_POR_CONTEO",
    uniqueConstraints = {
        @UniqueConstraint(name = "UK_GERM_NORMAL_UNIQ", columnNames = {"GERMINACION_ID", "TABLA", "NUMERO_REPETICION", "CONTEO_ID"})
    },
    indexes = {
        @Index(name = "IDX_GERM_NORMAL_GERM", columnList = "GERMINACION_ID"),
        @Index(name = "IDX_GERM_NORMAL_CONTEO", columnList = "CONTEO_ID")
    }
)
@Data
public class NormalPorConteo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "NORMAL_POR_CONTEO_ID")
    private Long id;

    @Column(name = "ACTIVO")
    private boolean activo = true;

    @Column(name = "GERMINACION_ID")
    private Long germinacionId;

    // Tabla/Tratamiento: SIN_CURAR | CURADA_PLANTA | CURADA_LABORATORIO
    @Column(name = "TABLA", length = 32)
    private String tabla;

    @Column(name = "NUMERO_REPETICION")
    private Integer numeroRepeticion;

    @Column(name = "CONTEO_ID")
    private Long conteoId;

    @Column(name = "NORMAL")
    private Integer normal;

    @Column(name = "PROMEDIO_NORMAL")
    private Float promedioNormal;
}
