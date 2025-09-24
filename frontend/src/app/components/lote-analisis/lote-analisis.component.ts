import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lote-analisis.component',
  imports: [],
  templateUrl: './lote-analisis.component.html',
  styleUrl: './lote-analisis.component.scss'
})
export class LoteAnalisisComponent {

  constructor(private router: Router) {}

  navigateToComponent(component: string): void {
    switch (component) {
      case 'recibo':
        this.router.navigate(['/recibo']);
        break;
      case 'pureza':
        this.router.navigate(['/pureza']);
        break;
      case 'pms':
        this.router.navigate(['/pms']);
        break;
      case 'sanitario':
        this.router.navigate(['/sanitario']);
        break;
      default:
        console.log(`Navegación no implementada para: ${component}`);
    }
  }
}
