import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PMSDto } from '../../../models/PMS.dto';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-pms',
  imports: [
      CommonModule,
      FormsModule,
      CardModule,
      InputTextModule,
      ButtonModule
  ],
  templateUrl: './pms.component.html',
  styleUrls: ['./pms.component.scss']
})

export class PmsComponent implements OnInit {
    // Variables para manejar navegación
    isEditing: boolean = false;
    editingId: number | null = null;

    metodos = [
      { label: 'Manual', id: 'Manual' },
      { label: 'Automático', id: 'Automático' }
    ];

    selectedMetodo: string = '';

    // Campos del formulario
    fechaMedicion: string = '';
    observaciones: string = '';
    pesoMilSemillas: number = 0;
    humedadPorcentual: number = 0;
    repetido: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        // Verificar si estamos en modo edición basado en la ruta
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditing = true;
                this.editingId = parseInt(params['id']);
                this.cargarDatosParaEdicion(this.editingId);
            } else {
                this.isEditing = false;
                this.editingId = null;
                this.cargarDatos();
            }
        });
    }



    // Datos de prueba (deberían venir de un servicio)
    private itemsData: PMSDto[] = [
      {
        id: 1,
        pesoMilSemillas: 25.5,
        humedadPorcentual: 12.3,
        fechaMedicion: '2023-01-15',
        metodo: 'Manual',
        observaciones: 'Control de calidad mensual - Muestra estándar',
        activo: true,
        repetido: false,
        reciboId: 101,
        fechaCreacion: '2023-01-15',
        fechaRepeticion: null
      },
      {
        id: 2,
        pesoMilSemillas: 23.8,
        humedadPorcentual: 11.7,
        fechaMedicion: '2022-02-20',
        metodo: 'Automático',
        observaciones: 'Lote especial - Requiere repetición',
        activo: true,
        repetido: true,
        reciboId: 102,
        fechaCreacion: '2022-02-20',
        fechaRepeticion: '2022-02-22'
      },
      {
        id: 3,
        pesoMilSemillas: 26.1,
        humedadPorcentual: 13.2,
        fechaMedicion: '2023-03-10',
        metodo: 'Manual',
        observaciones: 'Inspección rutinaria de equipos - Repetir análisis',
        activo: true,
        repetido: true,
        reciboId: 103,
        fechaCreacion: '2023-03-10',
        fechaRepeticion: '2023-03-12'
      }
    ];

    private cargarDatosParaEdicion(id: number) {
      // En un escenario real, esto vendría de un servicio
      const item = this.itemsData.find(pms => pms.id === id);
      if (item) {
        console.log('Cargando datos para edición:', item);
        this.selectedMetodo = item.metodo || '';
        this.observaciones = item.observaciones || '';
        this.fechaMedicion = item.fechaMedicion || '';
        this.pesoMilSemillas = item.pesoMilSemillas || 0;
        this.humedadPorcentual = item.humedadPorcentual || 0;
        this.repetido = item.repetido || false;
      }
    }

    private cargarDatos() {
      console.log('Modo creación - limpiando campos');
      // Limpiar campos para creación
      this.selectedMetodo = '';
      this.observaciones = '';
      this.fechaMedicion = '';
      this.pesoMilSemillas = 0;
      this.humedadPorcentual = 0;
      this.repetido = false;
    }

    onSubmit() {
      const pmsData: Partial<PMSDto> = {
        pesoMilSemillas: this.pesoMilSemillas,
        humedadPorcentual: this.humedadPorcentual,
        fechaMedicion: this.fechaMedicion,
        metodo: this.selectedMetodo,
        observaciones: this.observaciones,
        repetido: this.repetido,
        activo: true
      };

      if (this.isEditing && this.editingId) {
        // Actualizar PMS existente
        console.log('Actualizando PMS ID:', this.editingId, 'con datos:', pmsData);
      } else {
        // Crear nuevo PMS
        console.log('Creando nuevo PMS:', pmsData);
      }

      // Navegar de vuelta al listado
      this.router.navigate(['/listado-pms']);
    }

    onCancel() {
      // Navegar de vuelta al listado
      this.router.navigate(['/listado-pms']);
    }
}
