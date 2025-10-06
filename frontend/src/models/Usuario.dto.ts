export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface UsuarioDto {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole; // Usar el enum de roles del frontend
  activo: boolean;
  lotesId?: number[]; // Agregar campo opcional para lotes
}