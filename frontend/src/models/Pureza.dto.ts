export interface PurezaDto {
  id: number | null;

  fechaInase: string | null;
  fechaInia: string | null;

  pesoInicial: number | null;
  pesoInicialInase: number | null;

  semillaPura: number | null;
  semillaPuraInase: number | null;
  semillaPuraPorcentaje: number | null;
  semillaPuraPorcentajeInase: number | null;
  semillaPuraPorcentajeRedondeo: number | null;
  semillaPuraPorcentajeRedondeoInase: number | null;

  materialInerte: number | null;
  materialInerteInase: number | null;
  materialInertePorcentaje: number | null;
  materialInertePorcentajeInase: number | null;
  materialInertePorcentajeRedondeo: number | null;
  materialInertePorcentajeRedondeoInase: number | null;

  otrosCultivos: number | null;
  otrosCultivosInase: number | null;
  otrosCultivosPorcentaje: number | null;
  otrosCultivosPorcentajeInase: number | null;
  otrosCultivosPorcentajeRedondeo: number | null;
  otrosCultivosPorcentajeRedondeoInase: number | null;

  malezas: number | null;
  malezasInase: number | null;
  malezasPorcentaje: number | null;
  malezasPorcentajeInase: number | null;
  malezasPorcentajeRedondeo: number | null;
  malezasPorcentajeRedondeoInase: number | null;

  malezasToleradas: number | null;
  malezasToleradasInase: number | null;
  malezasToleradasPorcentaje: number | null;
  malezasToleradasPorcentajeInase: number | null;
  malezasToleradasPorcentajeRedondeo: number | null;
  malezasToleradasPorcentajeRedondeoInase: number | null;

  malezasToleranciaCero: number | null;
  malezasToleranciaCeroInase: number | null;
  malezasToleranciaCeroPorcentaje: number | null;
  malezasToleranciaCeroPorcentajeInase: number | null;
  malezasToleranciaCeroPorcentajeRedondeo: number | null;
  malezasToleranciaCeroPorcentajeRedondeoInase: number | null;

  pesoTotal: number | null;
  pesoTotalInase: number | null;

  otrosCultivo: number | null;

  malezasNormalesId: number[] | null;
  malezasToleradasId: number[] | null;
  malezasToleranciaCeroId: number[] | null;
  cultivosId: number[] | null;


  fechaEstandar: string | null;
  estandar: boolean;
  activo: boolean;
  reciboId: number | null;
  repetido: boolean;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
}
