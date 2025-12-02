import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';

@Injectable({ providedIn: 'root' })
export class MiddlewareService {
  constructor(private http: HttpClient, private url: UrlService) {}

  /**
   * Exporta todas las tablas a Excel
   * @param options Opciones de exportación (análisis IDs, fechas, campo de fecha)
   * @returns Observable con el archivo ZIP como blob
   */
  exportarTablas(options?: {
    analisisIds?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    campoFecha?: string;
    formato?: string;
  }): Observable<Blob> {
    let params = new HttpParams();
    
    if (options?.analisisIds) {
      params = params.set('analisis_ids', options.analisisIds);
    }
    if (options?.fechaDesde) {
      params = params.set('fecha_desde', options.fechaDesde);
    }
    if (options?.fechaHasta) {
      params = params.set('fecha_hasta', options.fechaHasta);
    }
    if (options?.campoFecha) {
      params = params.set('campo_fecha', options.campoFecha);
    }
    if (options?.formato) {
      params = params.set('formato', options.formato);
    }
    
    // Usar /middleware directamente (no /Inia/api/v1) para que el proxy funcione
    return this.http.post(`/middleware/exportar`, {}, {
      responseType: 'blob',
      params: params
    });
  }

  /**
   * Importa uno o varios archivos Excel/CSV a la base de datos
   * @param files Archivo(s) Excel/CSV (.xlsx, .xls o .csv)
   * @returns Observable con la respuesta del servidor
   */
  importarExcel(files: File | File[]): Observable<any> {
    const formData = new FormData();
    
    // Si es un solo archivo, convertirlo a array
    const filesArray = Array.isArray(files) ? files : [files];
    
    // Agregar todos los archivos con el nombre 'files' (el backend espera un array)
    filesArray.forEach(file => {
      formData.append('files', file, file.name);
    });

    // Usar /middleware directamente (no /Inia/api/v1) para que el proxy funcione
    return this.http.post(`/middleware/importar`, formData, {
      responseType: 'json' // Cambiar a json para recibir respuestas estructuradas
    });
  }
}
