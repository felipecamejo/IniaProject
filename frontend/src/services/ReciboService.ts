import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReciboDto } from '../models/Recibo.dto';
import { Observable } from 'rxjs';
import { UrlService } from '../services/url.service';

@Injectable({ providedIn: 'root' })
export class ReciboService {
  private endpoint: string = '/recibo';

  constructor(private http: HttpClient, private urlService: UrlService) {}

  traerRecibo(id: number): Observable<ReciboDto> {
    return this.http.get<ReciboDto>(
      `${this.urlService.baseUrl}${this.endpoint}/${id}`
    );
  }


}
