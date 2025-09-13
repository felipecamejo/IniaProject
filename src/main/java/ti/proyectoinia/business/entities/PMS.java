package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "PMS")
public class PMS {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PMS_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "LOTE_ID")
    private Lote lote;

    @Column(name = "PESO_MIL_SEMILLAS")
    private float pesoMilSemillas; // en gramos

    @Column(name = "HUMEDAD_PORCENTUAL")
    private float humedadPorcentual; // 0-100

    @Column(name = "FECHA_MEDICION")
    private float fechaMedicion;

    @Column(name = "METODO")
    private String metodo;

    @Column(name = "OBSERVACIONES")
    private String observaciones;
}
