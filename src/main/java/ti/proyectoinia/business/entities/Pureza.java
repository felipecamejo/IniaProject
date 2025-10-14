package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Table(name = "PUREZA")
public class Pureza {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PUREZA_ID")
    private Long id;

    @Column(name = "FECHA_INASE")
    private Date fechaInase;

    @Column(name = "FECHA_INIA")
    private Date fechaInia;

    @Column(name = "PESO_INICIAL")
    private Float pesoInicial;
    @Column(name = "PESO_INICIAL_INASE")
    private Float pesoInicialInase;

    @Column(name = "SEMILLA_PURA")
    private Float semillaPura;
    @Column(name = "SEMILLA_PURA_INASE")
    private Float semillaPuraInase;
    @Column(name = "SEMILLA_PURA_PORCENTAJE")
    private Float semillaPuraPorcentaje;
    @Column(name = "SEMILLA_PURA_PORCENTAJE_INASE")
    private Float semillaPuraPorcentajeInase;
    @Column(name = "SEMILLA_PURA_PORCENTAJE_REDONDEO")
    private Float semillaPuraPorcentajeRedondeo;
    @Column(name = "SEMILLA_PURA_PORCENTAJE_REDONDEO_INASE")
    private Float semillaPuraPorcentajeRedondeoInase;

    @Column(name = "MATERIAL_INERTE")
    private Float materialInerte;
    @Column(name = "MATERIAL_INERTE_INASE")
    private Float materialInerteInase;
    @Column(name = "MATERIAL_INERTE_PORCENTAJE")
    private Float materialInertePorcentaje;
    @Column(name = "MATERIAL_INERTE_PORCENTAJE_INASE")
    private Float materialInertePorcentajeInase;
    @Column(name = "MATERIAL_INERTE_PORCENTAJE_REDONDEO")
    private Float materialInertePorcentajeRedondeo;
    @Column(name = "MATERIAL_INERTE_PORCENTAJE_REDONDEO_INASE")
    private Float materialInertePorcentajeRedondeoInase;

    @Column(name = "OTROS_CULTIVOS")
    private Float otrosCultivos;
    @Column(name = "OTROS_CULTIVOS_INASE")
    private Float otrosCultivosInase;
    @Column(name = "OTROS_CULTIVOS_PORCENTAJE")
    private Float otrosCultivosPorcentaje;
    @Column(name = "OTROS_CULTIVOS_PORCENTAJE_INASE")
    private Float otrosCultivosPorcentajeInase;
    @Column(name = "OTROS_CULTIVOS_PORCENTAJE_REDONDEO")
    private Float otrosCultivosPorcentajeRedondeo;
    @Column(name = "OTROS_CULTIVOS_PORCENTAJE_REDONDEO_INASE")
    private Float otrosCultivosPorcentajeRedondeoInase;

    @Column(name = "MALEZAS")
    private Float malezas;
    @Column(name = "MALEZAS_INASE")
    private Float malezasInase;
    @Column(name = "MALEZAS_PORCENTAJE")
    private Float malezasPorcentaje;
    @Column(name = "MALEZAS_PORCENTAJE_INASE")
    private Float malezasPorcentajeInase;
    @Column(name = "MALEZAS_PORCENTAJE_REDONDEO")
    private Float malezasPorcentajeRedondeo;
    @Column(name = "MALEZAS_PORCENTAJE_REDONDEO_INASE")
    private Float malezasPorcentajeRedondeoInase;

    @Column(name = "MALEZAS_TOLERADAS")
    private Float malezasToleradas;
    @Column(name = "MALEZAS_TOLERADAS_INASE")
    private Float malezasToleradasInase;
    @Column(name = "MALEZAS_TOLERADAS_PORCENTAJE")
    private Float malezasToleradasPorcentaje;
    @Column(name = "MALEZAS_TOLERADAS_PORCENTAJE_INASE")
    private Float malezasToleradasPorcentajeInase;
    @Column(name = "MALEZAS_TOLERADAS_PORCENTAJE_REDONDEO")
    private Float malezasToleradasPorcentajeRedondeo;
    @Column(name = "MALEZAS_TOLERADAS_PORCENTAJE_REDONDEO_INASE")
    private Float malezasToleradasPorcentajeRedondeoInase;

    @Column(name = "MALEZAS_TOLERANCIA_CERO")
    private Float malezasToleranciaCero;
    @Column(name = "MALEZAS_TOLERANCIA_CERO_INASE")
    private Float malezasToleranciaCeroInase;
    @Column(name = "MALEZAS_TOLERANCIA_CERO_PORCENTAJE")
    private Float malezasToleranciaCeroPorcentaje;
    @Column(name = "MALEZAS_TOLERANCIA_CERO_PORCENTAJE_INASE")
    private Float malezasToleranciaCeroPorcentajeInase;
    @Column(name = "MALEZAS_TOLERANCIA_CERO_PORCENTAJE_REDONDEO")
    private Float malezasToleranciaCeroPorcentajeRedondeo;
    @Column(name = "MALEZAS_TOLERANCIA_CERO_PORCENTAJE_REDONDEO_INASE")
    private Float malezasToleranciaCeroPorcentajeRedondeoInase;

    @Column(name = "PESO_TOTAL")
    private Float pesoTotal;
    @Column(name = "PESO_TOTAL_INASE")
    private Float pesoTotalInase;

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

    @OneToMany
    @JoinColumn(name = "PUREZA_ID")
    private List<Cultivo> cultivos;

    @ManyToMany
    @JoinTable(
            name = "PUREZA_MALEZA_NORMAL",
            joinColumns = @JoinColumn(name = "PUREZA_ID"),
            inverseJoinColumns = @JoinColumn(name = "MALEZA_ID")
    )
    private List<Maleza> malezasNormales;

    @ManyToMany
    @JoinTable(
            name = "PUREZA_MALEZA_TOLERADA",
            joinColumns = @JoinColumn(name = "PUREZA_ID"),
            inverseJoinColumns = @JoinColumn(name = "MALEZA_ID")
    )
    private List<Maleza> ListamalezasToleradas;

    @ManyToMany
    @JoinTable(
            name = "PUREZA_MALEZA_TOLERANCIA_CERO",
            joinColumns = @JoinColumn(name = "PUREZA_ID"),
            inverseJoinColumns = @JoinColumn(name = "MALEZA_ID")
    )
    private List<Maleza> ListamalezasToleranciaCero;

}
