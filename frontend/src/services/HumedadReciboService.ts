import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReciboDto } from '../models/Recibo.dto';
import { Observable } from 'rxjs';
import { UrlService } from '../services/url.service';
import { HumedadReciboDto } from '../models/HumedadRecibo.dto';

@Injectable({ providedIn: 'root' })
export class HumedadReciboService {
  private endpoint: string = '/humedadRecibo';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearHumedadRecibo(payload: HumedadReciboDto): Observable<HumedadReciboDto> {
    return this.http.post<HumedadReciboDto>(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload
    );
  }
  
  /**
   * Crea múltiples humedades y devuelve un objeto con created[] y errors[]
   */
  crearHumedadesRecibo(payload: HumedadReciboDto[]): Observable<{ created: HumedadReciboDto[]; errors: any[] }> {
    return this.http.post<{ created: HumedadReciboDto[]; errors: any[] }>(
      `${this.urlService.baseUrl}${this.endpoint}/crear-multiple`,
      payload
    );
  }

  obtenerHumedadRecibo(id: number): Observable<ReciboDto> {
    return this.http.get<ReciboDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarHumedadRecibo(payload: ReciboDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
    );
  }

  eliminarHumedadRecibo(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      {},
      { responseType: 'text' }
    );
  }

  /**
   * Lista humedades asociadas a un recibo (endpoint: /recibo/{reciboId})
   */
  listarHumedadesPorRecibo(reciboId: number): Observable<HumedadReciboDto[]> {
    return this.http.get<HumedadReciboDto[]>(
      `${this.urlService.baseUrl}${this.endpoint}/recibo/${reciboId}`
    );
  }


}
