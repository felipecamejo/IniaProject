package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "HUMEDAD_RECIBO")
public class HumedadRecibo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "HUMEDAD_RECIBO_ID")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "HUMEDAD_LUGAR")
    private HumedadLugar lugar;

    @Column(name = "HUMEDAD_NUMERO")
    private Integer numero;

}
