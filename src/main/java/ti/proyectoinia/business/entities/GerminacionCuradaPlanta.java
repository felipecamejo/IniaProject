package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Where;
import java.util.List;

@Entity
@Table(
    name = "GERMINACION_CURADA_PLANTA",
    uniqueConstraints = {
        @UniqueConstraint(name = "UK_GERM_CP_GERM_REP", columnNames = {"GERMINACION_ID", "NUMERO_REPETICION"})
    },
    indexes = {
        @Index(name = "IDX_GERM_CP_GERM", columnList = "GERMINACION_ID")
    }
)
@Data
public class GerminacionCuradaPlanta extends RepeticionesGerminacion {
    // Navegación a normales por conteo para esta repetición y tratamiento (solo lectura)
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "GERMINACION_ID", referencedColumnName = "GERMINACION_ID"),
        @JoinColumn(name = "NUMERO_REPETICION", referencedColumnName = "NUMERO_REPETICION")
    })
    @Where(clause = "TABLA='CURADA_PLANTA' AND ACTIVO=true")
    @OrderBy("conteoId ASC")
    private List<NormalPorConteo> normales;
}
