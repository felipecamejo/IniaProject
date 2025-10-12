package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import java.util.Date;

@Data
public class PurezaDto {
    private Long id;

    private Date fechaInase;

    private Date fechaInia;

    private Float pesoInicial;
    private Float pesoInicialInase;
    private Float pesoInicialPorcentaje;
    private Float pesoInicialPorcentajeInase;
    private Float pesoInicialPorcentajeRedondeo;
    private Float pesoInicialPorcentajeRedondeoInase;

    private Float semillaPura;
    private Float semillaPuraInase;
    private Float semillaPuraPorcentaje;
    private Float semillaPuraPorcentajeInase;
    private Float semillaPuraPorcentajeRedondeo;
    private Float semillaPuraPorcentajeRedondeoInase;

    private Float materialInerte;
    private Float materialInerteInase;
    private Float materialInertePorcentaje;
    private Float materialInertePorcentajeInase;
    private Float materialInertePorcentajeRedondeo;
    private Float materialInertePorcentajeRedondeoInase;

    private Float otrosCultivos;
    private Float otrosCultivosInase;
    private Float otrosCultivosPorcentaje;
    private Float otrosCultivosPorcentajeInase;
    private Float otrosCultivosPorcentajeRedondeo;
    private Float otrosCultivosPorcentajeRedondeoInase;

    private Float malezas;
    private Float malezasInase;
    private Float malezasPorcentaje;
    private Float malezasPorcentajeInase;
    private Float malezasPorcentajeRedondeo;
    private Float malezasPorcentajeRedondeoInase;

    private Float malezasToleradas;
    private Float malezasToleradasInase;
    private Float malezasToleradasPorcentaje;
    private Float malezasToleradasPorcentajeInase;
    private Float malezasToleradasPorcentajeRedondeo;
    private Float malezasToleradasPorcentajeRedondeoInase;

    private Float malezasToleranciaCero;
    private Float malezasToleranciaCeroInase;
    private Float malezasToleranciaCeroPorcentaje;
    private Float malezasToleranciaCeroPorcentajeInase;
    private Float malezasToleranciaCeroPorcentajeRedondeo;
    private Float malezasToleranciaCeroPorcentajeRedondeoInase;

    private Float pesoTotal;
    private Float pesoTotalInase;
    private Float pesoTotalPorcentaje;
    private Float pesoTotalPorcentajeInase;

    private Float otrosCultivo;

    private Date fechaEstandar;

    private boolean estandar;

    private boolean activo;

    private Long reciboId;

    private boolean repetido;

    private Date fechaCreacion;

    private Date fechaRepeticion;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PurezaDto that = (PurezaDto) o;
        return java.util.Objects.equals(id, that.id) &&
                java.util.Objects.equals(fechaInase, that.fechaInase) &&
                java.util.Objects.equals(fechaInia, that.fechaInia) &&
                Float.compare(pesoInicial, that.pesoInicial) == 0 &&
                Float.compare(semillaPura, that.semillaPura) == 0 &&
                Float.compare(materialInerte, that.materialInerte) == 0 &&
                Float.compare(otrosCultivos, that.otrosCultivos) == 0 &&
                Float.compare(malezas, that.malezas) == 0 &&
                Float.compare(malezasToleradas, that.malezasToleradas) == 0 &&
                Float.compare(pesoTotal, that.pesoTotal) == 0 &&
                java.util.Objects.equals(fechaEstandar, that.fechaEstandar) &&
                estandar == that.estandar &&
                activo == that.activo;
    }

    @Generated
    protected boolean canEqual(final Object other) {
        return other instanceof PurezaDto;
    }

    @Generated
    public int hashCode() {
        int result = 1;
        Object $id = this.getId();
        result = result * 59 + ($id == null ? 43 : $id.hashCode());
        Object $fechaInase = this.getFechaInase();
        result = result * 59 + ($fechaInase == null ? 43 : $fechaInase.hashCode());
        Object $fechaInia = this.getFechaInia();
        result = result * 59 + ($fechaInia == null ? 43 : $fechaInia.hashCode());
        result = result * 59 + Float.floatToIntBits(this.getPesoInicial());
        result = result * 59 + Float.floatToIntBits(this.getSemillaPura());
        result = result * 59 + Float.floatToIntBits(this.getMaterialInerte());
        result = result * 59 + Float.floatToIntBits(this.getOtrosCultivos());
        result = result * 59 + Float.floatToIntBits(this.getMalezas());
        result = result * 59 + Float.floatToIntBits(this.getMalezasToleradas());
        result = result * 59 + Float.floatToIntBits(this.getPesoTotal());
        Object $fechaEstandar = this.getFechaEstandar();
        result = result * 59 + ($fechaEstandar == null ? 43 : $fechaEstandar.hashCode());
        result = result * 59 + (this.isEstandar() ? 79 : 97);
        result = result * 59 + (this.isActivo() ? 79 : 97);
        return result;
    }

    @Generated
    public String toString() {
        return "PurezaDto(id=" + this.getId() + ", fechaInase=" + String.valueOf(this.getFechaInase()) + ", fechaInia=" + String.valueOf(this.getFechaInia()) + ")";
    }
}
