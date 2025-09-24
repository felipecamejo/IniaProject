import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { PurezaPNotatumDto } from '../models/PurezaPNotatum.dto';

interface ResponseListadoPurezaPNotatum {
  purezaPNotatun: PurezaPNotatumDto[];
}

@Injectable({ providedIn: 'root' })
export class PurezaPNotatumService {
  private endpoint: string = '/PurezaPNotatum';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: PurezaPNotatumDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<ResponseListadoPurezaPNotatum> {
    return this.http.get<ResponseListadoPurezaPNotatum>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  obtener(id: number): Observable<PurezaPNotatumDto> {
    return this.http.get<PurezaPNotatumDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: PurezaPNotatumDto): Observable<string> {
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


