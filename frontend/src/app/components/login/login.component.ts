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

    constructor(private auth: AuthService, private router: Router) {}

    onSubmit(form: any) {
      if (form.invalid || this.loading) return;
      this.loading = true;
      this.error = '';

      this.auth.login({ email: this.email, password: this.password }).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: () => {
          this.loading = false;
          this.error = 'Credenciales inválidas. Intenta nuevamente.';
        }
      });
    }

}
