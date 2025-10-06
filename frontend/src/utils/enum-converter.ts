import { UserRole } from '../models/enums';

export class EnumConverter {
  static convertBackendRoleToFrontend(role: string): UserRole {
    switch ((role || '').toUpperCase()) {
      case 'ADMIN':
        return UserRole.ADMIN;
      case 'ANALISTA':
        return UserRole.ANALISTA;
      case 'OBSERVADOR':
        return UserRole.OBSERVADOR;
      default:
        return UserRole.OBSERVADOR;
    }
  }

  static getRoleDisplayName(role: UserRole | string): string {
    const value = typeof role === 'string' ? role.toUpperCase() : role;
    switch (value) {
      case UserRole.ADMIN:
      case 'ADMIN':
        return 'Administrador';
      case UserRole.ANALISTA:
      case 'ANALISTA':
        return 'Analista';
      case UserRole.OBSERVADOR:
      case 'OBSERVADOR':
        return 'Observador';
      default:
        return 'Desconocido';
    }
  }
}


