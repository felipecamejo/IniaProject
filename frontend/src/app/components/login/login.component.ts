import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

    // Campos de texto simples

    email: string = '';
    password: string = '';
    loading: boolean = false;
    error: string = '';
    showPassword: boolean = false;

    constructor(private auth: AuthService, private router: Router) {
      // Limpieza de datos sensibles al entrar al login
      localStorage.clear();
      sessionStorage.clear();
    }

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }

    onSubmit(form: any) {
      if (form.invalid || this.loading) return;
      this.loading = true;
      this.error = '';

      this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
          this.loading = false;
          this.router.navigate(['/home']);
        },
      error: (e) => {
        this.loading = false;
        if (e?.status === 403) {
          this.error = 'Acceso denegado. Verifica tus credenciales o permisos.';
        } else if (e?.status === 400) {
          this.error = typeof e.error === 'string' ? e.error : 'Datos inválidos.';
        } else if (e?.status === 0) {
          this.error = 'No se pudo conectar con el servidor.';
        } else {
          this.error = 'Credenciales inválidas. Intenta nuevamente.';
        }
      }
      });
    }

}
