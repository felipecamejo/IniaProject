import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GramosPmsDto } from '../models/GramosPms.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from '../services/url.service';
import { HumedadReciboDto } from '../models/HumedadRecibo.dto';

interface ResponseListadoGramosPms {
  gramosPms: GramosPmsDto[];
}

@Injectable({ providedIn: 'root' })
export class GramosPmsService {
  private endpoint: string = '/gramos-pms';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  /**
   * Crea múltiples GramosPms y devuelve un objeto con created[] y errors[]
   */
  crearMultiplesGramos(payload: GramosPmsDto[]): Observable<{ created: GramosPmsDto[]; errors: any[] }> {
    return this.http.post<{ created: GramosPmsDto[]; errors: any[] }>(
      `${this.urlService.baseUrl}${this.endpoint}/crear-multiple`,
      payload
    );
  }


  /**
   * Lista gramos asociados a un PMS (endpoint: /pms/{pmsId})
   */
  listarGramosPorPms(pmsId: number): Observable<GramosPmsDto[]> {
    return this.http.get<any>(
      `${this.urlService.baseUrl}${this.endpoint}/pms/${pmsId}`
    ).pipe(
      map((response: any) => {
        // El backend actualmente devuelve directamente un array JSON.
        // Pero en algunos lugares el frontend esperaba { gramosPms: [...] }.
        // Aceptamos ambos formatos: si es un array, lo devolvemos; si viene envuelto, devolvemos la propiedad.
        if (Array.isArray(response)) {
          return response as GramosPmsDto[];
        }
        if (response && Array.isArray(response.gramosPms)) {
          return response.gramosPms as GramosPmsDto[];
        }
        return [] as GramosPmsDto[];
      })
    );
  }


}
