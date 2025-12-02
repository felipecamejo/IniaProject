import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from "./components/header/header.component";
import { AutocompletePopupComponent } from './components/autocomplete-popup/autocomplete-popup.component';
import { AutocompleteKeyboardDirective } from '../directives/autocomplete-keyboard.directive';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet, 
    HeaderComponent,
    AutocompletePopupComponent,
    AutocompleteKeyboardDirective
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'inia-frontend';
  currentRoute: string = '';


  constructor(private router: Router) {
    // Suscribirse a cambios de ruta para ocultar header en login
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Usar urlAfterRedirects si existe, si no url
        const url = (event as any).urlAfterRedirects || event.url;
        // Normalizar: solo path, sin query ni fragment
        this.currentRoute = url.split('?')[0].split('#')[0];
      });
  }

  showHeader(): boolean {
    // Ocultar header global en login o root
    return this.currentRoute !== '/login' && this.currentRoute !== '' && this.currentRoute !== '/';
  }
}
