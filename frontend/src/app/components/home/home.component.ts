import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/AuthService';
import { MiddlewareService } from '../../../services/MiddlewareService';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private middlewareService = inject(MiddlewareService);
  private messageService = inject(MessageService);

  isExporting = false;
  isImporting = false;

  isObserver: boolean = this.authService.isObservador();

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isAnalista(): boolean {
    return this.authService.isAnalista();
  }

  get canExportImport(): boolean {
    return this.isAdmin || this.isAnalista;
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

  goToListadoAutocompletados() {
    this.router.navigate(['/listado-autocompletados']);
  }

  goToListadoCertificados() {
    this.router.navigate(['/listado-certificados']);
  }

  goToCreateGraficaAnalisis() {
    this.router.navigate(['/grafica-analisis/crear']);
  }

  /**
   * Exporta todas las tablas a Excel
   */
  exportarExcel(): void {
    if (!this.canExportImport) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acceso denegado',
        detail: 'Solo los administradores y analistas pueden exportar datos'
      });
      return;
    }

    this.isExporting = true;
    this.messageService.add({
      severity: 'info',
      summary: 'Exportando',
      detail: 'Iniciando exportación de tablas...'
    });

    this.middlewareService.exportarTablas().subscribe({
      next: (blob: Blob) => {
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'export_tablas.xlsx.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Exportación completada. El archivo se está descargando.'
        });
        this.isExporting = false;
      },
      error: (error) => {
        console.error('Error al exportar:', error);
        let errorMessage = 'Error al exportar las tablas';
        
        if (error.error instanceof Blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const text = reader.result as string;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: text || errorMessage
            });
          };
          reader.readAsText(error.error);
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage
          });
        }
        
        this.isExporting = false;
      }
    });
  }

  /**
   * Navega a la página de importación de Excel
   */
  importarExcel(): void {
    if (!this.canExportImport) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acceso denegado',
        detail: 'Solo los administradores y analistas pueden importar datos'
      });
      return;
    }

    this.router.navigate(['/excel-middleware']);
  }

  /**
   * Navega al componente de gestión de Excel (exportar/importar)
   */
  goToExcelMiddleware(): void {
    if (!this.canExportImport) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acceso denegado',
        detail: 'Solo los administradores y analistas pueden acceder a esta funcionalidad'
      });
      return;
    }

    this.router.navigate(['/excel-middleware']);
  }

}
