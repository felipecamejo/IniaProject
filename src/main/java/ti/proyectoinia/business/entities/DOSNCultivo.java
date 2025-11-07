package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(
    name = "DOSN_CULTIVO",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "UK_DOSN_CULTIVO_ORG",
            columnNames = {"DOSN_ID", "CULTIVO_ID", "ORGANISMO"}
        )
    }
)
public class DOSNCultivo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "DOSN_CULTIVO_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "DOSN_ID")
    private DOSN dosn;

    @ManyToOne
    @JoinColumn(name = "CULTIVO_ID")
    private Cultivo cultivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "ORGANISMO")
    private Organismo organismo;

    @Column(name = "CANTIDAD")
    private Integer cantidad;
}
