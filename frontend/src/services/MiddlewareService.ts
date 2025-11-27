import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';

@Injectable({ providedIn: 'root' })
export class MiddlewareService {
  constructor(private http: HttpClient, private url: UrlService) {}

  /**
   * Exporta todas las tablas a Excel
   * @returns Observable con el archivo ZIP como blob
   */
  exportarTablas(): Observable<Blob> {
    // Usar /middleware directamente (no /Inia/api/v1) para que el proxy funcione
    return this.http.post(`/middleware/exportar`, {}, {
      responseType: 'blob'
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
