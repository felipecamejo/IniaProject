package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(
    name = "DOSN_MALEZA",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "UK_DOSN_MALEZA_ORG_CAT",
            columnNames = {"DOSN_ID", "MALEZA_ID", "ORGANISMO", "CATEGORIA_MALEZA"}
        )
    }
)
public class DOSNMaleza {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "DOSN_MALEZA_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "DOSN_ID")
    private DOSN dosn;

    @ManyToOne
    @JoinColumn(name = "MALEZA_ID")
    private Maleza maleza;

    @Enumerated(EnumType.STRING)
    @Column(name = "ORGANISMO")
    private Organismo organismo;

    @Enumerated(EnumType.STRING)
    @Column(name = "CATEGORIA_MALEZA")
    private CategoriaMaleza categoria;

    @Column(name = "CANTIDAD")
    private Integer cantidad;
}
