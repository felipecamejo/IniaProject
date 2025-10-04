
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { UsuarioService, UsuarioDto } from '../../../services/UsuarioService';
import { UserRole } from '../../../models/enums';
import { EnumConverter } from '../../../utils/enum-converter';

@Component({
  selector: 'app-perfil.component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  nombre: string = '';
  apellido: string = '';
  mail: string = '';
  telefono: string = '';
  rol: UserRole | string = '';
  imagenPreview: string | ArrayBuffer | null = null;
  modalAbierto: boolean = false;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  usuarioId: number | null = null;

  constructor(
    private auth: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    // Validar que el usuario esté autenticado
    if (!this.auth.token) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarPerfilUsuario();
  }

  cargarPerfilUsuario() {
    this.loading = true;
    this.error = '';
    
    // Usar el nuevo endpoint que obtiene el perfil del usuario autenticado actual
    this.usuarioService.obtenerPerfilUsuarioActual().subscribe({
      next: (usuario: UsuarioDto) => {
        if (usuario) {
          this.usuarioId = usuario.id;
          this.nombre = usuario.nombre;
          this.mail = usuario.email;
          this.rol = EnumConverter.convertBackendRoleToFrontend(usuario.rol.toString());
          this.loading = false;
        } else {
          this.error = 'Usuario no encontrado';
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Error al cargar perfil:', error);
        this.loading = false;
        
        // Manejar diferentes tipos de errores
        if (error.status === 401) {
          this.error = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          this.auth.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.error = 'No tienes permisos para acceder a esta información.';
        } else if (error.status === 404) {
          this.error = 'Usuario no encontrado.';
        } else {
          this.error = 'Error al cargar el perfil del usuario. Intenta nuevamente.';
        }
      }
    });
  }

  abrirModal() {
    this.modalAbierto = true;
    this.error = '';
    this.success = '';
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.error = '';
    this.success = '';
  }

  cambiarImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target && (e.target.result as string | ArrayBuffer | null);
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    if (!this.usuarioId) {
      this.error = 'No se pudo identificar al usuario';
      return;
    }

    // Validar campos requeridos
    if (!this.nombre.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }

    if (!this.mail.trim()) {
      this.error = 'El email es obligatorio';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.mail)) {
      this.error = 'El formato del email no es válido';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const usuarioActualizado: UsuarioDto = {
      id: this.usuarioId,
      email: this.mail,
      nombre: this.nombre,
      rol: typeof this.rol === 'string' ? EnumConverter.convertBackendRoleToFrontend(this.rol) : this.rol,
      activo: true
    };

    this.usuarioService.actualizarUsuario(usuarioActualizado).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = 'Perfil actualizado correctamente';
        
        // Actualizar datos en localStorage
        const userData = this.auth.userData;
        if (userData) {
          userData.nombre = this.nombre;
          userData.email = this.mail;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        setTimeout(() => {
          this.cerrarModal();
        }, 1500);
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error al actualizar usuario:', error);
        
        // Manejar diferentes tipos de errores
        if (error.status === 401) {
          this.error = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          this.auth.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.error = 'No tienes permisos para actualizar el perfil.';
        } else if (error.status === 400) {
          this.error = error.error || 'Datos inválidos. Verifica la información ingresada.';
        } else if (error.status === 409) {
          this.error = 'Ya existe un usuario con ese email.';
        } else {
          this.error = 'Error al actualizar el perfil. Intenta nuevamente.';
        }
      }
    });
  }

  getRoleDisplayName(role: UserRole | string): string {
    return EnumConverter.getRoleDisplayName(role);
  }
}
