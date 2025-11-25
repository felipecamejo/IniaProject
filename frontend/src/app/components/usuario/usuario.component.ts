import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, Params, UrlSegment } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioDto } from '../../../models/Usuario.dto';
import { UserRole } from '../../../models/enums';
import { UsuarioService } from '../../../services/UsuarioService';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,
      CardModule,
      InputTextModule,
      ButtonModule,
      ToastModule
  ],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss'],
  providers: [MessageService]
})

export class UsuarioComponent implements OnInit {
    isEditing: boolean = false;
    editingId: number | null = null;

    // Campos del UsuarioDto (excluyendo id, activo, lotesId)
    nombre: string = '';
    email: string = '';
    telefono: string = '';
    rol: UserRole = UserRole.OBSERVADOR;
    
    // Campos de contraseña
    password: string = '';
    confirmPassword: string = '';
    
    // Variables para mostrar/ocultar contraseña
    showPassword: boolean = false;
    showConfirmPassword: boolean = false;

    // Opciones para el dropdown de roles
    rolesOptions: Array<{ label: string; value: UserRole }> = [
        { label: 'Analista', value: UserRole.ANALISTA }, 
        { label: 'Observador', value: UserRole.OBSERVADOR },
        { label: 'Administrador', value: UserRole.ADMIN }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private usuarioService: UsuarioService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // Escuchar cambios en los parámetros de la ruta
        this.route.params.subscribe((params: Params) => {
            console.log('Parámetros de ruta:', params);
            
            const rawId = params['id'];

            if (rawId !== undefined && rawId !== null) {
                // Modo edición: /usuario/editar/:id
                console.log('Modo edición detectado, ID:', rawId);
                this.isEditing = true;
                const parsedId = Number.parseInt(String(rawId), 10);

                if (Number.isNaN(parsedId)) {
                    console.warn('ID de usuario inválido en parámetros:', rawId);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Identificador de usuario inválido.'
                    });
                    this.router.navigate(['/listado-usuarios']);
                    return;
                }

                this.editingId = parsedId;
                this.cargarUsuario(parsedId);
            } else {
                // Modo creación: /usuario/crear
                console.log('Modo creación detectado');
                this.isEditing = false;
                this.editingId = null;
                this.limpiarCampos();
            }
        });

        // También escuchar cambios en la URL para debug
        this.route.url.subscribe((url: UrlSegment[]) => {
            const currentPath = url.map((segment: UrlSegment) => segment.path).join('/');
            console.log('URL actual:', currentPath);
        });
    }

    cargarUsuario(id: number): void {
        console.log('Cargando usuario con ID:', id);
        
        this.usuarioService.obtenerUsuarioPorId(id).subscribe({
            next: (usuario: UsuarioDto) => {
                this.nombre = usuario.nombre;
                this.email = usuario.email;
                this.telefono = usuario.telefono || '';
                this.rol = usuario.rol;
                console.log('Usuario cargado:', usuario);
            },
            error: (error: HttpErrorResponse) => {
                console.error('Error al cargar usuario:', error);
                alert('Error al cargar el usuario. Verifique que el usuario existe.');
                this.limpiarCampos();
                this.router.navigate(['/listado-usuarios']);
            }
        });
    }



    limpiarCampos(): void {
      console.log('Limpiando campos del formulario');
      this.nombre = '';
      this.email = '';
      this.telefono = '';
      this.rol = UserRole.OBSERVADOR;
      this.password = '';
      this.confirmPassword = '';
      this.showPassword = false;
      this.showConfirmPassword = false;
    }

    togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
      this.showConfirmPassword = !this.showConfirmPassword;
    }

    getRolLabel(rol: UserRole): string {
        switch (rol) {
            case UserRole.ADMIN:
                return 'Administrador';
            case UserRole.ANALISTA:
                return 'Analista';
            case UserRole.OBSERVADOR:
                return 'Observador';
            default:
                return 'Usuario';
        }
    }

    onSubmit(): void {
      // Validaciones básicas
      if (!this.nombre.trim()) {
        alert('El nombre es requerido');
        return;
      }

      if (!this.email.trim()) {
        alert('El email es requerido');
        return;
      }

      // Validación de email
      const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        alert('Por favor ingrese un email válido');
        return;
      }

      // Validaciones de contraseña (siempre requerida)
      if (!this.password.trim()) {
        alert(this.isEditing ? 'La nueva contraseña es requerida' : 'La contraseña es requerida');
        return;
      }

      if (this.password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (this.password !== this.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      const usuarioData: UsuarioDto = {
        id: this.editingId ?? 0, 
        nombre: this.nombre,
        email: this.email,
        telefono: this.telefono,
        rol: this.rol,
        activo: true, 
        lotesId: [],
        password: this.password // Siempre incluir contraseña
      };

      if (this.isEditing && this.editingId !== null) {
        // Actualizar usuario existente
        console.log('Actualizando Usuario ID:', this.editingId, 'con datos:', usuarioData);
        this.usuarioService.actualizarUsuarioPorId(this.editingId, usuarioData).subscribe({
          next: (usuarioActualizado: UsuarioDto) => {
            console.log('Usuario actualizado exitosamente:', usuarioActualizado);
            alert('Usuario actualizado exitosamente');
            this.router.navigate(['/listado-usuarios']);
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error al actualizar usuario:', error);
            alert('Error al actualizar el usuario. Verifique los datos e intente nuevamente.');
          }
        });
      } else {
        // Crear nuevo usuario
        console.log('Creando nuevo Usuario:', usuarioData);
        this.usuarioService.crearUsuario(usuarioData).subscribe({
          next: () => {
            // Mostrar toast de éxito y redirigir tras breve delay
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });
            window.setTimeout(() => this.router.navigate(['/listado-usuarios']), 800);
          },
          error: (error: HttpErrorResponse) => {
            // Manejo de errores reales
            if (error.status === 409) {
              alert('Ya existe un usuario con ese email. Por favor use un email diferente.');
            } else if (error.status === 400) {
              alert('Datos inválidos. Verifique que todos los campos requeridos estén completos.');
            } else if (error.status === 403) {
              alert('No tiene permisos para crear usuarios. Contacte al administrador.');
            } else if (error.status === 0) {
              alert('Error de conexión. Verifique que el servidor esté ejecutándose.');
            } else {
              alert(`Error al crear el usuario: ${error.error?.message || error.message || 'Error desconocido'}`);
            }
          }
        });
      }
    }

    onCancel() {
      this.router.navigate(['/listado-usuarios']);
    }
}
