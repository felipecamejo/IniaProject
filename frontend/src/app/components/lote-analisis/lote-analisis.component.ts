import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ReciboService } from '../../../services/ReciboService';
import { LoteService } from '../../../services/LoteService';
import { CertificadoService } from '../../../services/CertificadoService';
import { MiddlewareService } from '../../../services/MiddlewareService';
import { LoteDto } from '../../../models/Lote.dto';
import { ReciboDto } from '../../../models/Recibo.dto';
import { CertificadoDto } from '../../../models/Certificado.dto';
import { AuthService } from '../../../services/AuthService';
// ...existing code...

@Component({
  selector: 'app-lote-analisis.component',
  imports: [CommonModule],
  templateUrl: './lote-analisis.component.html',
  styleUrl: './lote-analisis.component.scss'
})
export class LoteAnalisisComponent implements OnInit, OnDestroy {
  loteId: number | null = null;
  reciboId: number | null = null;
  tieneRecibo: boolean = false;
  tieneAnalisis: boolean = false; // Verificar si hay análisis disponibles
  tieneCertificado: boolean = false; // Verificar si hay certificado creado
  certificadoId: number | null = null; // ID del certificado si existe
  lote: LoteDto | null = null; // Agregar para mantener info del lote
  recibo: ReciboDto | null = null; // Agregar para mantener info del recibo
  private navigationSubscription: any;
  private currentUrl: string = '';


  certificadoAEliminar: CertificadoDto | null = null;
  confirmLoading: boolean = false;

  // Propiedades para quick export
  isExporting: boolean = false;

