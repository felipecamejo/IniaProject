export interface PMSDto {
  id: number | null;
  gramosPorRepeticiones: number[];
  pesoPromedioCienSemillas: number | null;
  pesoMilSemillas: number | null;
  pesoPromedioMilSemillas: number | null;
  desvioEstandar: number | null;
  coeficienteVariacion: number | null;
  comentarios: string;
  activo: boolean;
  repetido: boolean;
  estandar: boolean;
  reciboId: number | null;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
}
