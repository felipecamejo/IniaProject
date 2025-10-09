import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioDto } from '../../../models/Usuario.dto';
import { UserRole } from '../../../models/enums';
import { UsuarioService } from '../../../services/UsuarioService';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-usuario',
  imports: [
      CommonModule,
      FormsModule,
      CardModule,
      InputTextModule,
      ButtonModule
  ],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})

export class UsuarioComponent implements OnInit {
    isEditing: boolean = false;
    editingId: number | null = null;

    // Campos del UsuarioDto (excluyendo id, activo, lotesId)
    nombre: string = '';
    email: string = '';
    telefono: string = '';
    rol: UserRole = UserRole.OBSERVADOR;

    // Opciones para el dropdown de roles
    rolesOptions = [
        { label: 'Analista', value: UserRole.ANALISTA }, 
        { label: 'Observador', value: UserRole.OBSERVADOR },
        { label: 'Administrador', value: UserRole.ADMIN }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private usuarioService: UsuarioService
    ) {}

    ngOnInit() {
        // Escuchar cambios en los parámetros de la ruta
        this.route.params.subscribe(params => {
            console.log('Parámetros de ruta:', params);
            
            if (params['id']) {
                // Modo edición: /usuario/editar/:id
                console.log('Modo edición detectado, ID:', params['id']);
                this.isEditing = true;
                this.editingId = parseInt(params['id']);
                this.cargarUsuario(this.editingId);
            } else {
                // Modo creación: /usuario/crear
                console.log('Modo creación detectado');
                this.isEditing = false;
                this.editingId = null;
                this.limpiarCampos();
            }
        });

        // También escuchar cambios en la URL para debug
        this.route.url.subscribe(url => {
            const currentPath = url.map(segment => segment.path).join('/');
            console.log('URL actual:', currentPath);
        });
    }

    cargarUsuario(id: number) {
        console.log('Cargando usuario con ID:', id);
        
        this.usuarioService.obtenerUsuarioPorId(id).subscribe({
            next: (usuario) => {
                this.nombre = usuario.nombre;
                this.email = usuario.email;
                this.telefono = usuario.telefono || '';
                this.rol = usuario.rol;
                console.log('Usuario cargado:', usuario);
            },
            error: (error) => {
                console.error('Error al cargar usuario:', error);
                alert('Error al cargar el usuario. Verifique que el usuario existe.');
                this.limpiarCampos();
                this.router.navigate(['/listado-usuarios']);
            }
        });
    }



    limpiarCampos() {
      console.log('Limpiando campos del formulario');
      this.nombre = '';
      this.email = '';
      this.telefono = '';
      this.rol = UserRole.OBSERVADOR;
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

    onSubmit() {
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        alert('Por favor ingrese un email válido');
        return;
      }

      const usuarioData: UsuarioDto = {
        id: this.editingId ?? 0, 
        nombre: this.nombre,
        email: this.email,
        telefono: this.telefono,
        rol: this.rol,
        activo: true, 
        lotesId: []
      };

      if (this.isEditing && this.editingId) {
        // Actualizar usuario existente
        console.log('Actualizando Usuario ID:', this.editingId, 'con datos:', usuarioData);
        this.usuarioService.actualizarUsuarioPorId(this.editingId, usuarioData).subscribe({
          next: (usuarioActualizado) => {
            console.log('Usuario actualizado exitosamente:', usuarioActualizado);
            alert('Usuario actualizado exitosamente');
            this.router.navigate(['/listado-usuarios']);
          },
          error: (error) => {
            console.error('Error al actualizar usuario:', error);
            alert('Error al actualizar el usuario. Verifique los datos e intente nuevamente.');
          }
        });
      } else {
        // Crear nuevo usuario
        console.log('Creando nuevo Usuario:', usuarioData);
        this.usuarioService.crearUsuario(usuarioData).subscribe({
          next: (nuevoUsuario) => {
            console.log('Usuario creado exitosamente:', nuevoUsuario);
            alert('Usuario creado exitosamente');
            this.router.navigate(['/listado-usuarios']);
          },
          error: (error) => {
            console.error('Error al crear usuario:', error);
            if (error.status === 409) {
              alert('Ya existe un usuario con ese email. Por favor use un email diferente.');
            } else {
              alert('Error al crear el usuario. Verifique los datos e intente nuevamente.');
            }
          }
        });
      }
    }

    onCancel() {
      this.router.navigate(['/listado-usuarios']);
    }
}
