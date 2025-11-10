import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from './url.service';
import { LoteDto } from '../models/Lote.dto';

interface ResponseListadoLotes {
  lotes: LoteDto[];
}

@Injectable({ providedIn: 'root' })
export class LoteService {
  private endpoint: string = '/lote';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearLote(payload: LoteDto): Observable<number> {
    return this.http.post<number>(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
    );
  }

  listarLotes(): Observable<ResponseListadoLotes> {
    return this.http.get<ResponseListadoLotes>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  obtenerLote(id: number): Observable<LoteDto> {
    return this.http.get<LoteDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarLote(payload: LoteDto): Observable<number> {
    return this.http.put<number>(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload
    );
  }

  eliminarLote(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      {},
      { responseType: 'text' }
    );
  }

  reciboFromLote(loteId: number): Observable<number | null> {
    return this.http.get(
      `${this.urlService.baseUrl}${this.endpoint}/recibo/${loteId}`,
      { responseType: 'text' }
    ).pipe(
      map((response: string) => {
        // Si el backend devuelve literalmente "null" como texto
        if (response === 'null' || response === null || response === undefined || response.trim() === '') {
          return null;
        }
        
        const reciboId = parseInt(response, 10);
        return isNaN(reciboId) ? null : reciboId;
      })
    );
  }

  verificarAsociacionReciboLote(loteId: number, reciboId: number): Observable<boolean> {
    return this.http.get(
      `${this.urlService.baseUrl}${this.endpoint}/verificar-asociacion/${loteId}/${reciboId}`,
      { responseType: 'text' }
    ).pipe(
      map((response: string) => {
        console.log('Respuesta de verificación de asociación:', response);
        // Si la respuesta contiene "Asociación correcta", es true
        return response.includes('Asociación correcta');
      })
    );
  }
}


