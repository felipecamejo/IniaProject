export type ViabilidadPorTz = 'ALTA' | 'MEDIA' | 'BAJA';
export type ViabilidadVigorTZ = 'ALTO' | 'MEDIO' | 'BAJO';

export interface PreTratamiento {
  id: number;
  nombre: string;
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
  repetido: boolean;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
  reciboId: number | null;
}
