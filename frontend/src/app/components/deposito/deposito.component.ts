import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DepositoDto } from '../../../models/Deposito.dto';
import { DepositoService } from '../../../services/DepositoService';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-deposito',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,
      CardModule,
      InputTextModule,
      ButtonModule,
      CheckboxModule
  ],
  templateUrl: './deposito.component.html',
  styleUrls: ['./deposito.component.scss']
})

export class DepositoComponent implements OnInit {
    depositoId: number | null = null;
    isEditMode: boolean = false;

    nombre: string = '';
    activo: boolean = true;

    constructor(
        private depositoService: DepositoService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.depositoId = +params['id'];
                this.isEditMode = true;
                this.loadDeposito();
            }
        });
    }

    loadDeposito() {
        if (this.depositoId) {
            this.depositoService.obtenerDeposito(this.depositoId).subscribe({
                next: (deposito) => {
                    this.nombre = deposito.nombre;
                    this.activo = deposito.activo;
                },
                error: (err) => console.error('Error cargando depósito', err)
            });
        }
    }

    saveDeposito() {
        const deposito: DepositoDto = {
            id: this.isEditMode ? this.depositoId : null,
            nombre: this.nombre,
            activo: this.activo
        };

        if (this.isEditMode) {
            this.depositoService.editarDeposito(deposito).subscribe({
                next: (msg) => {
                    console.log(msg);
                    this.router.navigate(['/listado-depositos']);
                },
                error: (err) => console.error('Error editando depósito', err)
            });
        } else {
            this.depositoService.crearDeposito(deposito).subscribe({
                next: (msg) => {
                    console.log(msg);
                    this.router.navigate(['/listado-depositos']);
                },
                error: (err) => console.error('Error creando depósito', err)
            });
        }
    }

    cancel() {
        this.router.navigate(['/listado-depositos']);
    }

    goToListado() {
        this.router.navigate(['/listado-depositos']);
    }
}
