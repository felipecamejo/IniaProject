package ti.proyectoinia.business.entities;


import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "LOTE")
public class Lote {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "LOTE_ID")
    private Long Id;

    @Column(name = "LOTE_NOMBRE")
    private String nombre;

    @Column(name = "LOTE_ACTIVO")
    private boolean activo;

    @OneToMany
    @JoinColumn(name = "LOTE_ID")
    private List<Recibo> recibos;

    @ManyToMany(mappedBy = "lotes")
    private List<Usuario> usuarios;
}
