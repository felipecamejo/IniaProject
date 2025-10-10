import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from './url.service';
import { CultivoDto } from '../models/Cultivo.dto';

interface ResponseListadoCultivos {
  cultivos: CultivoDto[];
}

@Injectable({ providedIn: 'root' })
export class CultivoService {
  private endpoint: string = '/cultivo';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearCultivo(payload: CultivoDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listarCultivos(): Observable<CultivoDto[]> {
    return this.http.get<any>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    ).pipe(
      map((response: any) => {
        // Si la respuesta tiene la estructura {cultivos: Array}
        if (response && response.cultivos && Array.isArray(response.cultivos)) {
          return response.cultivos;
        }
        // Si la respuesta es directamente un array
        if (Array.isArray(response)) {
          return response;
        }
        // Fallback a array vacío si la estructura es inesperada
        console.warn('Estructura de respuesta inesperada en listarCultivos:', response);
        return [];
      })
    );
  }

  obtenerCultivo(id: number): Observable<CultivoDto> {
    return this.http.get<CultivoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarCultivo(payload: CultivoDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
    );
  }

  eliminarCultivo(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      {},
      { responseType: 'text' }
    );
  }

  // Métodos legacy para compatibilidad (deprecated)
  /** @deprecated Use crearCultivo instead */
  crear(payload: CultivoDto): Observable<string> {
    return this.crearCultivo(payload);
  }

  /** @deprecated Use listarCultivos instead */
  listar(): Observable<ResponseListadoCultivos> {
    return this.http.get<ResponseListadoCultivos>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  /** @deprecated Use obtenerCultivo instead */
  obtener(id: number): Observable<CultivoDto> {
    return this.obtenerCultivo(id);
  }

  /** @deprecated Use editarCultivo instead */
  editar(payload: CultivoDto): Observable<string> {
    return this.editarCultivo(payload);
  }

  /** @deprecated Use eliminarCultivo instead */
  eliminar(id: number): Observable<string> {
    return this.eliminarCultivo(id);
  }
}
