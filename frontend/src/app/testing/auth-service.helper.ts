import { AuthService } from '../../services/AuthService';

/**
 * Helper para crear un mock del AuthService con datos de usuario admin
 * Usa las credenciales del sistema: admin@inia.com / password123
 * JWT_SECRET: miClaveSecretaSuperSeguraParaJWT2024IniaProject
 */
export function createMockAuthService(): any {
  const mockToken = 'mock-jwt-token-for-testing-admin@inia.com';
  const mockUserData = {
    nombre: 'Administrador',
    email: 'admin@inia.com',
    roles: ['ADMIN']
  };

  // Crear un objeto mock simple sin usar jasmine directamente
  const mockAuthService: any = {
    token: mockToken,
    userEmail: mockUserData.email,
    userData: mockUserData,
    userRoles: mockUserData.roles,
    login: () => {},
    logout: () => {},
    storeSession: () => {},
    isAdmin: () => true,
    isAnalista: () => false,
    hasRole: (role: string) => mockUserData.roles.includes(role)
  };

  return mockAuthService;
}

