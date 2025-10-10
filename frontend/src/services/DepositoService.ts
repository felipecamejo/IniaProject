import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DepositoDto } from '../models/Deposito.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from '../services/url.service';

@Injectable({ providedIn: 'root' })
export class DepositoService {
  private endpoint: string = '/deposito';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearDeposito(payload: DepositoDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  obtenerDeposito(id: number): Observable<DepositoDto> {
    return this.http.get<DepositoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarDeposito(payload: DepositoDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
    );
  }

  eliminarDeposito(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      {},
      { responseType: 'text' }
    );
  }

  listarDepositos(): Observable<DepositoDto[]> {
    return this.http.get<any>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    ).pipe(
      map((response: any) => {
        // Si la respuesta tiene la estructura {depositos: Array}
        if (response && response.depositos && Array.isArray(response.depositos)) {
          return response.depositos;
        }
        // Si la respuesta es directamente un array
        if (Array.isArray(response)) {
          return response;
        }
        // Fallback a array vacío si la estructura es inesperada
        console.warn('Estructura de respuesta inesperada en listarDepositos:', response);
        return [];
      })
    );
  }
}
