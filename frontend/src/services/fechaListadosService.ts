import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { DOSNDto } from '../models/DOSN.dto';
import { GerminacionDto } from '../models/Germinacion.dto';
import { PMSDto } from '../models/PMS.dto';
import { PurezaPNotatumDto } from '../models/PurezaPNotatum.dto';
import { PurezaDto } from '../models/Pureza.dto';
import { TetrazolioDto } from '../models/Tetrazolio.dto';
import { SanitarioDto } from '../models/Sanitario.dto';


@Injectable({ providedIn: 'root' })
export class FechaListadosService {

  constructor(private http: HttpClient, private urlService: UrlService) {}

    getFechaConTipo(item: DOSNDto | GerminacionDto | PMSDto | PurezaPNotatumDto | PurezaDto | TetrazolioDto | SanitarioDto): { fecha: string } {
        if (!item || item.fechaCreacion == null || item.fechaCreacion === undefined) {
            return { fecha: ''};
        }

        return { fecha: item.fechaCreacion};
    }

    /**
    * Obtiene la fecha formateada según si es pendiente (fechaCreacion) o repetido (fechaRepeticion)
    */
    getFechaFormateada(item: DOSNDto): string {
        const fechaConTipo = this.getFechaConTipo(item);
        return this.formatFecha(fechaConTipo.fecha);
    }

    /**
     * Formatea una fecha (posiblemente en ISO o YYYY-MM-DD[T...] ) a DD/MM/YYYY.
     * Devuelve cadena vacía si la fecha es inválida o no está presente.
     */
    formatFecha(fecha: string | null | undefined | Date): string {
      if (!fecha) return '';
      let d: Date;
      if (fecha instanceof Date) {
        d = fecha;
      } else {
        // Extraer la parte de fecha si viene con hora
        const fechaSolo = fecha.split('T')[0];
        const partes = fechaSolo.split('-');
        if (partes.length >= 3 && partes[0].length === 4) {
          const year = partes[0];
          const month = partes[1];
          const day = partes[2];
          return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
        }
        d = new Date(fecha);
      }
      if (isNaN(d.getTime())) return '';
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
}
