import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReciboDto } from '../models/Recibo.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from '../services/url.service';
import { HumedadReciboDto } from '../models/HumedadRecibo.dto';

interface ResponseListadoHumedadRecibo {
  humedadRecibo: HumedadReciboDto[];
}

@Injectable({ providedIn: 'root' })
export class HumedadReciboService {
  private endpoint: string = '/humedadRecibo';

  constructor(private http: HttpClient, private urlService: UrlService) {}
  
  /**
   * Actualiza múltiples humedades y devuelve un objeto con created[] y errors[]
   */
  HumedadesRecibo(reciboId: number, payload: HumedadReciboDto[]): Observable<{ created: HumedadReciboDto[]; errors: any[] }> {
    return this.http.put<{ created: HumedadReciboDto[]; errors: any[] }>(
      `${this.urlService.baseUrl}${this.endpoint}/actualizar-humedades/${reciboId}`,
      payload
    );
  }

  /**
   * Elimina múltiples humedades por id. Backend debe implementar /eliminar-multiple
   * y aceptar un array de ids en el body.
   */
  eliminarHumedadesRecibo(ids: number[]): Observable<string> {
    return this.http.request('put', `${this.urlService.baseUrl}${this.endpoint}/eliminar-multiple`, { body: ids, responseType: 'text' });
  }

  /**
   * Lista humedades asociadas a un recibo (endpoint: /recibo/{reciboId})
   */
  listarHumedadesPorRecibo(reciboId: number): Observable<HumedadReciboDto[]> {
    return this.http.get<any>(
      `${this.urlService.baseUrl}${this.endpoint}/recibo/${reciboId}`
    ).pipe(
      map((response: any) => {
        console.log('🔍 Respuesta RAW del backend para humedades:', response);
        console.log('🔍 Tipo de respuesta:', typeof response);
        console.log('🔍 Es array?:', Array.isArray(response));
        
        // Si la respuesta es directamente un array
        if (Array.isArray(response)) {
          console.log('✅ Respuesta es array directo, longitud:', response.length);
          return response as HumedadReciboDto[];
        }
        
        // Si la respuesta es un objeto con la propiedad humedadRecibo
        if (response && response.humedadRecibo) {
          console.log('✅ Respuesta tiene propiedad humedadRecibo, longitud:', response.humedadRecibo.length);
          return response.humedadRecibo as HumedadReciboDto[];
        }
        
        console.warn('⚠️ Formato de respuesta no reconocido, devolviendo array vacío');
        return [];
      })
    );
  }


}
