import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { HongoDto } from '../models/Hongo.dto';

interface ResponseListadoHongos {
  hongos: HongoDto[];
}

@Injectable({ providedIn: 'root' })
export class HongoService {
  private endpoint: string = '/hongo';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: HongoDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<ResponseListadoHongos> {
    return this.http.get<ResponseListadoHongos>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  obtener(id: number): Observable<HongoDto> {
    return this.http.get<HongoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: HongoDto): Observable<string> {
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
