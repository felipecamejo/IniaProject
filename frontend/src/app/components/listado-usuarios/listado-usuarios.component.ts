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
import { UsuarioDto} from '../../../models/Usuario.dto';
import { UserRole } from '../../../models/enums';

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
    selectedRol: string = '';

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
            rol: UserRole.OBSERVADOR, 
            activo: true,
            lotesId: [4, 5]
        },
        { 
            id: 3, 
            nombre: 'Carlos López', 
            email: 'carlos.lopez@example.com', 
            rol: UserRole.OBSERVADOR, 
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
            
            const cumpleRol = !this.selectedRol || 
                item.rol === this.selectedRol;
            
            return (cumpleNombre || cumpleEmail) && cumpleRol;
        });
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

    crearUsuario() {
        // Navegar al componente usuario para crear nuevo usuario
        this.router.navigate(['/usuario/crear']);
    }

    editarItem(usuario: UsuarioDto) {
        // Navegar al componente usuario con el ID para edición
        this.router.navigate(['/usuario/editar', usuario.id]);
    }

    goToHome() {
        this.router.navigate(['/home']);
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