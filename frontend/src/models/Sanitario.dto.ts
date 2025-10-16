export interface SanitarioDto {
  id: number | null;
  fechaSiembra: string | null;
  fecha: string | null;
  metodo: string;
  temperatura: number | null;
  horasLuz: number | null;
  horasOscuridad: number | null;
  nroDias: number | null;
  estado: string;
  observaciones: string;
  nroSemillasRepeticion: number | null;
  reciboId: number | null;
  activo: boolean;
  estandar: boolean;
  repetido: boolean;
  sanitarioHongoids: number[] | null;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
}
