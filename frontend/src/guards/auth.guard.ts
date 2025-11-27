import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/AuthService';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si hay token
  if (authService.token) {
    return true;
  }

  // Si no hay token, redirigir a login
  router.navigate(['/login']);
  return false;
};

