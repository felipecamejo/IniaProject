import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GramosPmsDto } from '../models/GramosPms.dto';
import { Observable } from 'rxjs';
import { UrlService } from '../services/url.service';
import { HumedadReciboDto } from '../models/HumedadRecibo.dto';

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

  editarMultiplesGramos(payload: GramosPmsDto[]): Observable<{ edited?: GramosPmsDto[]; created?: GramosPmsDto[]; errors?: any[] }> {
    return this.http.put<{ edited?: GramosPmsDto[]; created?: GramosPmsDto[]; errors?: any[] }>(
      `${this.urlService.baseUrl}${this.endpoint}/editar-multiple`,
      payload
    );
  }

  /**
   * Elimina múltiples por id (soft-delete). Backend acepta array de ids en body.
   */
  eliminarMultiplesGramos(ids: number[]): Observable<{ deleted?: number[]; notFound?: number[]; errors?: any[] }> {
    return this.http.request('put', `${this.urlService.baseUrl}${this.endpoint}/eliminar-multiple`, { body: ids }) as Observable<{ deleted?: number[]; notFound?: number[]; errors?: any[] }>;
  }

  /**
   * Lista gramos asociados a un PMS (endpoint: /pms/{pmsId})
   */
  listarGramosPorPms(pmsId: number): Observable<GramosPmsDto[]> {
    return this.http.get<GramosPmsDto[]>(`${this.urlService.baseUrl}${this.endpoint}/pms/${pmsId}`);
  }


}
