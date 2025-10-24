package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(
    name = "CONTEO_GERMINACION",
    uniqueConstraints = {
        @UniqueConstraint(name = "UK_CONTEO_GERM_GERM_NUM", columnNames = {"GERMINACION_ID", "NUMERO_CONTEO"})
    }
)
public class ConteoGerminacion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "CONTEO_GERMINACION_ID")
    private Long id;

    
    @Column(name = "GERMINACION_ID", nullable = false)
    private Long germinacionId;

   
    @Column(name = "NUMERO_CONTEO", nullable = false)
    private Integer numeroConteo;

   
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "FECHA_CONTEO")
    private Date fechaConteo;


    @Column(name = "CONTEO_GERMINACION_ACTIVO")
    private boolean activo = true;
}
