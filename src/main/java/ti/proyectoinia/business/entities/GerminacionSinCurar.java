package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Where;
import java.util.List;

@Entity
@Table(
    name = "GERMINACION_SIN_CURAR",
    uniqueConstraints = {
        @UniqueConstraint(name = "UK_GERM_SC_GERM_REP", columnNames = {"GERMINACION_ID", "NUMERO_REPETICION"})
    },
    indexes = {
        @Index(name = "IDX_GERM_SC_GERM", columnList = "GERMINACION_ID")
    }
)
@Data
@EqualsAndHashCode(callSuper = false)
public class GerminacionSinCurar extends RepeticionesGerminacion {
    // Navegación a normales por conteo para esta repetición y tratamiento (solo lectura)
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "GERMINACION_ID", referencedColumnName = "GERMINACION_ID"),
        @JoinColumn(name = "NUMERO_REPETICION", referencedColumnName = "NUMERO_REPETICION")
    })
    @Where(clause = "TABLA='SIN_CURAR' AND ACTIVO=true")
    @OrderBy("conteoId ASC")
    private List<NormalPorConteo> normales;
}
