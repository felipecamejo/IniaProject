import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReciboDto } from '../models/Recibo.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from '../services/url.service';

interface ResponseListadoRecibos {
  recibos: ReciboDto[];
}

@Injectable({ providedIn: 'root' })
export class ReciboService {
  private endpoint: string = '/recibo';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearRecibo(payload: ReciboDto): Observable<ReciboDto> {
    // El backend devuelve el ReciboDto creado (JSON). No usar responseType 'text'.
    return this.http.post<ReciboDto>(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload
    );
  }

  obtenerRecibo(id: number): Observable<ReciboDto> {
    return this.http.get<ReciboDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarRecibo(payload: ReciboDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
    );
  }

  listarPorLote(loteId: number): Observable<ReciboDto[]> {
    return this.http.get<ResponseListadoRecibos>(
      `${this.urlService.baseUrl}${this.endpoint}/listar-por-lote/${loteId}`
    ).pipe(
      map((response: ResponseListadoRecibos) => {
        return response.recibos || [];
      })
    );
  }

  listar(): Observable<ReciboDto[]> {
    return this.http.get<ResponseListadoRecibos>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    ).pipe(
      map((response: ResponseListadoRecibos) => {
        return response.recibos || [];
      })
    );
  }

}
