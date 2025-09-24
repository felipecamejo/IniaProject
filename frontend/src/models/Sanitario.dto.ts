export type Metodo = 'METODO_A' | 'METODO_B' | 'METODO_C';
export type Estado = 'ESTADO_X' | 'ESTADO_Y';

export interface SanitarioDto {
  id: number | null;
  fechaSiembra: string | null;
  fecha: string | null;
  metodo: Metodo;
  temperatura: number;
  horasLuzOscuridad: number;
  nroDias: number;
  estadoProductoDosis: Estado;
  observaciones: string;
  nroSemillasRepeticion: number;
  reciboId: number | null;
  activo: boolean;
  repetido: boolean;
  SanitarioHongoids: number[] | null;
}


