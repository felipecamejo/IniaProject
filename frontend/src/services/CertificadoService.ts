import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CertificadoDto } from '../models/Certificado.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UrlService } from '../services/url.service';

interface ResponseListadoCertificados {
  certificados: CertificadoDto[];
}

@Injectable({ providedIn: 'root' })
export class CertificadoService {
  private endpoint: string = '/certificado';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearCertificado(payload: CertificadoDto): Observable<CertificadoDto> {
    return this.http.post<CertificadoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      payload
    );
  }

  obtenerCertificado(id: number): Observable<CertificadoDto> {
    return this.http.get<CertificadoDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }

  editarCertificado(payload: CertificadoDto): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/editar`,
      payload,
      { responseType: 'text' }
    );
  }

  eliminarCertificado(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/eliminar/${id}`,
      {},
      { responseType: 'text' }
    );
  }

  listar(): Observable<CertificadoDto[]> {
    return this.http.get<ResponseListadoCertificados>(
      `${this.urlService.baseUrl}${this.endpoint}/listar`
    ).pipe(
      map((response: ResponseListadoCertificados) => {
        return response.certificados || [];
      })
    );
  }

  listarPorRecibo(reciboId: number): Observable<CertificadoDto[]> {
    return this.http.get<ResponseListadoCertificados>(
      `${this.urlService.baseUrl}${this.endpoint}/recibo/${reciboId}`
    ).pipe(
      map((response: ResponseListadoCertificados) => {
        return response.certificados || [];
      })
    );
  }
}

