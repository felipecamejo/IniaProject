import { Directive, HostListener, inject } from '@angular/core';
import { AutocompleteService } from '../services/AutocompleteService';

@Directive({
  selector: '[appAutocompleteGlobal]',
  standalone: true
})
export class AutocompleteKeyboardDirective {
  private autocompleteService = inject(AutocompleteService);

  @HostListener('document:keydown.f9', ['$event'])
  onF9Keydown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    
    // Obtener el elemento activo (donde está el cursor)
    const activeElement = document.activeElement as HTMLInputElement;
    
    if (!activeElement) return;
    
    // Validar que sea un input editable de texto o número
    if (activeElement.tagName !== 'INPUT') return;
    if (activeElement.hasAttribute('readonly')) return;
    if (activeElement.hasAttribute('disabled')) return;
    if (activeElement.type !== 'text' && activeElement.type !== 'number') return;
    
    // Extraer parámetro con fallback inteligente
    const parametro = this.obtenerParametro(activeElement);
    
    if (parametro) {
      this.autocompleteService.mostrarAutocompletados(parametro, activeElement);
    }
  }

  private obtenerParametro(elemento: HTMLInputElement): string | null {
    // Prioridad: data-autocomplete-param > id > name
    return elemento.getAttribute('data-autocomplete-param') 
        || elemento.getAttribute('id')
        || elemento.getAttribute('name');
  }
}

