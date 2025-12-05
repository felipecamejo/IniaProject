package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
@Table(name = "PMS")
public class PMS {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PMS_ID")
    private Long id;

    @Column(name = "PESO_MIL_SEMILLAS")
    private Float pesoMilSemillas; // en gramos

    @Column(name = "COMENTARIOS")
    private String comentarios;

    @Column(name = "PMS_ACTIVO")
    private boolean activo;

    @Column(name = "PMS_REPETIDO")
    private boolean repetido;

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "PMS_FECHA_MEDICION")
    private Date fechaMedicion;

    @Column(name = "PMS_FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "PMS_FECHA_REPETICION")
    private Date fechaRepeticion;

    @Column(name = "PMS_ESTANDAR")
    private boolean estandar;

}
