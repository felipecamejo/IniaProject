import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { UsuarioService } from '../../../services/UsuarioService';
import { UsuarioDto, UserRole } from '../../../models/Usuario.dto';

@Component({
  selector: 'app-listado-usuarios',
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    ButtonModule, 
    InputTextModule, 
    DialogModule
  ],
  templateUrl: './listado-usuarios.component.html',
  styleUrls: ['./listado-usuarios.component.scss']
})
export class ListadoUsuariosComponent {
    constructor(
        private router: Router, 
        private authService: AuthService,
        private usuarioService: UsuarioService
    ) {}

    searchText: string = '';

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalEmail: string = '';
    modalRol: UserRole = UserRole.USER;
    modalActivo: boolean = true;
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Usuario';
    modalBotonTexto: string = 'Crear Usuario';
    itemEditando: UsuarioDto | null = null;
    itemEditandoId: number | null = null;

    // Opciones para el dropdown de roles
    rolesOptions = [
        { label: 'Usuario', value: UserRole.USER },
        { label: 'Administrador', value: UserRole.ADMIN }
    ];

    // Datos de ejemplo - reemplaza con datos reales del servicio
    items: UsuarioDto[] = [
        { 
            id: 1, 
            nombre: 'Juan Pérez', 
            email: 'juan.perez@example.com', 
            rol: UserRole.ADMIN, 
            activo: true,
            lotesId: [1, 2, 3]
        },
        { 
            id: 2, 
            nombre: 'María García', 
            email: 'maria.garcia@example.com', 
            rol: UserRole.USER, 
            activo: true,
            lotesId: [4, 5]
        },
        { 
            id: 3, 
            nombre: 'Carlos López', 
            email: 'carlos.lopez@example.com', 
            rol: UserRole.USER, 
            activo: false,
            lotesId: []
        },
    ];

    get itemsFiltrados() {
        return this.items.filter(item => {
            const cumpleNombre = !this.searchText || 
                item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
            
            const cumpleEmail = !this.searchText || 
                item.email.toLowerCase().includes(this.searchText.toLowerCase());
            
            return cumpleNombre || cumpleEmail;
        });
    }

    getRolLabel(rol: UserRole): string {
        return rol === UserRole.ADMIN ? 'Administrador' : 'Usuario';
    }

    crearItem() {
        const dto: UsuarioDto = {
            id: 0, // Se asignará en el backend
            nombre: this.modalNombre,
            email: this.modalEmail,
            rol: this.modalRol,
            activo: this.modalActivo,
            lotesId: []
        };
        
        console.log('Crear nuevo usuario', dto);
        
        // Aquí puedes agregar la llamada al servicio
        // this.usuarioService.crearUsuario(dto).subscribe({
        //     next: (response) => {
        //         // Actualizar la lista
        //         this.cerrarModal();
        //     },
        //     error: (error) => {
        //         this.modalError = 'Error al crear el usuario';
        //     }
        // });

        // Simulación temporal
        const newId = Math.max(...this.items.map(i => i.id)) + 1;
        this.items.push({ ...dto, id: newId });
    }

    actualizarItem() {
        if (!this.itemEditando) return;

        const dto: UsuarioDto = {
            ...this.itemEditando,
            nombre: this.modalNombre,
            email: this.modalEmail,
            rol: this.modalRol,
            activo: this.modalActivo
        };

        console.log('Actualizar usuario', dto);
        
        // Aquí puedes agregar la llamada al servicio
        // this.usuarioService.actualizarUsuario(dto).subscribe({
        //     next: (response) => {
        //         // Actualizar la lista
        //         const index = this.items.findIndex(i => i.id === dto.id);
        //         if (index !== -1) {
        //             this.items[index] = dto;
        //         }
        //         this.cerrarModal();
        //     },
        //     error: (error) => {
        //         this.modalError = 'Error al actualizar el usuario';
        //     }
        // });

        // Simulación temporal
        const index = this.items.findIndex(i => i.id === dto.id);
        if (index !== -1) {
            this.items[index] = dto;
        }
    }

    abrirModal() {
        this.modalNombre = '';
        this.modalEmail = '';
        this.modalRol = UserRole.USER;
        this.modalActivo = true;
        this.modalError = '';
        this.modalTitulo = 'Crear Usuario';
        this.modalBotonTexto = 'Crear Usuario';
        this.itemEditando = null;
        this.itemEditandoId = null;
        this.mostrarModal = true;
    }

    abrirModalEdicion(item: UsuarioDto) {
        this.modalNombre = item.nombre;
        this.modalEmail = item.email;
        this.modalRol = item.rol;
        this.modalActivo = item.activo;
        this.modalError = '';
        this.modalTitulo = 'Editar Usuario';
        this.modalBotonTexto = 'Actualizar Usuario';
        this.itemEditando = item;
        this.itemEditandoId = item.id;
        this.mostrarModal = true;
    }

    cerrarModal() {
        this.mostrarModal = false;
    }

    onSubmitModal(form: any) {
        if (form.invalid || this.modalLoading) return;
        
        this.modalLoading = true;
        this.modalError = '';

        // Validaciones adicionales
        if (!this.modalNombre.trim()) {
            this.modalError = 'El nombre es requerido';
            this.modalLoading = false;
            return;
        }

        if (!this.modalEmail.trim()) {
            this.modalError = 'El email es requerido';
            this.modalLoading = false;
            return;
        }

        // Verificar email único (solo para creación)
        if (!this.itemEditando) {
            const emailExiste = this.items.some(item => 
                item.email.toLowerCase() === this.modalEmail.toLowerCase()
            );
            if (emailExiste) {
                this.modalError = 'Ya existe un usuario con este email';
                this.modalLoading = false;
                return;
            }
        }

        // Ejecutar creación o actualización
        if (this.itemEditando) {
            this.actualizarItem();
        } else {
            this.crearItem();
        }
        
        this.modalLoading = false;
        this.cerrarModal();
    }

    goToHome() {
        this.router.navigate(['/home']);
    }

    editarItem(usuario: UsuarioDto) {
        this.abrirModalEdicion(usuario);
    }

    eliminarItem(usuario: UsuarioDto) {
        if (confirm(`¿Estás seguro de que deseas eliminar el usuario "${usuario.nombre}"?`)) {
            console.log('Eliminar usuario:', usuario);
            
            // Aquí puedes agregar la llamada al servicio
            // this.usuarioService.eliminarUsuario(usuario.id).subscribe({
            //     next: (response) => {
            //         // Remover de la lista
            //         this.items = this.items.filter(i => i.id !== usuario.id);
            //     },
            //     error: (error) => {
            //         console.error('Error al eliminar usuario:', error);
            //     }
            // });

            // Simulación temporal
            this.items = this.items.filter(i => i.id !== usuario.id);
        }
    }
}