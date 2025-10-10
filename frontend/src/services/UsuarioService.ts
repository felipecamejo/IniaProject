import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { UsuarioDto } from '../models/Usuario.dto';

interface ResponseListadoUsuarios {
  usuarios: UsuarioDto[];
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private endpoint: string = '/usuario';

  constructor(private http: HttpClient, private url: UrlService) {}

  listarUsuarios(): Observable<ResponseListadoUsuarios> {
    return this.http.get<ResponseListadoUsuarios>(
      `${this.url.baseUrl}${this.endpoint}/listar`
    );
  }

  obtenerPerfilUsuario(email: string): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.url.baseUrl}/usuario/perfil/${email}`);
  }

  obtenerPerfilUsuarioActual(): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.url.baseUrl}/usuario/perfil/actual`);
  }

  actualizarUsuario(usuario: UsuarioDto): Observable<string> {
    return this.http.put<string>(`${this.url.baseUrl}${this.endpoint}/editar`, usuario, {
      responseType: 'text' as 'json'
    });
  }

  actualizarPerfilUsuario(usuario: UsuarioDto): Observable<string> {
    return this.http.put<string>(`${this.url.baseUrl}/usuario/perfil/actualizar`, usuario, {
      responseType: 'text' as 'json'
    });
  }

  crearUsuario(usuario: UsuarioDto): Observable<string> {
    return this.http.post<string>(
      `${this.url.baseUrl}${this.endpoint}/crear`,
      usuario,
      { responseType: 'text' as 'json' }
    );
  }

  obtenerUsuarioPorId(id: number): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.url.baseUrl}${this.endpoint}/${id}`);
  }

  actualizarUsuarioPorId(id: number, usuario: UsuarioDto): Observable<UsuarioDto> {
    return this.http.put<UsuarioDto>(`${this.url.baseUrl}${this.endpoint}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<string> {
    return this.http.delete<string>(`${this.url.baseUrl}${this.endpoint}/eliminar/${id}`, {
      responseType: 'text' as 'json'
    });
  }
}
