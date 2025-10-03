import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UrlService } from './url.service';
import { TokenUsuario } from '../models/TokenUsuario.dto';

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private url: UrlService) {}

  login(payload: LoginPayload): Observable<TokenUsuario> {
    return this.http
      .post<TokenUsuario>(`${this.url.authBaseUrl}/login`, payload)
      .pipe(tap((res) => this.storeSession(res)));
  }

  storeSession(res: TokenUsuario): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem(
      'user',
      JSON.stringify({ nombre: res.nombre, email: res.email, roles: res.roles })
    );
  }

  get userEmail(): string | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData).email : null;
  }

  get userData(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }
}


