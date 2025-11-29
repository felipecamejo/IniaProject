
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from './url.service';
import { LogDto } from '../models/Log.dto';

// Respuesta paginada para logs
export interface ResponseListadoLogsPage {
  content: LogDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface ResponseListadoLogs {
  logs: LogDto[];
}

@Injectable({ providedIn: 'root' })
export class LogService {
  private endpoint: string = '/log';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  /**
   * Listar logs paginados por loteId
   */
  listarLogsPage(loteId: number, params: { page?: number; size?: number; sort?: string; direction?: 'ASC' | 'DESC'; searchText?: string; mes?: number | string; anio?: number | string }): Observable<ResponseListadoLogsPage> {
    const page = params.page ?? 0;
    const size = params.size ?? 20;
    const sort = params.sort ?? 'fechaCreacion';
    const direction = params.direction ?? 'DESC';
    const searchText = params.searchText ?? '';
    const mes = params.mes != null ? params.mes : '';
    const anio = params.anio != null ? params.anio : '';
    const url = `${this.urlService.baseUrl}${this.endpoint}/listar-page/${loteId}?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}&direction=${direction}` +
      `&searchText=${encodeURIComponent(searchText)}` +
      `&mes=${mes}` +
      `&anio=${anio}`;
    return this.http.get<ResponseListadoLogsPage>(url);
  }

  crearLog(loteId: number, id: number, analisisNombre: string, accion: string, ): Observable<string> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user?.nombre || 'Desconocido';
    const rol = this.obtenerRolMasAlto(user?.roles);
    const mensaje = `${analisisNombre} con ID #${id} fue ${accion} por ${username} (${rol})`;
    const log : LogDto = {
      id: id,
      texto: mensaje,
      fechaCreacion: new Date().toISOString(),
      loteId: loteId
    };
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      log,
      { responseType: 'text' }
    );
  }

  obtenerRolMasAlto(roles: string[] | string | undefined): string {
    // Si no hay roles, retornar 'Desconocido'
    if (!roles) return 'Desconocido';
    // Si es un string, convertir a array
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    // Definir jerarquía de roles (de mayor a menor)
    if (rolesArray.includes('ADMIN')) return 'Administrador';
    if (rolesArray.includes('ANALISTA')) return 'Analista';
    if (rolesArray.includes('OBSERVADOR')) return 'Observador';
    return 'Desconocido';
  }

  listarLogs(loteId: number): Observable<ResponseListadoLogs> {
    return this.http.get<ResponseListadoLogs>(
      `${this.urlService.baseUrl}${this.endpoint}/listar/${loteId}`
    );
  }
}


