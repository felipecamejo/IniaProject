export type ViabilidadPorTz = 'ALTA' | 'MEDIA' | 'BAJA';
export type ViabilidadVigorTZ = 'ALTO' | 'MEDIO' | 'BAJO';

export interface TetrazolioDto {
  id: number | null;
  repeticion: number | null;
  nroSemillasPorRepeticion: number | null;
  pretratamientoId: number | null;
  concentracion: number;
  tincionHoras: number;
  tincionGrados: number;
  fecha: string | null;
  viables: number;
  noViables: number;
  duras: number;
  total: number;
  promedio: number;
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
  repetido: boolean;
}


