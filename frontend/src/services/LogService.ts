import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from './url.service';
import { LogDto } from '../models/Log.dto';

interface ResponseListadoLogs {
  logs: LogDto[];
}

@Injectable({ providedIn: 'root' })
export class LogService {
  private endpoint: string = '/log';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearLog(id: number, analisisNombre: string, accion: string, ): Observable<string> {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user?.nombre || 'Desconocido';
    const rol = this.obtenerRolMasAlto(user?.roles);

    const mensaje = `${analisisNombre} con ID #${id} fue ${accion} por ${username} (${rol})`;

    const log : LogDto = {
      id: id,
      texto: mensaje,
      fechaCreacion: new Date().toISOString()
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

  listarLogs(): Observable<ResponseListadoLogs> {
    return this.http.get<ResponseListadoLogs>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }
 
}


