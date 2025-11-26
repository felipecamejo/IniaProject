import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CertificadoService } from '../../../services/CertificadoService';
import { CertificadoDto, TipoCertificado } from '../../../models/Certificado.dto';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listado-certificados',
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    ButtonModule, 
    InputTextModule,
    ConfirmDialogComponent
  ],
  templateUrl: './listado-certificados.component.html',
  styleUrls: ['./listado-certificados.component.scss']
})
export class ListadoCertificadosComponent implements OnInit, OnDestroy {
    constructor(
        private router: Router, 
        private certificadoService: CertificadoService
    ) {}

    searchText: string = '';
    selectedTipo: string = '';
    items: CertificadoDto[] = [];
    private navigationSubscription: any;

    // Popup de confirmación de eliminación
    mostrarConfirmEliminar: boolean = false;
    certificadoAEliminar: CertificadoDto | null = null;
    confirmLoading: boolean = false;

    ngOnInit(): void {
        this.cargarCertificados();
        
        // Suscribirse a cambios de navegación para recargar cuando se regrese de crear/editar
        this.navigationSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.url === '/listado-certificados') {
                    this.cargarCertificados();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    cargarCertificados(): void {
        this.certificadoService.listar().subscribe({
            next: (certificados) => {
                this.items = certificados || [];
            },
            error: (error) => {
                console.error('Error al listar certificados', error);
                this.items = [];
            }
        });
    }


        // Paginación
        page = 0; // 0-based
        size = 12;
        totalElements = 0;
        totalPages = 0;

        get itemsFiltrados() {
                const filtrados = this.items.filter(item => {
                        const cumpleBusqueda = !this.searchText || 
                                (item.numeroCertificado && item.numeroCertificado.toLowerCase().includes(this.searchText.toLowerCase())) ||
                                (item.nombreSolicitante && item.nombreSolicitante.toLowerCase().includes(this.searchText.toLowerCase())) ||
                                (item.especie && item.especie.toLowerCase().includes(this.searchText.toLowerCase())) ||
                                (item.cultivar && item.cultivar.toLowerCase().includes(this.searchText.toLowerCase())) ||
                                (item.numeroLote && item.numeroLote.toLowerCase().includes(this.searchText.toLowerCase()));
            
                        const cumpleTipo = !this.selectedTipo || 
                                item.tipoCertificado === this.selectedTipo;
            
                        return cumpleBusqueda && cumpleTipo;
                });

                // Calcular paginación
                this.totalElements = filtrados.length;
                this.totalPages = Math.ceil(this.totalElements / this.size);

                // Paginar los resultados
                const startIndex = this.page * this.size;
                const endIndex = startIndex + this.size;
                return filtrados.slice(startIndex, endIndex);
        }

        nextPage(): void {
            if (this.page < this.totalPages - 1) {
                this.page++;
            }
        }

        prevPage(): void {
            if (this.page > 0) {
                this.page--;
            }
        }

        onPageSizeChange(value: string): void {
            const newSize = parseInt(value, 10);
            if (!isNaN(newSize) && newSize > 0) {
                this.size = newSize;
                this.page = 0; // Reset a primera página
            }
        }

        getFirstItemIndex(): number {
            if (this.totalElements === 0) return 0;
            return this.page * this.size + 1;
        }

        getLastItemIndex(): number {
            if (this.totalElements === 0) return 0;
            const endIndex = this.page * this.size + this.itemsFiltrados.length;
            return endIndex;
        }

    getTipoLabel(tipo: TipoCertificado | null): string {
        if (!tipo) return 'Sin tipo';
        switch (tipo) {
            case TipoCertificado.DEFINITIVO:
                return 'Definitivo';
            case TipoCertificado.PROVISORIO:
                return 'Provisorio';
            default:
                return 'Sin tipo';
        }
    }

    formatearFecha(fecha: string | null): string {
        if (!fecha) return 'Sin fecha';
        try {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
        } catch {
            return 'Fecha inválida';
        }
    }

    verItem(certificado: CertificadoDto) {
        if (certificado.id) {
            this.router.navigate(['/certificado', certificado.id], { queryParams: { view: 'true' } });
        }
    }

    editarItem(certificado: CertificadoDto) {
        if (certificado.id) {
            this.router.navigate(['/certificado/editar', certificado.id]);
        }
    }

    goToHome() {
        this.router.navigate(['/home']);
    }

    eliminarItem(certificado: CertificadoDto) {
        this.certificadoAEliminar = certificado;
        this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
        if (!this.certificadoAEliminar || !this.certificadoAEliminar.id) return;
        this.confirmLoading = true;
        const certificado = this.certificadoAEliminar;
        const certificadoId = certificado.id;

        if (!certificadoId) return;

        this.certificadoService.eliminarCertificado(certificadoId).subscribe({
            next: (response: string) => {
                console.log('Certificado eliminado:', response);
                this.items = this.items.filter(i => i.id !== certificado.id);
                this.confirmLoading = false;
                this.mostrarConfirmEliminar = false;
                this.certificadoAEliminar = null;
            },
            error: (error: any) => {
                console.error('Error al eliminar certificado:', error);
                this.confirmLoading = false;
                this.mostrarConfirmEliminar = false;
                this.certificadoAEliminar = null;
                alert('Error al eliminar el certificado. Por favor, inténtalo de nuevo.');
            }
        });
    }

    cancelarEliminacion() {
        this.mostrarConfirmEliminar = false;
        this.certificadoAEliminar = null;
    }
}

