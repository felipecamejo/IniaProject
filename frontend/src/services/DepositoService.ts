import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import { DepositoDto } from '../models/Deposito.dto';

interface ResponseListadoDepositos {
  depositos: DepositoDto[];
}

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

  listarDepositos(): Observable<ResponseListadoDepositos> {
    return this.http.get<ResponseListadoDepositos>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
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
}