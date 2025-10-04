export interface PurezaDto {
  id: number | null;

  fechaInase: string | null;
  fechaInia: string | null;

  pesoInicial: number | null;
  pesoInicialInase: number | null;
  pesoInicialPorcentajeRedondeo: number | null;
  pesoInicialPorcentajeRedondeoInase: number | null;

  semillaPura: number | null;
  semillaPuraInase: number | null;
  semillaPuraPorcentajeRedondeo: number | null;
  semillaPuraPorcentajeRedondeoInase: number | null;

  materialInerte: number | null;
  materialInerteInase: number | null;
  materialInertePorcentajeRedondeo: number | null;
  materialInertePorcentajeRedondeoInase: number | null;

  otrosCultivos: number | null;
  otrosCultivosInase: number | null;
  otrosCultivosPorcentajeRedondeo: number | null;
  otrosCultivosPorcentajeRedondeoInase: number | null;

  malezas: number | null;
  malezasInase: number | null;
  malezasPorcentajeRedondeo: number | null;
  malezasPorcentajeRedondeoInase: number | null;

  malezasToleradas: number | null;
  malezasToleradasInase: number | null;
  malezasToleradasPorcentajeRedondeo: number | null;
  malezasToleradasPorcentajeRedondeoInase: number | null;

  malezasToleranciaCero: number | null;
  malezasToleranciaCeroInase: number | null;
  malezasToleranciaCeroPorcentajeRedondeo: number | null;
  malezasToleranciaCeroPorcentajeRedondeoInase: number | null;

  pesoTotal: number | null;

  fechaEstandar: string | null;
  estandar: boolean;
  activo: boolean;
  reciboId: number | null;
  repetido: boolean;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
}
