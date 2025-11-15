import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { AutocompletadoDto } from '../models/Autocompletado.dto';

interface ResponseListadoAutocompletados {
  autocompletados: AutocompletadoDto[];
}

@Injectable({ providedIn: 'root' })
export class AutocompletadoService {
  private endpoint: string = '/autocompletado';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: AutocompletadoDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<ResponseListadoAutocompletados> {
    return this.http.get<ResponseListadoAutocompletados>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  obtener(id: number): Observable<AutocompletadoDto> {
    return this.http.get<AutocompletadoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: AutocompletadoDto): Observable<string> {
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

  obtenerPorParametro(parametro: string): Observable<AutocompletadoDto[]> {
    return this.http.get<AutocompletadoDto[]>(
      `${this.urlService.baseUrl}${this.endpoint}/por-parametro/${parametro}`
    );
  }
}

