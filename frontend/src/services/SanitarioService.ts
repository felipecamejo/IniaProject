import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { SanitarioDto } from '../models/Sanitario.dto';
import { SanitarioHongoDTO } from '../models/SanitarioHongo.dto';

interface ResponseListadoSanitario {
  sanitario: SanitarioDto[];
}

@Injectable({ providedIn: 'root' })
export class SanitarioService {
  private endpoint: string = '/sanitario'; // Corregido: Mayúscula para coincidir con el backend

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crear(payload: SanitarioDto): Observable<number> {
    return this.http.post<number>(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'json' }
    );
  }

  listar(): Observable<ResponseListadoSanitario> {
    return this.http.get<ResponseListadoSanitario>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }

  listarPorRecibo(reciboId: number): Observable<ResponseListadoSanitario> {
    return this.http.get<ResponseListadoSanitario>(
      `${this.urlService.baseUrl}${this.endpoint}/listar/recibo/${reciboId}`
    );
  }

  obtener(id: number): Observable<SanitarioDto> {
    return this.http.get<SanitarioDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editar(payload: SanitarioDto): Observable<number> {
    return this.http.put<number>(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload
    );
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      { responseType: 'text' }
    );
  }

    /**
   * Actualiza hongos completo - reemplaza crear, editar y eliminar
   * El backend maneja toda la lógica de comparación y cambios
   */
  actualizarHongosCompleto(sanitarioId: number, hongosActuales: SanitarioHongoDTO[]): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/actualizar-hongos/${sanitarioId}`,
      hongosActuales,
      { responseType: 'text' }
    );
  }

  listarHongosPorSanitario(sanitarioId: number): Observable<SanitarioHongoDTO[]> {
    return this.http.get<SanitarioHongoDTO[]>(
      `${this.urlService.baseUrl}${this.endpoint}/listar-hongos/${sanitarioId}`
    );
  }
}


