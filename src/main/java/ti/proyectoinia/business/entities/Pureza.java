package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "PUREZA")
public class Pureza {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PUREZA_ID")
    private int purezaId;

    @Column(name = "FECHA")
    private java.time.LocalDateTime fecha;

    @Column(name = "PESO_INICIAL")
    private float pesoInicial;

    @Column(name = "SEMILLA_PURA")
    private float semillaPura;

    @Column(name = "MATERIAL_INERTE")
    private float materialInerte;

    @Column(name = "OTROS_CULTIVOS")
    private float otrosCultivos;

    @Column(name = "MALEZAS")
    private float malezas;

    @Column(name = "MALEZAS_TOLERADAS")
    private float malezasToleradas;

    @Column(name = "PESO_TOTAL")
    private float pesoTotal;

    @Column(name = "OTROS_CULTIVO")
    private float otrosCultivo;

    @Column(name = "FECHA_ESTANDAR")
    private java.time.LocalDateTime fechaEstandar;

    @Column(name = "ESTANDAR")
    private boolean estandar;

    @Column(name = "PUREZA_ACTIVO")
    private boolean activo;
}
