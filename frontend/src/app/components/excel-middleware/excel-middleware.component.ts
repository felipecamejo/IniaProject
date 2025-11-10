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
  exportResult: string | null = null;
  exportError: string | null = null;

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
    // Limpiar resultados anteriores
    this.exportResult = null;
    this.exportError = null;

    this.middlewareService.exportarTablas().subscribe({
      next: (blob: Blob) => {
        // Verificar que el blob no esté vacío
        if (blob.size === 0) {
          this.exportError = 'El archivo generado está vacío. No se exportaron tablas.';
          // Toast opcional (se puede comentar si solo se quiere mostrar en el panel)
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: this.exportError
          // });
          this.isExporting = false;
          return;
        }

        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'export_tablas.xlsx.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Mostrar resultado exitoso en el panel
        const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        this.exportResult = `Exportación completada exitosamente.\n\nArchivo generado: export_tablas.xlsx.zip\nTamaño: ${fileSizeMB} MB\n\nEl archivo se ha descargado automáticamente.`;
        
        // Toast opcional (se puede comentar si solo se quiere mostrar en el panel)
        // this.messageService.add({
        //   severity: 'success',
        //   summary: 'Éxito',
        //   detail: 'Exportación completada. El archivo se está descargando.'
        // });
        this.isExporting = false;
      },
      error: (error) => {
        console.error('Error al exportar:', error);
        let errorMessage = 'Error al exportar las tablas';
        let errorDetails = '';
        
        if (error.error instanceof Blob) {
          // Si el error viene como Blob, intentar leerlo como texto (puede ser JSON)
          const reader = new FileReader();
          reader.onloadend = () => {
            const text = reader.result as string;
            try {
              // Intentar parsear como JSON
              const jsonError = JSON.parse(text);
              if (jsonError.mensaje) {
                errorMessage = jsonError.mensaje;
              }
              if (jsonError.detalles) {
                errorDetails = jsonError.detalles;
              }
              this.exportError = `${errorMessage}${errorDetails ? '\n\nDetalles: ' + errorDetails : ''}`;
            } catch {
              // Si no es JSON, usar el texto directamente
              this.exportError = text || errorMessage;
            }
            // Toast opcional (se puede comentar si solo se quiere mostrar en el panel)
            // this.messageService.add({
            //   severity: 'error',
            //   summary: 'Error',
            //   detail: errorMessage
            // });
            this.isExporting = false;
          };
          reader.readAsText(error.error);
        } else if (error.error && typeof error.error === 'object') {
          // Si es un objeto de error estructurado
          if (error.error.mensaje) {
            errorMessage = error.error.mensaje;
          }
          if (error.error.detalles) {
            errorDetails = error.error.detalles;
          }
          this.exportError = `${errorMessage}${errorDetails ? '\n\nDetalles: ' + errorDetails : ''}`;
          // Toast opcional (se puede comentar si solo se quiere mostrar en el panel)
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: errorMessage
          // });
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
          this.exportError = errorMessage;
          // Toast opcional (se puede comentar si solo se quiere mostrar en el panel)
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: errorMessage
          // });
        } else {
          // Error genérico
          if (error.status === 0) {
            errorMessage = 'Error de conexión. Verifique que el servidor esté ejecutándose.';
            errorDetails = 'No se pudo conectar al servidor. Asegúrese de que el servidor Python esté ejecutándose en http://localhost:9099.';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor durante la exportación.';
            errorDetails = error.message || 'Error desconocido del servidor.';
          } else {
            errorMessage = `Error al exportar: ${error.message || 'Error desconocido'}`;
          }
          this.exportError = `${errorMessage}${errorDetails ? '\n\nDetalles: ' + errorDetails : ''}`;
          // Toast opcional (se puede comentar si solo se quiere mostrar en el panel)
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: errorMessage
          // });
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

    // Limpiar resultados anteriores
    this.importResult = null;
    this.importError = null;
    
    // Toast opcional (se puede comentar si solo se quiere mostrar en el panel)
    // this.messageService.add({
    //   severity: 'info',
    //   summary: 'Importando',
    //   detail: mensaje
    // });

    this.middlewareService.importarExcel(this.selectedFiles).subscribe({
      next: (response: any) => {
        // La respuesta puede ser string o un objeto JSON (MiddlewareResponse)
        let resultMessage = '';
        
        if (typeof response === 'string') {
          resultMessage = response;
        } else if (response && typeof response === 'object') {
          // Si es un objeto MiddlewareResponse
          if (response.exitoso !== undefined) {
            // Construir mensaje detallado
            const partes: string[] = [];
            if (response.mensaje) {
              partes.push(`Estado: ${response.mensaje}`);
            }
            if (response.detalles) {
              partes.push(`\nDetalles: ${response.detalles}`);
            }
            if (response.insertados !== undefined) {
              partes.push(`\nRegistros insertados: ${response.insertados}`);
            }
            if (response.actualizados !== undefined) {
              partes.push(`\nRegistros actualizados: ${response.actualizados}`);
            }
            if (response.tabla) {
              partes.push(`\nTabla: ${response.tabla}`);
            }
            if (response.archivo) {
              partes.push(`\nArchivo: ${response.archivo}`);
            }
            resultMessage = partes.join('\n');
          } else {
            // Si no tiene estructura conocida, formatear como JSON
            resultMessage = JSON.stringify(response, null, 2);
          }
        } else {
          resultMessage = 'Importación completada exitosamente.';
        }
        
        this.importResult = resultMessage;
        this.importError = null;
        
        const mensajeExito = this.selectedFiles.length === 1
          ? 'Archivo importado correctamente'
          : `${this.selectedFiles.length} archivos importados correctamente`;
        
        // Toast opcional (se puede comentar si solo se quiere mostrar en el panel)
        // this.messageService.add({
        //   severity: 'success',
        //   summary: 'Éxito',
        //   detail: mensajeExito
        // });
        this.isImporting = false;
        this.selectedFiles = [];
      },
      error: (error) => {
        console.error('Error al importar:', error);
        let errorMessage = 'Error al importar los archivos';
        let errorDetails = '';
        
        if (error.error && typeof error.error === 'object') {
          // Si es un objeto de error estructurado (MiddlewareResponse)
          if (error.error.mensaje) {
            errorMessage = error.error.mensaje;
          }
          if (error.error.detalles) {
            errorDetails = error.error.detalles;
          }
          this.importError = `${errorMessage}${errorDetails ? '\n\nDetalles: ' + errorDetails : ''}`;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
          this.importError = errorMessage;
        } else {
          // Error genérico
          if (error.status === 0) {
            errorMessage = 'Error de conexión. Verifique que el servidor esté ejecutándose.';
            errorDetails = 'No se pudo conectar al servidor. Asegúrese de que el servidor Python esté ejecutándose en http://localhost:9099.';
          } else if (error.status === 400) {
            errorMessage = 'Error en la solicitud. Verifique los archivos seleccionados.';
            errorDetails = error.message || 'Los archivos pueden tener un formato incorrecto o datos inválidos.';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor durante la importación.';
            errorDetails = error.message || 'Error desconocido del servidor.';
          } else {
            errorMessage = `Error al importar: ${error.message || 'Error desconocido'}`;
          }
          this.importError = `${errorMessage}${errorDetails ? '\n\nDetalles: ' + errorDetails : ''}`;
        }
        
        this.importResult = null;
        // Toast opcional (se puede comentar si solo se quiere mostrar en el panel)
        // this.messageService.add({
        //   severity: 'error',
        //   summary: 'Error',
        //   detail: errorMessage
        // });
        this.isImporting = false;
      }
    });
  }
}
