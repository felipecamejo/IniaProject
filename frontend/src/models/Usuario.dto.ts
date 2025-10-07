import { UserRole } from './enums';

export interface UsuarioDto {
  id: number;
  email: string;
  nombre: string;
  telefono?: string;
  rol: UserRole; // Usar el enum de roles del frontend
  activo: boolean;
  lotesId?: number[]; // Agregar campo opcional para lotes
}