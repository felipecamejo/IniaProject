package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "RECIBO")
public class Recibo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "RECIBO_ID")
    private int reciboId;

    @Column(name = "NRO_ANALISIS")
    private int nroAnalisis;

    @Column(name = "ESPECIE")
    private String especie;

    @Column(name = "FICHA")
    private String ficha;

    @Column(name = "FECHA_RECIBO")
    private java.time.LocalDateTime fechaRecibo;

    @Column(name = "REMITENTE")
    private String remitente;

    @Column(name = "ORIGEN")
    private String origen;

    @Column(name = "CULTIVAR")
    private String cultivar;

    @Column(name = "DEPOSITO")
    private String deposito;

    @Column(name = "ESTADO")
    private String estado;

    @Column(name = "LOTE")
    private int lote;

    @Column(name = "KG_LIMPIOS")
    private float kgLimpios;

    @Column(name = "ANALISIS_SOLICITADOS")
    private String analisisSolicitados;

    @Column(name = "ARTICULO")
    private int articulo;
}
