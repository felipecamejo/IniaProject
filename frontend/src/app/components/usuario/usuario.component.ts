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
        
        // Simulación temporal con los mismos datos del listado-usuarios
        const usuariosSimulados: UsuarioDto[] = [
            { 
                id: 1, 
                nombre: 'Juan Pérez', 
                email: 'juan.perez@example.com', 
                telefono: '+598 99 123 456',
                rol: UserRole.ADMIN, 
                activo: true,
                lotesId: [1, 2, 3]
            },
            { 
                id: 2, 
                nombre: 'María García', 
                email: 'maria.garcia@example.com', 
                telefono: '+598 99 654 321',
                rol: UserRole.OBSERVADOR, 
                activo: true,
                lotesId: [4, 5]
            },
            { 
                id: 3, 
                nombre: 'Carlos López', 
                email: 'carlos.lopez@example.com', 
                telefono: '',
                rol: UserRole.OBSERVADOR, 
                activo: false,
                lotesId: []
            },
        ];

        const usuario = usuariosSimulados.find(u => u.id === id);
        
        if (usuario) {
            this.nombre = usuario.nombre;
            this.email = usuario.email;
            this.telefono = usuario.telefono || '';
            this.rol = usuario.rol;
            console.log('Usuario cargado:', usuario);
        } else {
            console.error('Usuario no encontrado con ID:', id);
            // En caso de no encontrar el usuario, limpiar campos
            this.limpiarCampos();
        }

        // Cuando tengas el servicio real, reemplaza por:
        // this.usuarioService.obtenerPerfilUsuario(email).subscribe({
        //     next: (usuario) => {
        //         this.nombre = usuario.nombre;
        //         this.email = usuario.email;
        //         this.telefono = usuario.telefono || '';
        //         this.rol = usuario.rol;
        //     },
        //     error: (error) => {
        //         console.error('Error al cargar usuario:', error);
        //         this.limpiarCampos();
        //     }
        // });
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

      const usuarioData: UsuarioDto = {
        id: this.editingId ?? 0, // Se asigna en el backend para nuevos usuarios
        nombre: this.nombre,
        email: this.email,
        telefono: this.telefono,
        rol: this.rol,
        activo: true, // Por defecto activo (se excluye del formulario pero se envía)
        lotesId: [] // Por defecto sin lotes (se excluye del formulario pero se envía)
      };

      if (this.isEditing && this.editingId) {
        // Actualizar usuario existente
        console.log('Actualizando Usuario ID:', this.editingId, 'con datos:', usuarioData);
        // Aquí deberías llamar al servicio:
        // this.usuarioService.actualizarUsuario(usuarioData).subscribe(...)
      } else {
        // Crear nuevo usuario
        console.log('Creando nuevo Usuario:', usuarioData);
        // Aquí deberías llamar al servicio:
        // this.usuarioService.crearUsuario(usuarioData).subscribe(...)
      }
      
      this.router.navigate(['/listado-usuarios']);
    }

    onCancel() {
      this.router.navigate(['/listado-usuarios']);
    }
}
