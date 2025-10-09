import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReciboDto } from '../models/Recibo.dto';
import { Observable } from 'rxjs';
import { UrlService } from '../services/url.service';

@Injectable({ providedIn: 'root' })
export class ReciboService {
  private endpoint: string = '/recibo';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearRecibo(payload: ReciboDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  obtenerRecibo(id: number): Observable<ReciboDto> {
    return this.http.get<ReciboDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarRecibo(payload: ReciboDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
    );
  }

  eliminarRecibo(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      {},
      { responseType: 'text' }
    );
  }


}
