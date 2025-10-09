import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReciboService } from '../../../services/ReciboService';

@Component({
  selector: 'app-lote-analisis.component',
  imports: [],
  templateUrl: './lote-analisis.component.html',
  styleUrl: './lote-analisis.component.scss'
})
export class LoteAnalisisComponent implements OnInit {
  loteId: number | null = null;
  reciboId: number | null = null;
  tieneRecibo: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reciboService: ReciboService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loteId = params['loteId'] ? Number(params['loteId']) : null;
      this.reciboId = params['reciboId'] ? Number(params['reciboId']) : null;
      
      if (this.reciboId) {
        this.verificarRecibo();
      } else {
        this.tieneRecibo = false;
      }
    });
  }

  verificarRecibo(): void {
    if (this.reciboId) {
      this.reciboService.obtenerRecibo(this.reciboId).subscribe({
        next: (recibo) => {
          this.tieneRecibo = recibo && recibo.activo;
        },
        error: (error) => {
          console.error('Error al verificar recibo:', error);
          this.tieneRecibo = false;
        }
      });
    }
  }

  navigateToComponent(component: string): void {
    if (!this.tieneRecibo && component !== 'recibo') {
      return; // No navegar si no hay recibo y no es el botón de recibo
    }

    switch (component) {
      case 'recibo':
        if (this.reciboId) {
          // Si ya existe recibo, ir a editar
          this.router.navigate([`/${this.loteId}/${this.reciboId}/recibo/editar/${this.reciboId}`]);
        } else {
          // Si no existe, crear nuevo recibo
          this.router.navigate([`/${this.loteId}/recibo/crear`]);
        }
        break;
      case 'pureza':
        this.router.navigate([`/${this.loteId}/${this.reciboId}/pureza/crear`]);
        break;
      case 'pms':
        this.router.navigate([`/${this.loteId}/${this.reciboId}/pms/crear`]);
        break;
      case 'sanitario':
        this.router.navigate([`/${this.loteId}/${this.reciboId}/sanitario/crear`]);
        break;
      case 'dosn':
        this.router.navigate([`/${this.loteId}/${this.reciboId}/dosn/crear`]);
        break;
      case 'germinacion':
        this.router.navigate([`/${this.loteId}/${this.reciboId}/germinacion/crear`]);
        break;
      case 'tetrazolio':
        this.router.navigate([`/${this.loteId}/${this.reciboId}/tetrazolio/crear`]);
        break;
      case 'pureza-p-notatum':
        this.router.navigate([`/${this.loteId}/${this.reciboId}/pureza-p-notatum/crear`]);
        break;
      default:
        console.log(`Navegación no implementada para: ${component}`);
    }
  }

  isButtonDisabled(component: string): boolean {
    return !this.tieneRecibo && component !== 'recibo';
  }
}
