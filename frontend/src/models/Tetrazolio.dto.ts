export type ViabilidadPorTz = 'ALTA' | 'MEDIA' | 'BAJA';
export type ViabilidadVigorTZ = 'VIGOR_ALTO' | 'VIGOR_MEDIO' | 'VIGOR_BAJO' | 'LIMITE_CRITICO';

export interface PreTratamiento {
  id: number;
  nombre: string;
}

export interface ReporteFilaDanios {
  mecanicos: number | null;
  ambiente: number | null;
  chinches: number | null;
  fracturas: number | null;
  otros: number | null;
  duras: number | null;
}

export interface ReporteFila {
  porcentaje: number | null;
  danios: ReporteFilaDanios;
}

export interface ReporteTetrazolio {
  vigorAlto: ReporteFila;
  vigorMedio: ReporteFila;
  vigorBajo: ReporteFila;
  limiteCritico: ReporteFila;
  noViables: ReporteFila;
  viabilidad: ReporteFila;
  vigorAcumulado: ReporteFila;
}

export interface TetrazolioDto {
  id: number | null;
  repeticion: number | null;
  nroSemillasPorRepeticion: number | null;
  pretratamiento: PreTratamiento | null;
  concentracion: string | null;
  tincionHoras: string | null;
  tincionGrados: string | null;
  fecha: string | null;
  viables: string | null;
  noViables: string | null;
  duras: string | null;
  total: string | null;
  promedio: string | null;
  porcentaje: number | null;
  viabilidadPorTetrazolio: ViabilidadPorTz | null;
  nroSemillas: number | null;
  daniosNroSemillas: number | null;
  daniosMecanicos: number | null;
  danioAmbiente: number | null;
  daniosChinches: number | null;
  daniosFracturas: number | null;
  daniosOtros: number | null;
  daniosDuras: number | null;
  viabilidadVigorTz: ViabilidadVigorTZ | null;
  porcentajeFinal: number | null;
  daniosPorPorcentajes: number | null;
  activo: boolean;
  estandar: boolean;
  repetido: boolean;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
  reciboId: number | null;
  reporte: ReporteTetrazolio | null;
}
