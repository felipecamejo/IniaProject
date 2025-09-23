import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Cerrar el menú cuando se redimensiona la ventana a desktop
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any): void {
    if (event.target.innerWidth > 768) {
      this.isMobileMenuOpen = false;
    }
  }

  // Cerrar el menú con la tecla Escape
  @HostListener('document:keydown.escape')
  onKeydownHandler(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}
