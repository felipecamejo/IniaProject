import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';

export interface UsuarioDto {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private http: HttpClient, private url: UrlService) {}

  obtenerPerfilUsuario(email: string): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.url.baseUrl}/api/v1/usuario/perfil/${email}`);
  }

  actualizarUsuario(usuario: UsuarioDto): Observable<string> {
    return this.http.put<string>(`${this.url.baseUrl}/api/v1/usuario/perfil/actualizar`, usuario, {
      responseType: 'text' as 'json'
    });
  }
}
