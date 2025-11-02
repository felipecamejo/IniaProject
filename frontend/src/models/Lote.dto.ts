export enum loteCategoria {
  P = 'P',
  FT = 'FT',
  M = 'M',
  B = 'B',
  PB = 'PB',
  C1 = 'C1',
  C2 = 'C2',
  CO = 'CO'
}

export interface LoteDto {
    id: number | null;
    nombre: string;
    descripcion: string;
    fechaCreacion: string | null;
    fechaFinalizacion: string | null;
    activo: boolean;
    usuariosId: number[] | null;
    estado?: string;
    autor?: string;
    fecha?: string;
    categoria?: loteCategoria | null;
}
