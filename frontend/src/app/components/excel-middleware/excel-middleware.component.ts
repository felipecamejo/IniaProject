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
  selectedFiles: File[] = [];
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
   * Verifica si el usuario tiene permisos de ANALISTA
   */
  get isAnalista(): boolean {
    return this.authService.isAnalista();
  }

  /**
   * Verifica si el usuario puede exportar/importar (ADMIN o ANALISTA)
   */
  get canExportImport(): boolean {
    return this.isAdmin || this.isAnalista;
  }

  /**
   * Maneja la selección de archivos (uno o varios)
   */
  onFileSelect(event: any): void {
    const files: File[] = event.files || [];
    if (files.length > 0) {
      // Validar que todos los archivos sean Excel o CSV
      const archivosValidos: File[] = [];
      const archivosInvalidos: string[] = [];
      
      for (const file of files) {
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
          archivosValidos.push(file);
        } else {
          archivosInvalidos.push(file.name);
        }
      }
      
      if (archivosInvalidos.length > 0) {
        this.importError = `Los siguientes archivos no tienen un formato válido: ${archivosInvalidos.join(', ')}. Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)`;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Algunos archivos no tienen un formato válido. Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)`
        });
      }
      
      if (archivosValidos.length > 0) {
        this.selectedFiles = archivosValidos;
        this.importError = null;
        this.importResult = null;
        
        const mensaje = archivosValidos.length === 1 
          ? `Archivo "${archivosValidos[0].name}" listo para importar`
          : `${archivosValidos.length} archivos listos para importar`;
        
        this.messageService.add({
          severity: 'info',
          summary: 'Archivo(s) seleccionado(s)',
          detail: mensaje
        });
      } else {
        this.selectedFiles = [];
      }
    }
  }

  /**
   * Maneja la eliminación de los archivos seleccionados
   */
  onFileRemove(): void {
    this.selectedFiles = [];
    this.importError = null;
    this.importResult = null;
  }

  /**
   * Exporta todas las tablas a Excel
   */
  exportarTablas(): void {
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
   * Importa los archivos seleccionados (uno o varios)
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

    if (this.selectedFiles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor selecciona al menos un archivo Excel o CSV'
      });
      return;
    }

    this.isImporting = true;
    this.importError = null;
    this.importResult = null;

    const mensaje = this.selectedFiles.length === 1
      ? 'Iniciando importación del archivo...'
      : `Iniciando importación de ${this.selectedFiles.length} archivos...`;

    this.messageService.add({
      severity: 'info',
      summary: 'Importando',
      detail: mensaje
    });

    this.middlewareService.importarExcel(this.selectedFiles).subscribe({
      next: (response: any) => {
        // La respuesta puede ser string o un objeto JSON
        if (typeof response === 'string') {
          this.importResult = response;
        } else {
          // Si es un objeto, formatearlo como JSON
          this.importResult = JSON.stringify(response, null, 2);
        }
        
        const mensajeExito = this.selectedFiles.length === 1
          ? 'Archivo importado correctamente'
          : `${this.selectedFiles.length} archivos importados correctamente`;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: mensajeExito
        });
        this.isImporting = false;
        this.selectedFiles = [];
      },
      error: (error) => {
        console.error('Error al importar:', error);
        const errorMessage = typeof error.error === 'string' 
          ? error.error 
          : error.error?.message || 'Error al importar los archivos';
        
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
