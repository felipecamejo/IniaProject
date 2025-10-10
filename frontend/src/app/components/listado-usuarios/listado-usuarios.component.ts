import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
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
export class ListadoUsuariosComponent implements OnInit, OnDestroy {
    constructor(
        private router: Router, 
        private authService: AuthService,
        private usuarioService: UsuarioService
    ) {}

    searchText: string = '';
    selectedRol: string = '';
    items: UsuarioDto[] = [];
    private navigationSubscription: any;

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalEmail: string = '';
    modalTelefono: string = '';
    modalRol: UserRole = UserRole.OBSERVADOR;
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Usuario';
    modalBotonTexto: string = 'Crear Usuario';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

    // Opciones para el dropdown de roles
    rolesOptions = [
        { label: 'Analista', value: UserRole.ANALISTA }, 
        { label: 'Observador', value: UserRole.OBSERVADOR },
        { label: 'Administrador', value: UserRole.ADMIN }
    ];

    ngOnInit(): void {
        this.cargarUsuarios();
        
        // Suscribirse a cambios de navegación para recargar cuando se regrese de crear/editar
        this.navigationSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.url === '/listado-usuarios') {
                    this.cargarUsuarios();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    cargarUsuarios(): void {
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

    abrirModal() {
        this.modalNombre = '';
        this.modalEmail = '';
        this.modalTelefono = '';
        this.modalRol = UserRole.OBSERVADOR;
        this.modalError = '';
        this.modalTitulo = 'Crear Usuario';
        this.modalBotonTexto = 'Crear Usuario';
        this.itemEditando = null;
        this.itemEditandoId = null;
        this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
        this.modalNombre = item.nombre;
        this.modalEmail = item.email;
        this.modalTelefono = item.telefono || '';
        this.modalRol = item.rol;
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

        const usuario: UsuarioDto = { 
            id: this.itemEditandoId ?? 0,
            nombre: this.modalNombre,
            email: this.modalEmail,
            telefono: this.modalTelefono,
            rol: this.modalRol,
            activo: true,
            lotesId: []
        };

        if (this.itemEditando) {
            // Editar usuario existente
            this.usuarioService.actualizarUsuarioPorId(this.itemEditandoId!, usuario).subscribe({
                next: (response) => {
                    console.log('Usuario editado:', response);
                    this.modalLoading = false;
                    this.cerrarModal();
                    this.cargarUsuarios();
                },
                error: (error) => {
                    console.error('Error al editar usuario:', error);
                    this.modalError = 'Error al actualizar el usuario';
                    this.modalLoading = false;
                }
            });
        } else {
            // Crear nuevo usuario
            this.usuarioService.crearUsuario(usuario).subscribe({
                next: (response) => {
                    console.log('Usuario creado:', response);
                    this.modalLoading = false;
                    this.cerrarModal();
                    this.cargarUsuarios();
                },
                error: (error) => {
                    console.error('Error al crear usuario:', error);
                    this.modalError = 'Error al crear el usuario';
                    this.modalLoading = false;
                }
            });
        }
    }

    crearUsuario() {
        this.abrirModal();
    }

    editarItem(usuario: UsuarioDto) {
        this.abrirModalEdicion(usuario);
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