import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';

@Injectable({ providedIn: 'root' })
export class MiddlewareService {
  private endpoint = '/pandmiddleware';

  constructor(private http: HttpClient, private url: UrlService) {}

  /**
   * Exporta todas las tablas a Excel
   * @returns Observable con el archivo ZIP como blob
   */
  exportarTablas(): Observable<Blob> {
    return this.http.post(`${this.url.baseUrl}${this.endpoint}/http/exportar`, {}, {
      responseType: 'blob'
    });
  }

  /**
   * Importa un archivo Excel a la base de datos
   * @param file Archivo Excel (.xlsx o .xls)
   * @returns Observable con la respuesta del servidor
   */
  importarExcel(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.url.baseUrl}${this.endpoint}/http/importar`, formData, {
      responseType: 'text'
    });
  }
}
