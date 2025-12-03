import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from './url.service';
import { EspecieDto } from '../models/Especie.dto';

interface ReponseListadoEspecies {
  especies: EspecieDto[];
}

@Injectable({ providedIn: 'root' })
export class EspecieService {
  private endpoint: string = '/especie';
  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: EspecieDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  listar(): Observable<EspecieDto[]> {
    return this.http.get<any>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    ).pipe(
      map((response: any) => {
        if (response && Array.isArray(response.listado)) {
          return response.listado;
        }
        throw new Error('Estructura de respuesta inesperada en listarEspecies: ' + JSON.stringify(response));
      })
    );
  }

  obtener(id: number): Observable<EspecieDto> {
    return this.http.get<EspecieDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: EspecieDto): Observable<string> {
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
