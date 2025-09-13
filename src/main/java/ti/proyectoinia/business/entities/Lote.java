package ti.proyectoinia.business.entities;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "LOTE")
public class Lote {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "LOTE_ID")
    private int loteId;

    @Column(name = "LOTE_NOMBRE")
    private String nombre;
}
