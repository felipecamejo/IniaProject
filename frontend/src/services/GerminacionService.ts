import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { GerminacionDto } from '../models/Germinacion.dto';

interface ResponseListadoGerminacion {
  germinacion: GerminacionDto[];
}

@Injectable({ providedIn: 'root' })
export class GerminacionService {
  private endpoint: string = '/germinacion';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: GerminacionDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<ResponseListadoGerminacion> {
    return this.http.get<ResponseListadoGerminacion>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  listarPorRecibo(reciboId: number): Observable<ResponseListadoGerminacion> {
    return this.http.get<ResponseListadoGerminacion>(
      `${this.urlService.baseUrl}${this.endpoint}/listar/recibo/${reciboId}`
    );
  }

  obtener(id: number): Observable<GerminacionDto> {
    return this.http.get<GerminacionDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: GerminacionDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
    );
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      { responseType: 'text' }
    );
  }
}


