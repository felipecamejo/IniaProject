import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { CultivoDto } from '../models/Cultivo.dto';

interface ResponseListadoCultivos {
  cultivos: CultivoDto[];
}

@Injectable({ providedIn: 'root' })
export class CultivoService {
  private endpoint: string = '/cultivo';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: CultivoDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<ResponseListadoCultivos> {
    return this.http.get<ResponseListadoCultivos>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  obtener(id: number): Observable<CultivoDto> {
    return this.http.get<CultivoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: CultivoDto): Observable<string> {
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
