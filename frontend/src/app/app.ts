import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { AutocompletePopupComponent } from './components/autocomplete-popup/autocomplete-popup.component';
import { AutocompleteKeyboardDirective } from '../directives/autocomplete-keyboard.directive';

@Component({
  selector: 'app-root',
  imports: [
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
}
