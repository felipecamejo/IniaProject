package ti.proyectoinia.dtos;


import lombok.Data;
import ti.proyectoinia.business.entities.PreFrio;
import ti.proyectoinia.business.entities.PreTratamiento;
import ti.proyectoinia.business.entities.Tratamiento;

import java.util.Date;

@Data
public class GerminacionDto {

    private Long id;

    private Date fechaInicio;

    private Date fechaConteo1;

    private Date fechaConteo2;

    private Date fechaConteo3;

    private Date fechaConteo4;

    private Date fechaConteo5;

    private int totalDias;

    private int repeticionNormal1;

    private int repeticionNormal2;

    private int repeticionNormal3;

    private int repeticionNormal4;

    private int repeticionNormal5;

    private int repeticionDura;

    private int repeticionFresca;

    private int repeticionAnormal;

    private int repeticionMuerta;

    private int totalRepeticion;

    private float promedioRepeticiones;

    private Tratamiento tratamiento;

    private int nroSemillaPorRepeticion;

    private String metodo;

    private float temperatura;

    private PreFrio preFrio;

    private PreTratamiento preTratamiento;

    private int nroDias;

    private Date fechaFinal;

    private int pRedondeo;

    private int pNormal;

    private int pAnormal;

    private int pMuertas;

    private int semillasDuras;

    private int germinacion;

    private String comentarios;

    private Long reciboId;

    private boolean activo;

    private boolean repetido;

    private Date fechaCreacion;

    private Date fechaRepeticion;
}
