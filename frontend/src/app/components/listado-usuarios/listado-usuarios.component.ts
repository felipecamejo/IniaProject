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
    modalPassword: string = '';
    modalConfirmPassword: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Usuario';
    modalBotonTexto: string = 'Crear Usuario';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

    // Variables para mostrar/ocultar contraseña en el modal
    showModalPassword: boolean = false;
    showModalConfirmPassword: boolean = false;
    cambiarPassword: boolean = false;

    // Opciones para el dropdown de roles
    rolesOptions = [
        { label: 'Analista', value: UserRole.ANALISTA }, 
        { label: 'Observador', value: UserRole.OBSERVADOR },
        { label: 'Administrador', value: UserRole.ADMIN }
    ];

    // Popup de confirmación de eliminación
    mostrarConfirmEliminar: boolean = false;
    usuarioAEliminar: UsuarioDto | null = null;
    confirmLoading: boolean = false;

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
        this.modalPassword = '';
        this.modalConfirmPassword = '';
        this.modalError = '';
        this.modalTitulo = 'Crear Usuario';
        this.modalBotonTexto = 'Crear Usuario';
        this.itemEditando = null;
        this.itemEditandoId = null;
        this.showModalPassword = false;
        this.showModalConfirmPassword = false;
        this.cambiarPassword = true; // Para crear siempre se requiere contraseña
        this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
        this.modalNombre = item.nombre;
        this.modalEmail = item.email;
        this.modalTelefono = item.telefono || '';
        this.modalRol = item.rol;
        this.modalPassword = '';
        this.modalConfirmPassword = '';
        this.modalError = '';
        this.modalTitulo = 'Editar Usuario';
        this.modalBotonTexto = 'Actualizar Usuario';
        this.itemEditando = item;
        this.itemEditandoId = item.id;
        this.showModalPassword = false;
        this.showModalConfirmPassword = false;
        this.cambiarPassword = false; // Por defecto no cambiar contraseña al editar
        this.mostrarModal = true;
    }

    cerrarModal() {
        this.mostrarModal = false;
    }

    toggleModalPasswordVisibility() {
        this.showModalPassword = !this.showModalPassword;
    }

    toggleModalConfirmPasswordVisibility() {
        this.showModalConfirmPassword = !this.showModalConfirmPassword;
    }

    onSubmitModal(form: any) {
        if (form.invalid || this.modalLoading) return;
        
        // Validaciones de contraseña
        if (this.cambiarPassword || !this.itemEditando) {
            if (!this.modalPassword.trim()) {
                this.modalError = this.itemEditando ? 'La nueva contraseña es requerida' : 'La contraseña es requerida';
                return;
            }

            if (this.modalPassword.length < 6) {
                this.modalError = 'La contraseña debe tener al menos 6 caracteres';
                return;
            }

            if (this.modalPassword !== this.modalConfirmPassword) {
                this.modalError = 'Las contraseñas no coinciden';
                return;
            }
        }
        
        this.modalLoading = true;
        this.modalError = '';

        const usuario: UsuarioDto = { 
            id: this.itemEditandoId ?? 0,
            nombre: this.modalNombre,
            email: this.modalEmail,
            telefono: this.modalTelefono,
            rol: this.modalRol,
            activo: true,
            lotesId: [],
            password: this.cambiarPassword ? this.modalPassword : undefined
        };

        if (this.itemEditando) {
            // Editar usuario existente
            this.usuarioService.actualizarUsuario(usuario).subscribe({
                next: (response: string) => {
                    console.log('Usuario editado:', response);
                    this.modalLoading = false;
                    this.cerrarModal();
                    this.cargarUsuarios();
                },
                error: (error: any) => {
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
        this.usuarioAEliminar = usuario;
        this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
        if (!this.usuarioAEliminar) return;
        this.confirmLoading = true;
        const usuario = this.usuarioAEliminar;

        this.usuarioService.eliminarUsuario(usuario.id).subscribe({
            next: (response: string) => {
                console.log('Usuario eliminado:', response);
                this.items = this.items.filter(i => i.id !== usuario.id);
                this.confirmLoading = false;
                this.mostrarConfirmEliminar = false;
                this.usuarioAEliminar = null;
            },
            error: (error: any) => {
                console.error('Error al eliminar usuario:', error);
                this.confirmLoading = false;
                this.mostrarConfirmEliminar = false;
                this.usuarioAEliminar = null;
                alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
            }
        });
    }

    cancelarEliminacion() {
        this.mostrarConfirmEliminar = false;
        this.usuarioAEliminar = null;
    }
}