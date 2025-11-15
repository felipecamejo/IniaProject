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
import { AutocompletadoDto } from '../../../models/Autocompletado.dto';
import { AutocompletadoService } from '../../../services/AutocompletadoService';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listado-autocompletados.component',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule, ConfirmDialogComponent],
  templateUrl: './listado-autocompletados.component.html',
  styleUrls: ['./listado-autocompletados.component.scss']
})
export class ListadoAutocompletadosComponent implements OnInit, OnDestroy {
    constructor(private router: Router, private authService: AuthService, private autocompletadoService: AutocompletadoService) {}

    searchText: string = '';
    private navigationSubscription: any;

    // Variables para el modal
    mostrarModal: boolean = false;
    modalTipoDato: string = '';
    modalParametro: string = '';
    modalValor: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Autocompletado';
    modalBotonTexto: string = 'Crear Autocompletado';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

    items: AutocompletadoDto[] = [];

    // Popup de confirmación de eliminación
    mostrarConfirmEliminar: boolean = false;
    autocompletadoAEliminar: AutocompletadoDto | null = null;
    confirmLoading: boolean = false;

    // Lista de parámetros disponibles para el select
    parametrosDisponibles: Array<{label: string, value: string}> = [
        // Campos del Recibo
        { label: 'Especie', value: 'especie' },
        { label: 'N° Análisis (nLab)', value: 'nLab' },
        { label: 'Origen', value: 'origen' },
        { label: 'Remitente', value: 'remite' },
        { label: 'Observaciones (Recibo)', value: 'observaciones' },
        { label: 'Ficha', value: 'ficha' },
        // Campos de Análisis de Pureza
        { label: 'Materia Inerte Tipo (INIA)', value: 'materiaInerteTipo' },
        { label: 'Materia Inerte Tipo (INASE)', value: 'materiaInerteTipoInase' },
        // Campos de Análisis de Germinación
        { label: 'Producto y Dosis', value: 'productoDosis' },
        { label: 'Comentarios (Germinación)', value: 'comentarios' },
        // Campos de Análisis Sanitario
        { label: 'Método (Sanitario)', value: 'metodo' },
        { label: 'Estado (Sanitario)', value: 'estado' },
        { label: 'Observaciones (Sanitario)', value: 'observaciones' },
        // Campos de Análisis de Tetrazolio
        { label: 'Pretratamiento Custom', value: 'pretratamientoCustom' },
        // Campos de Certificado
        { label: 'Responsable Muestreo', value: 'responsableMuestreo' },
        // Observaciones específicas por análisis
        { label: 'Observaciones Pureza', value: 'observacionesPureza' },
        { label: 'Observaciones Germinación', value: 'observacionesGerminacion' },
        { label: 'Observaciones Sanitario', value: 'observacionesSanitario' },
        { label: 'Observaciones Tetrazolio', value: 'observacionesTetrazolio' },
        { label: 'Observaciones DOSN', value: 'observacionesDOSN' },
        { label: 'Observaciones PMS', value: 'observacionesPMS' }
    ];

    ngOnInit(): void {
        this.cargarAutocompletados();
        
        // Suscribirse a cambios de navegación para recargar cuando se regrese
        this.navigationSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.url === '/listado-autocompletados') {
                    this.cargarAutocompletados();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    cargarAutocompletados(): void {
        this.autocompletadoService.listar().subscribe({
            next: (response) => {
                this.items = response?.autocompletados ?? [];
            },
            error: (error) => {
                console.error('Error al listar autocompletados', error);
                this.items = [];
            }
        });
    }

    get itemsFiltrados() {
      return this.items.filter(item => {
        const cumpleParametro = !this.searchText || 
          item.parametro.toLowerCase().includes(this.searchText.toLowerCase());
        const cumpleValor = !this.searchText || 
          item.valor.toLowerCase().includes(this.searchText.toLowerCase());
        const cumpleTipoDato = !this.searchText || 
          item.tipoDato.toLowerCase().includes(this.searchText.toLowerCase());
        
        return cumpleParametro || cumpleValor || cumpleTipoDato;
      });
    }

    crearItem() {
      const dto: AutocompletadoDto = { 
        id: 0, 
        tipoDato: this.modalTipoDato, 
        parametro: this.modalParametro,
        valor: this.modalValor,
        activo: true
      };
      
      this.autocompletadoService.crear(dto).subscribe({
        next: (response) => {
          console.log('Autocompletado creado:', response);
          this.cargarAutocompletados();
        },
        error: (error) => {
          console.error('Error al crear autocompletado:', error);
        }
      });
    }

    abrirModal() {
      this.modalTipoDato = '';
      this.modalParametro = '';
      this.modalValor = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Autocompletado';
      this.modalBotonTexto = 'Crear Autocompletado';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalTipoDato = item.tipoDato || '';
      this.modalParametro = item.parametro || '';
      this.modalValor = item.valor || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Autocompletado';
      this.modalBotonTexto = 'Actualizar Autocompletado';
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

      const autocompletado: AutocompletadoDto = { 
        id: this.itemEditandoId ?? 0,
        tipoDato: this.modalTipoDato,
        parametro: this.modalParametro,
        valor: this.modalValor,
        activo: true
      };

      if (this.itemEditando) {
        // Editar autocompletado existente
        this.autocompletadoService.editar(autocompletado).subscribe({
          next: (response) => {
            console.log('Autocompletado editado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarAutocompletados();
          },
          error: (error) => {
            console.error('Error al editar autocompletado:', error);
            this.modalError = 'Error al actualizar el autocompletado';
            this.modalLoading = false;
          }
        });
      } else {
        // Crear nuevo autocompletado
        this.autocompletadoService.crear(autocompletado).subscribe({
          next: (response) => {
            console.log('Autocompletado creado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarAutocompletados();
          },
          error: (error) => {
            console.error('Error al crear autocompletado:', error);
            this.modalError = 'Error al crear el autocompletado';
            this.modalLoading = false;
          }
        });
      }
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    editarItem(item: any) {
      this.abrirModalEdicion(item);
    }

    eliminarItem(autocompletado: AutocompletadoDto) {
      this.autocompletadoAEliminar = autocompletado;
      this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
      const autocompletado = this.autocompletadoAEliminar;
      if (!autocompletado || autocompletado.id == null) return;
      this.confirmLoading = true;
      this.autocompletadoService.eliminar(autocompletado.id).subscribe({
        next: (response) => {
          console.log('Autocompletado eliminado:', response);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.autocompletadoAEliminar = null;
          this.cargarAutocompletados();
        },
        error: (error) => {
          console.error('Error al eliminar autocompletado:', error);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.autocompletadoAEliminar = null;
          alert('Error al eliminar el autocompletado');
        }
      });
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.autocompletadoAEliminar = null;
    }
}

