package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Entity
@Table(
    name = "GERMINACION_CURADA_LABORATORIO",
    uniqueConstraints = {
        @UniqueConstraint(name = "UK_GERM_CL_GERM_REP", columnNames = {"GERMINACION_ID", "NUMERO_REPETICION"})
    },
    indexes = {
        @Index(name = "IDX_GERM_CL_GERM", columnList = "GERMINACION_ID")
    }
)
@Data
@EqualsAndHashCode(callSuper = false)
public class GerminacionCuradaLaboratorio extends RepeticionesGerminacion {
    // Navegación a normales por conteo para esta repetición y tratamiento (solo lectura)
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "GERMINACION_ID", referencedColumnName = "GERMINACION_ID", insertable = false, updatable = false),
        @JoinColumn(name = "NUMERO_REPETICION", referencedColumnName = "NUMERO_REPETICION", insertable = false, updatable = false)
    })

    @OrderBy("conteoId ASC")
    private List<NormalPorConteo> normales;
}
