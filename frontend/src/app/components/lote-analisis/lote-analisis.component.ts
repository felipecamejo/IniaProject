import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ReciboService } from '../../../services/ReciboService';
import { LoteService } from '../../../services/LoteService';
import { LoteDto } from '../../../models/Lote.dto';

@Component({
  selector: 'app-lote-analisis.component',
  imports: [],
  templateUrl: './lote-analisis.component.html',
  styleUrl: './lote-analisis.component.scss'
})
export class LoteAnalisisComponent implements OnInit, OnDestroy {
  loteId: number | null = null;
  reciboId: number | null = null;
  tieneRecibo: boolean = false;
  lote: LoteDto | null = null; // Agregar para mantener info del lote
  private navigationSubscription: any;
  private currentUrl: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reciboService: ReciboService,
    private loteService: LoteService
  ) {}

  ngOnInit(): void {
    // Cargar datos iniciales
    this.cargarDatosIniciales();
    
    // Suscribirse a cambios de navegación para detectar regresos
    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.manejarNavegacion(event.url);
      });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  cargarDatosIniciales(): void {
    this.route.params.subscribe(params => {
      this.loteId = params['loteId'] ? Number(params['loteId']) : null;
      this.reciboId = params['reciboId'] ? Number(params['reciboId']) : null;
      
      console.log('Cargando datos iniciales - LoteId:', this.loteId, 'ReciboId:', this.reciboId);
      
      // Validar que tenemos loteId
      if (!this.validarLote()) {
        return;
      }
      
      // Cargar datos del lote
      this.cargarLote();
      this.verificarRecibosDelLote();
      
      // Si se especificó reciboId, verificar ese recibo específico
      if (this.reciboId) {
        this.verificarRecibo();
      }
    });
  }

  manejarNavegacion(url: string): void {
    // Detectar si se regresó a lote-analisis
    const esLoteAnalisis = url.includes('/lote-analisis');
    const esRegreso = this.currentUrl !== '' && this.currentUrl !== url;
    
    if (esLoteAnalisis && esRegreso) {
      console.log('Regreso detectado a lote-analisis, recargando datos...');
      this.recargarDatos();
    }
    
    this.currentUrl = url;
  }

  cargarLote(): void {
    if (this.loteId) {
      this.loteService.obtenerLote(this.loteId).subscribe({
        next: (lote) => {
          this.lote = lote;
          console.log('Lote cargado:', lote);
        },
        error: (error) => {
          console.error('Error al cargar lote:', error);
          this.lote = null;
        }
      });
    }
  }

  verificarRecibosDelLote(): void {
    if (this.loteId) {
      this.loteService.reciboFromLote(this.loteId).subscribe({
        next: (reciboId: number | null) => {
          console.log('Recibo ID recibido del backend:', reciboId);
          
          if (reciboId !== null && reciboId > 0) {
            this.tieneRecibo = true;
            
            // Si no se especificó reciboId en la ruta, usar el del lote
            if (!this.reciboId) {
              this.reciboId = reciboId;
            }
            
            console.log('Recibo del lote encontrado:', reciboId);
          } else {
            this.tieneRecibo = false;
            console.log('El lote no tiene recibo asociado');
          }
        },
        error: (error: any) => {
          console.error('Error al verificar recibo del lote:', error);
          this.tieneRecibo = false;
        }
      });
    }
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
      // Mostrar mensaje informativo en lugar de simplemente no navegar
      alert('Debe crear un recibo antes de realizar análisis. Haga clic en "Recibo" para crear uno.');
      return;
    }

    switch (component) {
      case 'recibo':
        if (this.reciboId) {
          // Si ya existe recibo, ir a editar
          this.router.navigate([`/${this.loteId}/${this.reciboId}/recibo/editar`]);
        } else {
          // Si no existe, crear nuevo recibo
          this.router.navigate([`/${this.loteId}/recibo/crear`]);
        }
        break;
      case 'pureza':
        if (this.reciboId) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-pureza`]);
        }
        break;
      case 'pms':
        if (this.reciboId) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-pms`]);
        }
        break;
      case 'sanitario':
        if (this.reciboId) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-sanitario`]);
        }
        break;
      case 'dosn':
        if (this.reciboId) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-dosn`]);
        }
        break;
      case 'germinacion':
        if (this.reciboId) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-germinacion`]);
        }
        break;
      case 'tetrazolio':
        if (this.reciboId) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-tetrazolio`]);
        }
        break;
      case 'pureza-p-notatum':
        if (this.reciboId) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-pureza-p-notatum`]);
        }
        break;
      default:
        console.log(`Navegación no implementada para: ${component}`);
    }
  }

  isButtonDisabled(component: string): boolean {
    return !this.tieneRecibo && component !== 'recibo';
  }

  // Método para obtener información del lote actual
  getLoteInfo(): string {
    if (this.lote) {
      return `${this.lote.nombre} - ${this.lote.activo ? 'Activo' : 'Inactivo'}`;
    }
    return this.loteId ? `Lote ID: ${this.loteId}` : 'Lote no identificado';
  }

  // Método para obtener información de recibos
  getRecibosInfo(): string {
    if (!this.tieneRecibo) {
      return 'Sin recibo';
    } else if (this.reciboId) {
      return `Recibo ID: ${this.reciboId}`;
    }
    return 'Verificando recibo...';
  }

  // Método para recargar datos (útil cuando se regresa de crear/editar)
  recargarDatos(): void {
    if (this.loteId) {
      console.log('Recargando datos para lote:', this.loteId);
      this.cargarLote();
      this.verificarRecibosDelLote();
    } else {
      console.warn('No se puede recargar datos: loteId no disponible');
    }
  }

  // Método para validar que el lote existe antes de continuar
  validarLote(): boolean {
    if (!this.loteId) {
      console.error('LoteId no disponible');
      alert('Error: No se pudo identificar el lote. Regresando al listado de lotes.');
      this.router.navigate(['/listado-lotes']);
      return false;
    }
    return true;
  }

  // Método para navegar de vuelta al listado de lotes
  volverAListado(): void {
    this.router.navigate(['/listado-lotes']);
  }

  // Método para manejar el evento de navegación del navegador
  onPopState(): void {
    console.log('Evento popstate detectado, recargando datos...');
    this.recargarDatos();
  }
}
