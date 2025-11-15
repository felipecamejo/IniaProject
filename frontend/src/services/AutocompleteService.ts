import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AutocompletadoService } from './AutocompletadoService';
import { AutocompletadoDto } from '../models/Autocompletado.dto';

export interface AutocompletePopupData {
  parametro: string;
  elemento: HTMLInputElement;
  opciones: AutocompletadoDto[];
}

@Injectable({ providedIn: 'root' })
export class AutocompleteService {
  private cache = new Map<string, AutocompletadoDto[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos
  private cacheTimestamps = new Map<string, number>();

  private popupSubject = new BehaviorSubject<AutocompletePopupData | null>(null);
  public popup$ = this.popupSubject.asObservable();

  constructor(private autocompletadoService: AutocompletadoService) {}

  mostrarAutocompletados(
    parametro: string,
    elemento: HTMLInputElement
  ): void {
    // Verificar cache
    const cached = this.getFromCache(parametro);
    if (cached) {
      this.abrirPopup(parametro, elemento, cached);
      return;
    }

    // Buscar en BD
    this.autocompletadoService.obtenerPorParametro(parametro)
      .pipe(
        tap(opciones => {
          this.setCache(parametro, opciones);
          this.abrirPopup(parametro, elemento, opciones);
        }),
        catchError(error => {
          console.error('Error al obtener autocompletados:', error);
          // Si no hay datos, simplemente no mostrar popup (no rompe nada)
          return of([]);
        })
      )
      .subscribe();
  }

  seleccionarValor(valor: string, elemento: HTMLInputElement): void {
    elemento.value = valor;
    elemento.dispatchEvent(new Event('input', { bubbles: true }));
    elemento.dispatchEvent(new Event('change', { bubbles: true }));
    this.cerrarPopup();
  }

  cerrarPopup(): void {
    this.popupSubject.next(null);
  }

  invalidarCache(parametro?: string): void {
    if (parametro) {
      this.cache.delete(parametro);
      this.cacheTimestamps.delete(parametro);
    } else {
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
  }

  private abrirPopup(
    parametro: string,
    elemento: HTMLInputElement,
    opciones: AutocompletadoDto[]
  ): void {
    if (opciones.length === 0) {
      // Si no hay opciones, no mostrar popup (comportamiento silencioso)
      return;
    }
    this.popupSubject.next({ parametro, elemento, opciones });
  }

  private getFromCache(parametro: string): AutocompletadoDto[] | null {
    const timestamp = this.cacheTimestamps.get(parametro);
    if (!timestamp) return null;
    const now = Date.now();
    if (now - timestamp > this.cacheTimeout) {
      this.cache.delete(parametro);
      this.cacheTimestamps.delete(parametro);
      return null;
    }
    return this.cache.get(parametro) || null;
  }

  private setCache(parametro: string, opciones: AutocompletadoDto[]): void {
    this.cache.set(parametro, opciones);
    this.cacheTimestamps.set(parametro, Date.now());
  }
}

