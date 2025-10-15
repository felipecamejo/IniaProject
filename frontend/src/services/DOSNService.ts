import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { DOSNDto } from '../models/DOSN.dto';

interface ResponseListadoDOSN {
  DOSN: DOSNDto[];
}

@Injectable({ providedIn: 'root' })
export class DOSNService {
  private endpoint: string = '/dosn';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: DOSNDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<ResponseListadoDOSN> {
    return this.http.get<ResponseListadoDOSN>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  listarPorRecibo(reciboId: number): Observable<ResponseListadoDOSN> {
    return this.http.get<ResponseListadoDOSN>(
      `${this.urlService.baseUrl}${this.endpoint}/listar/recibo/${reciboId}`
    );
  }

  obtener(id: number): Observable<DOSNDto> {
    return this.http.get<DOSNDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: DOSNDto): Observable<string> {
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


