// src/main/java/ti/proyectoinia/business/entities/SanitarioHongo.java
package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "SANITARIO_HONGO")
public class SanitarioHongo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "SANITARIO_HONGO_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "SANITARIO_ID")
    private Sanitario sanitario;

    @ManyToOne
    @JoinColumn(name = "HONGO_ID")
    private Hongo hongo;

    @Column(name = "REPETICION")
    private Integer repeticion;

    @Column(name = "VALOR")
    private Integer valor;

    @Column(name = "INCIDENCIA")
    private Integer incidencia; // o porcentaje de humedad, según corresponda
}