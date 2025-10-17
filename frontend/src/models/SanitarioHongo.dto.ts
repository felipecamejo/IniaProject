import { TipoHongoSanitario } from './enums';

export interface SanitarioHongoDTO {
  id: number | null;
  sanitarioId: number | null;
  hongoId: number | null;
  repeticion: number | null;
  valor: number | null;
  incidencia: number | null;
  activo: boolean;
  tipo: TipoHongoSanitario | null;
}
