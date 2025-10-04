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
    isEditing: boolean = false;
    editingId: number | null = null;

    // Campos del nuevo DTO
    gramosPorRepeticiones: number[] = [];
    pesoPromedioCienSemillas: number | null = null;
    pesoMilSemillas: number | null = null;
    pesoPromedioMilSemillas: number | null = null;
    desvioEstandar: number | null = null;
    coeficienteVariacion: number | null = null;
    comentarios: string = '';
    activo: boolean = true;
    repetido: boolean = false;
    reciboId: number | null = null;
    fechaCreacion: string | null = null;
    fechaRepeticion: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditing = true;
                this.editingId = parseInt(params['id']);
                // Aquí deberías cargar los datos reales desde el servicio
            } else {
                this.isEditing = false;
                this.editingId = null;
                this.limpiarCampos();
            }
        });
    }

    limpiarCampos() {
      this.gramosPorRepeticiones = [];
      this.pesoPromedioCienSemillas = null;
      this.pesoMilSemillas = null;
      this.pesoPromedioMilSemillas = null;
      this.desvioEstandar = null;
      this.coeficienteVariacion = null;
      this.comentarios = '';
      this.activo = true;
      this.repetido = false;
      this.reciboId = null;
      this.fechaCreacion = null;
      this.fechaRepeticion = null;
    }

    onSubmit() {
      const pmsData: PMSDto = {
        id: this.editingId ?? null,
        gramosPorRepeticiones: this.gramosPorRepeticiones,
        pesoPromedioCienSemillas: this.pesoPromedioCienSemillas,
        pesoMilSemillas: this.pesoMilSemillas,
        pesoPromedioMilSemillas: this.pesoPromedioMilSemillas,
        desvioEstandar: this.desvioEstandar,
        coeficienteVariacion: this.coeficienteVariacion,
        comentarios: this.comentarios,
        activo: this.activo,
        repetido: this.repetido,
        reciboId: this.reciboId,
        fechaCreacion: this.fechaCreacion,
        fechaRepeticion: this.fechaRepeticion
      };
      if (this.isEditing && this.editingId) {
        // Actualizar PMS existente
        console.log('Actualizando PMS ID:', this.editingId, 'con datos:', pmsData);
      } else {
        // Crear nuevo PMS
        console.log('Creando nuevo PMS:', pmsData);
      }
      this.router.navigate(['/listado-pms']);
    }

    onCancel() {
      this.router.navigate(['/listado-pms']);
    }
}
