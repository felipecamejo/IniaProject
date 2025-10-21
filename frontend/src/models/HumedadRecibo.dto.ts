import { HumedadLugarDto } from './HumedadLugar.dto';

export interface HumedadReciboDto {
  id: number | null;
  reciboId: number | null;
  numero: number | null;
  lugar: HumedadLugarDto | null;
}