import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from './url.service';
import { MetodoDto, ResponseListadoMetodos } from '../models/Metodo.dto';

@Injectable({ providedIn: 'root' })
export class MetodoService {
  private endpoint: string = '/metodo';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: MetodoDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<MetodoDto[]> {
    return this.http
      .get<ResponseListadoMetodos>(`${this.urlService.baseUrl}${this.endpoint}/listar`)
      .pipe(map((r) => r.metodos || []));
  }

  obtener(id: number): Observable<MetodoDto> {
    return this.http.get<MetodoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: MetodoDto): Observable<string> {
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


