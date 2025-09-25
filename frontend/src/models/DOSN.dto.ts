import { CultivoDto } from './Cultivo.dto';

export interface DOSNDto {
  id: number | null;
  fecha: string | null;
  gramosAnalizados: number;
  tiposDeanalisis: string;
  completoReducido: boolean;
  malezasToleranciaCero: number;
  otrosCultivos: number;
  determinacionBrassica: number;
  determinacionCuscuta: number;
  estandar: boolean;
  fechaAnalisis: string | null;
  cultivos: CultivoDto[] | null;
  activo: boolean;
  repetido: boolean;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
}
