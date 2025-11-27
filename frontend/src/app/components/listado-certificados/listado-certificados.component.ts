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

@Component({
  selector: 'app-listado-certificados',
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    ButtonModule, 
    InputTextModule,
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

    get itemsFiltrados() {
        return this.items.filter(item => {
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
        if (!certificado.id) {
            alert('Error: El certificado no tiene un ID válido.');
            return;
        }

        const numeroCertificado = certificado.numeroCertificado || 'este certificado';
        const confirmar = confirm(`¿Estás seguro de que quieres eliminar el certificado "${numeroCertificado}"?`);
        
        if (!confirmar) {
            return;
        }

        const certificadoId = certificado.id;

        this.certificadoService.eliminarCertificado(certificadoId).subscribe({
            next: (response: string) => {
                console.log('Certificado eliminado:', response);
                alert('Certificado eliminado correctamente.');
                this.items = this.items.filter(i => i.id !== certificado.id);
            },
            error: (error: any) => {
                console.error('Error al eliminar certificado:', error);
                alert('Error al eliminar el certificado. Por favor, inténtalo de nuevo.');
            }
        });
    }
}

