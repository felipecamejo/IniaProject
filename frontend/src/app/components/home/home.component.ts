import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/AuthService';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  goToListadoLotes() {
    this.router.navigate(['/listado-lotes']);
  }

  goToCrearLote() {
    this.router.navigate(['/lote/crear']);
  }

  // Admin panel - Listados
  goToCrearUsuario() {
    this.router.navigate(['/usuario/crear']);
  }

  goToListadoUsuarios() {
    this.router.navigate(['/listado-usuarios']);
  }

  goToListadoDepositos() {
    this.router.navigate(['/listado-depositos']);
  }

  goToListadoCultivos() {
    this.router.navigate(['/listado-cultivos']);
  }

  goToListadoMalezas() {
    this.router.navigate(['/listado-malezas']);
  }

  goToListadoHongos() {
    this.router.navigate(['/listado-hongos']);
  }

  goToListadoMetodos() {
    this.router.navigate(['/listado-metodos']);
  }
}
