package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "LOGS")
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "LOGS_ID")
    private Long id;

    @Column(name = "LOGS_TEXTO")
    private String texto;

    @Column(name = "LOGS_FECHA_CREACION")
    private Date fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LOTE_ID", nullable = false)
    private Lote lote;

}
