import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { PurezaDto } from '../models/Pureza.dto';

interface ResponseListadoPurezas {
  purezas: PurezaDto[];
}

@Injectable({ providedIn: 'root' })
export class PurezaService {
  private endpoint: string = '/pureza';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: PurezaDto): Observable<number> {
    return this.http.post<number>(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload
    );
  }

  listar(id: number): Observable<ResponseListadoPurezas> {
    return this.http.get<ResponseListadoPurezas>(
      `${this.urlService.baseUrl}${this.endpoint}/listar/recibo/${id}`
    );
  }

  listarPorRecibo(reciboId: number): Observable<ResponseListadoPurezas> {
    return this.http.get<ResponseListadoPurezas>(
      `${this.urlService.baseUrl}${this.endpoint}/listar/recibo/${reciboId}`
    );
  }

  obtener(id: number): Observable<PurezaDto> {
    return this.http.get<PurezaDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: PurezaDto): Observable<number> {
    return this.http.put<number>(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload
    );
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      { responseType: 'text' }
    );
  }
}


