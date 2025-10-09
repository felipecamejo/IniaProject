import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DepositoDto } from '../models/Deposito.dto';
import { Observable } from 'rxjs';
import { UrlService } from '../services/url.service';

@Injectable({ providedIn: 'root' })
export class DepositoService {
  private endpoint: string = '/deposito';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearDeposito(payload: DepositoDto): Observable<string> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload,
      { responseType: 'text' }
    );
  }

  obtenerDeposito(id: number): Observable<DepositoDto> {
    return this.http.get<DepositoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarDeposito(payload: DepositoDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
    );
  }

  eliminarDeposito(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      {},
      { responseType: 'text' }
    );
  }

  listarDepositos(): Observable<DepositoDto[]> {
    return this.http.get<DepositoDto[]>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    );
  }
}
