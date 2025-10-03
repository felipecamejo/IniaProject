
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/AuthService';
import { UsuarioService, UsuarioDto } from '../../../services/UsuarioService';

@Component({
  selector: 'app-perfil.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  nombre: string = '';
  apellido: string = '';
  mail: string = '';
  telefono: string = '';
  rol: string = '';
  imagenPreview: string | ArrayBuffer | null = null;
  modalAbierto: boolean = false;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  usuarioId: number | null = null;

  constructor(
    private auth: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.cargarPerfilUsuario();
  }

  cargarPerfilUsuario() {
    const email = this.auth.userEmail;
    if (email) {
      this.loading = true;
      this.usuarioService.obtenerPerfilUsuario(email).subscribe({
        next: (usuario: UsuarioDto) => {
          this.usuarioId = usuario.id;
          this.nombre = usuario.nombre;
          this.mail = usuario.email;
          this.rol = usuario.rol;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar perfil:', error);
          this.error = 'Error al cargar el perfil del usuario';
          this.loading = false;
        }
      });
    }
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

    this.loading = true;
    this.error = '';
    this.success = '';

    const usuarioActualizado: UsuarioDto = {
      id: this.usuarioId,
      email: this.mail,
      nombre: this.nombre,
      rol: this.rol,
      activo: true
    };

    this.usuarioService.actualizarUsuario(usuarioActualizado).subscribe({
      next: (response) => {
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
      error: (error) => {
        this.loading = false;
        this.error = 'Error al actualizar el perfil. Intenta nuevamente.';
        console.error('Error al actualizar usuario:', error);
      }
    });
  }
}
