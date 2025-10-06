import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { UserRole } from '../models/enums';

export interface UsuarioDto {
  id: number;
  email: string;
  nombre: string;
  telefono?: string;
  rol: UserRole; // Usar el enum de roles del frontend
  activo: boolean;
  lotesId?: number[]; // Agregar campo opcional para lotes
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private http: HttpClient, private url: UrlService) {}

  obtenerPerfilUsuario(email: string): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.url.baseUrl}/usuario/perfil/${email}`);
  }

  obtenerPerfilUsuarioActual(): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.url.baseUrl}/usuario/perfil/actual`);
  }

  actualizarUsuario(usuario: UsuarioDto): Observable<string> {
    return this.http.put<string>(`${this.url.baseUrl}/usuario/perfil/actualizar`, usuario, {
      responseType: 'text' as 'json'
    });
  }
}
