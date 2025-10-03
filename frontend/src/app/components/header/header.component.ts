import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private router: Router, private auth: AuthService) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }
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

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.closeMobileMenu();
  }
}
