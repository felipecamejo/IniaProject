import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  // URLs relativas - funcionan en ambos entornos:
  // - Desarrollo local: Angular proxy o nginx hace proxy
  // - Producción ECS: ALB enruta las peticiones
  readonly baseUrl: string = '/Inia/api/v1';
  readonly authBaseUrl: string = '/Inia/api/seguridad';

  constructor(private http: HttpClient) {}

  public getUrl<T>(): Observable<T> {
    return this.http.get<T>(this.baseUrl);
  }
}
