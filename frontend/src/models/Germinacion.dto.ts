export type Metodo = 'A' | 'B' | 'C';
export type PreFrio = 'NINGUNO' |'3 dias'
  | '4 dias'
  | '5 dias'
  | '6 dias'
  | '7 dias'
  | '8 dias'
  | '9 dias'
  | '10 dias'
  | '11 dias'
  | '12 dias'
  | '13 dias'
  | '14 dias'
  | '15 dias';
export type PreTratamiento = 'NINGUNO' | 'KNO3' | 'Pre-lavado' | 'Pre-secado' | 'GA3';
export type Tratamiento = 'NINGUNO' | 'T1' | 'T2';

export interface GerminacionDto {
  id: number | null;
  fechaInicio: string | null;
  fechaConteo1: string | null;
  fechaConteo2: string | null;
  fechaConteo3: string | null;
  fechaConteo4: string | null;
  fechaConteo5: string | null;
  totalDias: number;
  repeticionNormal1: number;
  repeticionNormal2: number;
  repeticionNormal3: number;
  repeticionNormal4: number;
  repeticionNormal5: number;
  repeticionDura: number;
  repeticionFresca: number;
  repeticionAnormal: number;
  repeticionMuerta: number;
  totalRepeticion: number;
  promedioRepeticiones: number;
  tratamiento: Tratamiento;
  nroSemillaPorRepeticion: number;
  metodo: Metodo;
  temperatura: number;
  preFrio: PreFrio;
  preTratamiento: PreTratamiento;
  nroDias: number;
  fechaFinal: string | null;
  pRedondeo: number;
  pNormal: number;
  pAnormal: number;
  pMuertas: number;
  semillasDuras: number;
  germinacion: number;
  comentarios: string;
  observaciones?: string;
  reciboId: number | null;
  activo: boolean;
  estandar: boolean;
  repetido: boolean;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
}
