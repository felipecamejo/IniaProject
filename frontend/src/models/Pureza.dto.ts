export interface PurezaDto {
  id: number | null;
  comentarios: string | null;

  fechaInase: string | null;
  fechaInia: string | null;

  pesoInicial: number | null;
  pesoInicialInase: number | null;

  semillaPura: number | null;
  semillaPuraInase: number | null;
  semillaPuraPorcentajeRedondeo: number | null;
  semillaPuraPorcentajeRedondeoInase: number | null;

  materialInerte: number | null;
  materialInerteInase: number | null;
  materialInertePorcentajeRedondeo: number | null;
  materialInertePorcentajeRedondeoInase: number | null;
  materiaInerteTipo: string | null;
  materiaInerteTipoInase: string | null;

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

  otrosCultivo: number | null;

  malezasNormalesId: number[] | null;
  malezasToleradasId: number[] | null;
  malezasToleranciaCeroId: number[] | null;
  cultivosId: number[] | null;

  estandar: boolean;
  activo: boolean;
  reciboId: number | null;
  repetido: boolean;
  fechaCreacion: string | null;
}
