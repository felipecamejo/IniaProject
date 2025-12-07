import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { ConteoGerminacionDto } from '../models/ConteoGerminacion.dto';
import { NormalPorConteoDto } from '../models/NormalPorConteo.dto';
import { RepeticionFinalDto } from '../models/RepeticionFinal.dto';

@Injectable({ providedIn: 'root' })
export class GerminacionTablasService {
  private base = '/germinacion/tablas';

  constructor(private http: HttpClient, private urls: UrlService) {}

  // Conteos
  addConteo(germinacionId: number, body?: Partial<ConteoGerminacionDto>): Observable<ConteoGerminacionDto> {
    return this.http.post<ConteoGerminacionDto>(
      `${this.urls.baseUrl}${this.base}/${germinacionId}/conteos`,
      body ?? {}
    );
  }

  listConteos(germinacionId: number): Observable<ConteoGerminacionDto[]> {
    return this.http.get<ConteoGerminacionDto[]>(
      `${this.urls.baseUrl}${this.base}/${germinacionId}/conteos`
    );
  }

  updateConteoFecha(conteoId: number, fechaIso: string): Observable<any> {
    return this.http.put<any>(
      `${this.urls.baseUrl}${this.base}/conteos/${conteoId}/fecha`,
      { fechaConteo: fechaIso }
    );
  }

  // Normales (por conteo)
  upsertNormal(tabla: string, body: NormalPorConteoDto): Observable<NormalPorConteoDto> {
    return this.http.put<NormalPorConteoDto>(
      `${this.urls.baseUrl}${this.base}/normales/${encodeURIComponent(tabla)}`,
      body
    );
  }

  // Finales (por repetición)
  upsertFinales(tabla: string, body: RepeticionFinalDto): Observable<RepeticionFinalDto> {
    return this.http.put<RepeticionFinalDto>(
      `${this.urls.baseUrl}${this.base}/finales/${encodeURIComponent(tabla)}`,
      body
    );
  }

  // Resumen (para pintar la matriz en la UI)
  getResumen(germinacionId: number): Observable<any> {
    return this.http.get<any>(
      `${this.urls.baseUrl}${this.base}/${germinacionId}/resumen`
    );
  }

  // Repeticiones
  addRepeticionAuto(germinacionId: number, tabla: string): Observable<any> {
    return this.http.post<any>(
      `${this.urls.baseUrl}${this.base}/${germinacionId}/celdas/${encodeURIComponent(tabla)}/repeticiones`,
      {}
    );
  }

  addRepeticionNumero(germinacionId: number, tabla: string, numeroRepeticion: number): Observable<any> {
    return this.http.post<any>(
      `${this.urls.baseUrl}${this.base}/${germinacionId}/celdas/${encodeURIComponent(tabla)}/repeticiones/${numeroRepeticion}`,
      {}
    );
  }
}
