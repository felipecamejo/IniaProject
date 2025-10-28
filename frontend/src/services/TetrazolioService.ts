import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { TetrazolioDto } from '../models/Tetrazolio.dto';

interface ResponseListadoTetrazolio {
  tetrazolio: TetrazolioDto[];
}

@Injectable({ providedIn: 'root' })
export class TetrazolioService {
  private endpoint: string = '/Tetrazolio';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: TetrazolioDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<ResponseListadoTetrazolio> {
    return this.http.get<ResponseListadoTetrazolio>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  listarPorRecibo(reciboId: number): Observable<ResponseListadoTetrazolio> {
    return this.http.get<ResponseListadoTetrazolio>(
      `${this.urlService.baseUrl}${this.endpoint}/listar/recibo/${reciboId}`
    );
  }

  obtener(id: number): Observable<TetrazolioDto> {
    return this.http.get<TetrazolioDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: TetrazolioDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
    );
  }

  eliminar(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      {},
      { responseType: 'text' }
    );
  }
}


