import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { MiddlewareService } from '../../../services/MiddlewareService';
import { AuthService } from '../../../services/AuthService';

@Component({
  selector: 'app-excel-middleware',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    FileUploadModule,
    MessageModule,
    ProgressSpinnerModule,
    ToastModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './excel-middleware.component.html',
  styleUrls: ['./excel-middleware.component.scss']
})
export class ExcelMiddlewareComponent {
  selectedFile: File | null = null;
  isExporting = false;
  isImporting = false;
  importResult: string | null = null;
  importError: string | null = null;

  constructor(
    private middlewareService: MiddlewareService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  /**
   * Verifica si el usuario tiene permisos de ADMIN
   */
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Maneja la selección de archivo
   */
  onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      // Validar que sea un archivo Excel
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        this.selectedFile = file;
        this.importError = null;
        this.importResult = null;
        this.messageService.add({
          severity: 'info',
          summary: 'Archivo seleccionado',
          detail: `Archivo "${file.name}" listo para importar`
        });
      } else {
        this.selectedFile = null;
        this.importError = 'Solo se permiten archivos Excel (.xlsx o .xls)';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Solo se permiten archivos Excel (.xlsx o .xls)'
        });
      }
    }
  }

  /**
   * Maneja la eliminación del archivo seleccionado
   */
  onFileRemove(): void {
    this.selectedFile = null;
    this.importError = null;
    this.importResult = null;
  }

  /**
   * Exporta todas las tablas a Excel
   */
  exportarTablas(): void {
    if (!this.isAdmin) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acceso denegado',
        detail: 'Solo los administradores pueden exportar datos'
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
          // Si el error viene como Blob, intentar leerlo como texto
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
   * Importa el archivo Excel seleccionado
   */
  importarExcel(): void {
    if (!this.isAdmin) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acceso denegado',
        detail: 'Solo los administradores pueden importar datos'
      });
      return;
    }

    if (!this.selectedFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor selecciona un archivo Excel'
      });
      return;
    }

    this.isImporting = true;
    this.importError = null;
    this.importResult = null;

    this.messageService.add({
      severity: 'info',
      summary: 'Importando',
      detail: 'Iniciando importación del archivo...'
    });

    this.middlewareService.importarExcel(this.selectedFile).subscribe({
      next: (response: string) => {
        this.importResult = response;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Archivo importado correctamente'
        });
        this.isImporting = false;
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Error al importar:', error);
        const errorMessage = typeof error.error === 'string' 
          ? error.error 
          : error.error?.message || 'Error al importar el archivo';
        
        this.importError = errorMessage;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.isImporting = false;
      }
    });
  }
}
