import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { PMSDto } from '../models/PMS.dto';

interface ResponseListadoPMS {
  pms: PMSDto[];
}

@Injectable({ providedIn: 'root' })
export class PMSService {
  private endpoint: string = '/pms';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: PMSDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(reciboId: number): Observable<PMSDto[]> {
    return this.http.get<PMSDto[]>(
      `${this.urlService.baseUrl}${this.endpoint}/listar/recibo/${reciboId}`
    );
  }

  listarPorRecibo(reciboId: number): Observable<ResponseListadoPMS> {
    return this.http.get<ResponseListadoPMS>(
      `${this.urlService.baseUrl}${this.endpoint}/listar/recibo/${reciboId}`
    );
  }

  obtener(id: number): Observable<PMSDto> {
    return this.http.get<PMSDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: PMSDto): Observable<string> {
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


