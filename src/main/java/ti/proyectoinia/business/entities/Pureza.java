package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "PUREZA")
public class Pureza {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PUREZA_ID")
    private Long id;

    @Column(name = "FECHA")
    private Date fecha;

    @Column(name = "PESO_INICIAL")
    private Float pesoInicial;

    @Column(name = "SEMILLA_PURA")
    private Float semillaPura;

    @Column(name = "MATERIAL_INERTE")
    private Float materialInerte;

    @Column(name = "OTROS_CULTIVOS")
    private Float otrosCultivos;

    @Column(name = "MALEZAS")
    private Float malezas;

    @Column(name = "MALEZAS_TOLERADAS")
    private Float malezasToleradas;

    @Column(name = "PESO_TOTAL")
    private Float pesoTotal;

    @Column(name = "OTROS_CULTIVO")
    private Float otrosCultivo;

    @Column(name = "FECHA_ESTANDAR")
    private Date fechaEstandar;

    @Column(name = "ESTANDAR")
    private Boolean estandar;

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "PUREZA_ACTIVO")
    private boolean activo;

    @Column(name = "PUREZA_REPETIDO")
    private boolean repetido;

    @Column(name = "PUREZA_FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "PUREZA_FECHA_REPETICION")
    private Date fechaRepeticion;
}
