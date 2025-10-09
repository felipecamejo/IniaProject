import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router) {}

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
}
