import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { LoteDto } from '../models/Lote.dto';

interface ResponseListadoLotes {
  lotes: LoteDto[];
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
}


