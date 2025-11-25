import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { MalezaDto } from '../models/Maleza.dto';

interface ResponseListadoMalezas {
  malezas: MalezaDto[];
}

@Injectable({ providedIn: 'root' })
export class MalezaService {
  private endpoint: string = '/maleza';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: MalezaDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<ResponseListadoMalezas> {
    return this.http.get<ResponseListadoMalezas>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  obtener(id: number): Observable<MalezaDto> {
    return this.http.get<MalezaDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: MalezaDto): Observable<string> {
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
