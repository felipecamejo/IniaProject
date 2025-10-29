package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Viabilidad_REPS_TETRAZOLIO")
public class ViabilidadRepsTetrazolio {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "VIABILIDAD_REPS_TETRAZOLIO_ID")
    private Long id;

    @Column(name = "VIABILIDAD_REPS_TETRAZOLIO_ACTIVO")
    private boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TETRAZOLIO_ID")
    private Tetrazolio tetrazolio;

    @Column(name = "Viables")
    private int viables;

    @Column(name = "No_Viables")
    private int noViables;

    @Column(name = "Duras")
    private int duras;

    @Column(name = "NUMERO_REPETICION")
    private int numeroRepeticion;
}
