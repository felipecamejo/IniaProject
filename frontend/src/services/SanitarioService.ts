import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { SanitarioDto } from '../models/Sanitario.dto';

interface ResponseListadoSanitario {
  sanitario: SanitarioDto[];
}

@Injectable({ providedIn: 'root' })
export class SanitarioService {
  private endpoint: string = '/Sanitario';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: SanitarioDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<ResponseListadoSanitario> {
    return this.http.get<ResponseListadoSanitario>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  obtener(id: number): Observable<SanitarioDto> {
    return this.http.get<SanitarioDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: SanitarioDto): Observable<string> {
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


