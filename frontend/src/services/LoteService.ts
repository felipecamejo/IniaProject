import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from './url.service';
import { LoteDto } from '../models/Lote.dto';

interface ResponseListadoLotes {
  lotes: LoteDto[];
}

export interface ResponseListadoLotesPage {
  content: LoteDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class LoteService {
  private endpoint: string = '/lote';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearLote(payload: LoteDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listarLotes(): Observable<ResponseListadoLotes> {
    return this.http.get<ResponseListadoLotes>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  listarLotesPage(params: { page?: number; size?: number; sort?: string; direction?: 'ASC' | 'DESC' }): Observable<ResponseListadoLotesPage> {
    const page = params.page ?? 0;
    const size = params.size ?? 20;
    const sort = params.sort ?? 'fechaCreacion';
    const direction = params.direction ?? 'DESC';
    const url = `${this.urlService.baseUrl}${this.endpoint}/listar-page?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}&direction=${direction}`;
    return this.http.get<ResponseListadoLotesPage>(url);
  }

  obtenerLote(id: number): Observable<LoteDto> {
    return this.http.get<LoteDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarLote(payload: LoteDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
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