  isAdmin: boolean = false; 

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reciboService: ReciboService,
    private loteService: LoteService,
    private certificadoService: CertificadoService,
    private middlewareService: MiddlewareService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Cargar datos iniciales
    this.isAdmin = this.authService.isAdmin();
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
      } else {
        // Si no hay reciboId pero hay recibo del lote, verificar después de obtenerlo
        // Esto se maneja en verificarRecibosDelLote
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
          // Si el error es 404, redirigir a home
          if (error && error.status === 404) {
            alert('El lote no existe o fue eliminado. Redirigiendo a la página principal.');
            this.router.navigate(['/home']);
          }
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
            // NO establecer tieneRecibo aquí, esperar a verificarRecibo()
            // para confirmar que el recibo existe y está activo
            
            // Si no se especificó reciboId en la ruta, usar el del lote
            if (!this.reciboId) {
              this.reciboId = reciboId;
            }
            
            console.log('Recibo del lote encontrado:', reciboId);
            
            // Verificar el recibo y sus análisis
            // verificarRecibo() establecerá tieneRecibo basado en si el recibo existe y está activo
            if (this.reciboId) {
              this.verificarRecibo();
            }
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
          this.recibo = recibo;
          
          // El backend ya filtra recibos activos en obtenerReciboPorId,
          // pero verificamos doblemente que el recibo existe y está activo
          if (recibo) {
            this.tieneRecibo = recibo.activo === true;
            console.log('Recibo verificado:', {
              id: recibo.id,
              activo: recibo.activo,
              tieneRecibo: this.tieneRecibo
            });
          } else {
            // Si el backend devuelve null, el recibo no existe o está inactivo
            this.tieneRecibo = false;
            console.warn('El recibo no existe o está inactivo. ReciboId:', this.reciboId);
          }
          
          // Verificar si hay análisis disponibles
          this.verificarAnalisisDisponibles(recibo);
          // Verificar si hay certificado creado
          this.verificarCertificado();
        },
        error: (error) => {
          console.error('Error al verificar recibo:', error);
          alert('Error: No se pudo identificar el recibo. Corrigiendo url.');
          this.router.navigate([`/${this.loteId}/0/lote-analisis`]);
          this.tieneRecibo = false;
          this.tieneAnalisis = false;
          this.tieneCertificado = false;
        }
      });
    }
  }

  verificarCertificado(): void {
    if (this.reciboId && this.isAdmin) {
      this.certificadoService.listarPorRecibo(this.reciboId).subscribe({
        next: (certificados: CertificadoDto[]) => {
          if (certificados && certificados.length > 0) {
            // Tomar el primer certificado activo
            const certificadoActivo = certificados.find(c => c.activo);
            if (certificadoActivo && certificadoActivo.id) {
              this.tieneCertificado = true;
              this.certificadoId = certificadoActivo.id;
            } else {
              this.tieneCertificado = false;
              this.certificadoId = null;
            }
          } else {
            this.tieneCertificado = false;
            this.certificadoId = null;
          }
        },
        error: (error) => {
          console.error('Error al verificar certificado:', error);
          this.tieneCertificado = false;
          this.certificadoId = null;
        }
      });
    }
  }

  verificarCertificadoAntesDeCrear(): void {
    if (!this.reciboId) {
      this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/crear`]);
      return;
    }

    this.certificadoService.listarPorRecibo(this.reciboId).subscribe({
      next: (certificados: CertificadoDto[]) => {
        if (certificados && certificados.length > 0) {
          const certificadoActivo = certificados.find(c => c.activo);
          if (certificadoActivo && certificadoActivo.id) {
            // Ya existe un certificado, redirigir a editar
            this.tieneCertificado = true;
            this.certificadoId = certificadoActivo.id;
            this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/editar/${certificadoActivo.id}`]);
          } else {
            // No hay certificado activo, permitir crear
            this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/crear`]);
          }
        } else {
          // No hay certificados, permitir crear
          this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/crear`]);
        }
      },
      error: (error) => {
        console.error('Error verificando certificado antes de crear:', error);
        // En caso de error, permitir crear
        this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/crear`]);
      }
    });
  }

  verificarAnalisisDisponibles(recibo: ReciboDto): void {
    if (!recibo) {
      this.tieneAnalisis = false;
      return;
    }

    // Verificar si hay algún análisis disponible
    const tieneDosn = !!(recibo.dosnAnalisisId && recibo.dosnAnalisisId.length > 0);
    const tienePms = !!(recibo.pmsAnalisisId && recibo.pmsAnalisisId.length > 0);
    const tienePureza = !!(recibo.purezaAnalisisId && recibo.purezaAnalisisId.length > 0);
    const tieneGerminacion = !!(recibo.germinacionAnalisisId && recibo.germinacionAnalisisId.length > 0);
    const tienePurezaPNotatum = !!(recibo.purezaPNotatumAnalisisId && recibo.purezaPNotatumAnalisisId.length > 0);
    const tieneSanitario = !!(recibo.sanitarioAnalisisId && recibo.sanitarioAnalisisId.length > 0);
    const tieneTetrazolio = !!(recibo.tetrazolioAnalisisId && recibo.tetrazolioAnalisisId.length > 0);

    // Si hay al menos un análisis disponible, habilitar el botón de certificado
    this.tieneAnalisis = tieneDosn || tienePms || tienePureza || tieneGerminacion || 
                         tienePurezaPNotatum || tieneSanitario || tieneTetrazolio;

    console.log('Análisis disponibles:', {
      dosn: tieneDosn,
      pms: tienePms,
      pureza: tienePureza,
      germinacion: tieneGerminacion,
      purezaPNotatum: tienePurezaPNotatum,
      sanitario: tieneSanitario,
      tetrazolio: tieneTetrazolio,
      tieneAnalisis: this.tieneAnalisis
    });
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
      case 'certificado':
        if (this.reciboId && this.tieneAnalisis) {
          // Si ya existe certificado, ir a editar; si no, crear nuevo
          if (this.tieneCertificado && this.certificadoId) {
            this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/editar/${this.certificadoId}`]);
          } else {
            // Verificar si ya existe un certificado antes de crear
            this.verificarCertificadoAntesDeCrear();
          }
        } else if (!this.tieneAnalisis) {
          alert('Debe tener al menos un análisis disponible para crear un certificado.');
        }
        break;
      default:
        console.log(`Navegación no implementada para: ${component}`);
    }
  }

  verCertificado(): void {
    if (this.reciboId && this.tieneCertificado && this.certificadoId) {
      // Navegar a visualización del certificado
      this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/${this.certificadoId}`], {
        queryParams: { view: 'true' }
      });
    } else {
      alert('No hay certificado disponible para visualizar.');
    }
  }

  descargarCertificado(): void {
    if (this.reciboId && this.tieneCertificado && this.certificadoId) {
      // Por ahora, navegar a visualización. La descarga PDF se implementará después
      this.verCertificado();
      // TODO: Implementar descarga PDF del certificado
      // this.certificadoService.descargarPDF(this.certificadoId).subscribe(...)
    } else {
      alert('No hay certificado disponible para descargar.');
    }
  }

  eliminarCertificado(): void {
    if (!this.reciboId || !this.tieneCertificado || !this.certificadoId) {
      alert('No hay certificado disponible para eliminar.');
      return;
    }
    // Cargar el certificado para mostrar su información en el popup
    this.certificadoService.obtenerCertificado(this.certificadoId).subscribe({
      next: (certificado: CertificadoDto) => {
        this.certificadoAEliminar = certificado;
      },
      error: (error) => {
        console.error('Error cargando certificado:', error);
        alert('Error al cargar el certificado. Por favor, intente nuevamente.');
      }
    });
  }

  confirmarEliminacion(): void {
    if (!this.certificadoAEliminar || !this.certificadoAEliminar.id) return;
    
    this.confirmLoading = true;
    const certificadoId = this.certificadoAEliminar.id;

    this.certificadoService.eliminarCertificado(certificadoId).subscribe({
      next: (mensaje: string) => {
        console.log('Certificado eliminado:', mensaje);
        this.confirmLoading = false;
        this.certificadoAEliminar = null;
        // Actualizar estado local
        this.tieneCertificado = false;
        this.certificadoId = null;
        // Recargar datos para actualizar la UI
        this.verificarCertificado();
      },
      error: (error) => {
        console.error('Error eliminando certificado:', error);
        this.confirmLoading = false;
        this.certificadoAEliminar = null;
        alert('Error al eliminar el certificado. Por favor, intente nuevamente.');
      }
    });
  }

  cancelarEliminacion(): void {
    this.certificadoAEliminar = null;
    this.confirmLoading = false;
  }

  isButtonDisabled(component: string): boolean {
    if (component === 'recibo') {
      return false; // El botón de recibo nunca está deshabilitado
    }
    if (component === 'certificado') {
      // El botón de certificado está deshabilitado si:
      // - No hay recibo
      // - No hay análisis
      // NOTA: No se deshabilita si ya existe certificado, porque permite editar
      return !this.tieneRecibo || !this.tieneAnalisis;
    }
    // Para los demás análisis, solo se requiere tener recibo
    return !this.tieneRecibo;
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
      // Si hay reciboId, verificar el recibo y sus análisis
      if (this.reciboId) {
        this.verificarRecibo();
        // Verificar certificado también
        this.verificarCertificado();
      }
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

  goToListadoLogs() {
    this.router.navigate([`${this.loteId}/${this.reciboId}/listado-logs`]);
  }

  quickExport(): void {
    if (!this.loteId) {
      alert('Error: No se pudo identificar el lote para exportar.');
      return;
    }

    if (this.isExporting) {
      return;
    }

    this.isExporting = true;

    this.middlewareService.exportarAnalisisPorLote(this.loteId, 'xlsx').subscribe({
      next: (blob: Blob) => {
        if (blob.size === 0) {
          alert('El archivo generado está vacío. No se encontraron análisis para exportar.');
          this.isExporting = false;
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lote_${this.loteId}_export.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.isExporting = false;
      },
      error: (error) => {
        console.error('Error al exportar análisis del lote:', error);
        let errorMessage = 'Error al exportar los análisis del lote';
        
        if (error.error instanceof Blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const text = reader.result as string;
            try {
              const jsonError = JSON.parse(text);
              errorMessage = jsonError.mensaje || errorMessage;
              if (jsonError.detalles) {
                errorMessage += '\n\nDetalles: ' + jsonError.detalles;
              }
            } catch {
              errorMessage = text || errorMessage;
            }
            alert(errorMessage);
            this.isExporting = false;
          };
          reader.readAsText(error.error);
        } else {
          if (error.status === 404) {
            errorMessage = 'No se encontraron análisis asociados a este lote.';
          } else if (error.status === 0) {
            errorMessage = 'Error de conexión. Verifique que el servidor esté ejecutándose.';
          }
          alert(errorMessage);
          this.isExporting = false;
        }
      }
    });
  }
}
