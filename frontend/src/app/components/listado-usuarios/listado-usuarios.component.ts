import { Component, ViewEncapsulation, OnInit } from '@angular/core';
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
export class ListadoUsuariosComponent implements OnInit {
    constructor(
        private router: Router, 
        private authService: AuthService,
        private usuarioService: UsuarioService
    ) {}

    searchText: string = '';
    selectedRol: string = '';
    items: UsuarioDto[] = [];

    ngOnInit(): void {
        this.usuarioService.listarUsuarios().subscribe({
            next: (response) => {
                this.items = response?.usuarios ?? [];
            },
            error: (error) => {
                console.error('Error al listar usuarios', error);
                this.items = [];
            }
        });
    }

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