import { Component, Input, OnInit, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PMSDto } from '../../../models/PMS.dto';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-pms',
  imports: [
      CommonModule,
      FormsModule,
      CardModule,
      InputTextModule,
      InputNumberModule,
      ButtonModule
  ],
  templateUrl: './pms.component.html',
  styleUrls: ['./pms.component.scss']
})

export class PmsComponent implements OnInit, OnChanges {
    @Input() itemEditando: PMSDto | null = null;
    @Output() modalCerrado = new EventEmitter<void>();

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

    ngOnInit() {
      this.cargarDatos();
    }

    ngOnChanges(changes: SimpleChanges) {
      if (changes['itemEditando']) {
        this.cargarDatos();
      }
    }

    private cargarDatos() {
      if (this.itemEditando) {
        console.log('Cargando datos para edición:', this.itemEditando);
        // Precargar datos cuando se está editando
        this.selectedMetodo = this.itemEditando.metodo || '';
        this.observaciones = this.itemEditando.observaciones || '';
        this.fechaMedicion = this.itemEditando.fechaMedicion || '';
        this.pesoMilSemillas = this.itemEditando.pesoMilSemillas || 0;
        this.humedadPorcentual = this.itemEditando.humedadPorcentual || 0;
      } else {
        console.log('Modo creación - limpiando campos');
        // Limpiar campos para creación
        this.selectedMetodo = '';
        this.observaciones = '';
        this.fechaMedicion = '';
        this.pesoMilSemillas = 0;
        this.humedadPorcentual = 0;
      }
    }

    onSubmit() {
      const pmsData: Partial<PMSDto> = {
        pesoMilSemillas: this.pesoMilSemillas,
        humedadPorcentual: this.humedadPorcentual,
        fechaMedicion: this.fechaMedicion,
        metodo: this.selectedMetodo,
        observaciones: this.observaciones,
        activo: true
      };

      if (this.itemEditando) {
        // Actualizar PMS existente
        console.log('Actualizando PMS:', { ...this.itemEditando, ...pmsData });
      } else {
        // Crear nuevo PMS
        console.log('Creando nuevo PMS:', pmsData);
      }

      // Cerrar modal
      this.modalCerrado.emit();
    }
}
