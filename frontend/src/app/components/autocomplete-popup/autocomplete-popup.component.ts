import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AutocompleteService } from '../../../services/AutocompleteService';
import { AutocompletadoDto } from '../../../models/Autocompletado.dto';

@Component({
  selector: 'app-autocomplete-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="mostrar" 
      class="autocomplete-overlay"
      (click)="cerrar()"
    >
      <div 
        class="autocomplete-popup"
        [style.top.px]="posicion.top"
        [style.left.px]="posicion.left"
        [style.width.px]="posicion.width"
        (click)="$event.stopPropagation()"
      >
        <div class="autocomplete-header">
          <span>Autocompletar: {{ parametro }}</span>
          <button class="close-btn" (click)="cerrar()">×</button>
        </div>
        <div class="autocomplete-content">
          <ul class="opciones-list">
            <li 
              *ngFor="let opcion of opciones; let i = index"
              [class.selected]="i === indiceSeleccionado"
              (click)="seleccionar(opcion.valor)"
              (mouseenter)="indiceSeleccionado = i"
            >
              {{ opcion.valor }}
            </li>
          </ul>
        </div>
        <div class="autocomplete-footer">
          <small>↑↓ navegar, Enter seleccionar, Esc cerrar</small>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./autocomplete-popup.component.scss']
})
export class AutocompletePopupComponent implements OnInit, OnDestroy {
  mostrar = false;
  parametro = '';
  opciones: AutocompletadoDto[] = [];
  elemento: HTMLInputElement | null = null;
  posicion = { top: 0, left: 0, width: 0 };
  indiceSeleccionado = 0;
  private subscription?: Subscription;

  constructor(private autocompleteService: AutocompleteService) {}

  ngOnInit(): void {
    this.subscription = this.autocompleteService.popup$.subscribe(data => {
      if (data) {
        this.mostrar = true;
        this.parametro = data.parametro;
        this.opciones = data.opciones;
        this.elemento = data.elemento;
        this.calcularPosicion();
        this.indiceSeleccionado = 0;
        this.agregarEventListeners();
      } else {
        this.mostrar = false;
        this.removerEventListeners();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.removerEventListeners();
  }

  seleccionar(valor: string): void {
    if (this.elemento) {
      this.autocompleteService.seleccionarValor(valor, this.elemento);
    }
  }

  cerrar(): void {
    this.autocompleteService.cerrarPopup();
  }

  private calcularPosicion(): void {
    if (!this.elemento) return;
    const rect = this.elemento.getBoundingClientRect();
    const minPopupWidth = 250;
    const maxPopupWidth = 400;
    const popupHeight = 300; // max-height del popup
    const spacing = 5; // Espacio entre el campo y el popup
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calcular ancho del popup: coincidir con el campo, pero respetar min/max
    const campoWidth = rect.width;
    let popupWidth = Math.max(minPopupWidth, Math.min(maxPopupWidth, campoWidth));
    
    // Calcular posición vertical: debajo del campo
    let top = rect.bottom + spacing;
    
    // Si el popup no cabe debajo, mostrarlo arriba
    if (top + popupHeight > viewportHeight && rect.top > popupHeight) {
      top = rect.top - popupHeight - spacing;
    }
    
    // Calcular posición horizontal: alineado con el campo
    let left = rect.left;
    
    // Ajustar si el popup se sale por la derecha
    if (left + popupWidth > viewportWidth) {
      left = viewportWidth - popupWidth - 10; // 10px de margen del borde
    }
    
    // Asegurar que no se salga por la izquierda
    if (left < 10) {
      left = 10;
      // Si se ajustó a la izquierda, reducir el ancho si es necesario
      if (left + popupWidth > viewportWidth) {
        popupWidth = viewportWidth - left - 10;
      }
    }
    
    this.posicion = {
      top: top,
      left: left,
      width: popupWidth
    };
  }

  private agregarEventListeners(): void {
    document.addEventListener('keydown', this.handleKeydown);
  }

  private removerEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (!this.mostrar) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.indiceSeleccionado = Math.min(this.indiceSeleccionado + 1, this.opciones.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.indiceSeleccionado = Math.max(this.indiceSeleccionado - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.opciones[this.indiceSeleccionado]) {
          this.seleccionar(this.opciones[this.indiceSeleccionado].valor);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.cerrar();
        break;
    }
  };
}

