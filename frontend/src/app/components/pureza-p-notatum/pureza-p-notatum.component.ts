import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-pureza-p-notatum',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule
  ],
  templateUrl: './pureza-p-notatum.component.html',
  styleUrl: './pureza-p-notatum.component.scss'
})
export class PurezaPNotatumComponent implements OnInit {
  // Variables para manejar navegación
  isEditing: boolean = false;
  editingId: number | null = null;

  // Propiedades para checkboxes
  repetido: boolean = false;
  estandar: boolean = false;

  fecha: string = '';
  pesoInicialGr: number = 0;
  pesoInicialRedondeo: number = 0;
  pesoInicialPct: number = 0;
  semillaPuraGr: number = 0;
  semillaPuraRedondeo: number = 0;
  semillaPuraPct: number = 0;
  semillaCultivosGr: number = 0;
  semillaCultivosRedondeo: number = 0;
  semillaCultivosPct: number = 0;
  semillaMalezasGr: number = 0;
  semillaMalezasRedondeo: number = 0;
  semillaMalezasPct: number = 0;
  materiaInerteGr: number = 0;
  materiaInerteRedondeo: number = 0;
  materiaInertePct: number = 0;
  pesoFinalGr: number = 0;
  pesoFinalRedondeo: number = 0;
  pesoFinalPct: number = 0;
  // Totales para mostrar en el template
  get totalSemillasSanasPeso(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (rep.semillasSanasPeso || 0), 0);
  }
  get totalSemillasContaminadasPeso(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (rep.semillasContaminadasPeso || 0), 0);
  }

  repeticiones: Array<{
    numero: number;
    semillasPuras: number;
    pesoSemillasPuras: number;
    semillasSanasCantidad: number;
    semillasSanasPeso: number;
    semillasContaminadasCantidad: number;
    semillasContaminadasPeso: number;
    controlPesos: number;
  }> = [
    {
      numero: 1,
      semillasPuras: 0,
      pesoSemillasPuras: 0,
      semillasSanasCantidad: 0,
      semillasSanasPeso: 0,
      semillasContaminadasCantidad: 0,
      semillasContaminadasPeso: 0,
      controlPesos: 0
    }
  ];

  // Datos de prueba (deberían venir de un servicio)
  private itemsData: any[] = [
    {
      id: 1,
      fecha: '2023-01-15',
      pesoInicialGr: 100,
      pesoInicialPct: 0,
      semillaPuraGr: 80,
      semillaPuraPct: 80,
      semillaCultivosGr: 10,
      semillaCultivosPct: 10,
      semillaMalezasGr: 5,
      semillaMalezasPct: 5,
      materiaInerteGr: 5,
      materiaInertePct: 5,
      pesoFinalGr: 100,
      pesoFinalPct: 100,
      repeticiones: [
        {
          numero: 1,
          semillasPuras: 50,
          pesoSemillasPuras: 40,
          semillasSanasCantidad: 45,
          semillasSanasPeso: 35,
          semillasContaminadasCantidad: 5,
          semillasContaminadasPeso: 5,
          controlPesos: 40
        }
      ]
    }
    // ...otros datos de prueba
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
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

  cargarDatosParaEdicion(id: number) {
    const item = this.itemsData.find(pureza => pureza.id === id);
    if (item) {
      this.fecha = item.fecha || '';
      this.pesoInicialGr = item.pesoInicialGr || 0;
      this.pesoInicialPct = item.pesoInicialPct || 0;
      this.semillaPuraGr = item.semillaPuraGr || 0;
      this.semillaPuraPct = item.semillaPuraPct || 0;
      this.semillaCultivosGr = item.semillaCultivosGr || 0;
      this.semillaCultivosPct = item.semillaCultivosPct || 0;
      this.semillaMalezasGr = item.semillaMalezasGr || 0;
      this.semillaMalezasPct = item.semillaMalezasPct || 0;
      this.materiaInerteGr = item.materiaInerteGr || 0;
      this.materiaInertePct = item.materiaInertePct || 0;
      this.pesoFinalGr = item.pesoFinalGr || 0;
      this.pesoFinalPct = item.pesoFinalPct || 0;
      this.repeticiones = item.repeticiones || [
        {
          numero: 1,
          semillasPuras: 0,
          pesoSemillasPuras: 0,
          semillasSanasCantidad: 0,
          semillasSanasPeso: 0,
          semillasContaminadasCantidad: 0,
          semillasContaminadasPeso: 0,
          controlPesos: 0
        }
      ];
    }
  }

  cargarDatos() {
    this.fecha = '';
    this.pesoInicialGr = 0;
    this.pesoInicialPct = 0;
    this.semillaPuraGr = 0;
    this.semillaPuraPct = 0;
    this.semillaCultivosGr = 0;
    this.semillaCultivosPct = 0;
    this.semillaMalezasGr = 0;
    this.semillaMalezasPct = 0;
    this.materiaInerteGr = 0;
    this.materiaInertePct = 0;
    this.pesoFinalGr = 0;
    this.pesoFinalPct = 0;
    this.repeticiones = [
      {
        numero: 1,
        semillasPuras: 0,
        pesoSemillasPuras: 0,
        semillasSanasCantidad: 0,
        semillasSanasPeso: 0,
        semillasContaminadasCantidad: 0,
        semillasContaminadasPeso: 0,
        controlPesos: 0
      }
    ];
  }

  agregarRepeticion() {
    const nextNum = this.repeticiones.length + 1;
    this.repeticiones.push({
      numero: nextNum,
      semillasPuras: 0,
      pesoSemillasPuras: 0,
      semillasSanasCantidad: 0,
      semillasSanasPeso: 0,
      semillasContaminadasCantidad: 0,
      semillasContaminadasPeso: 0,
      controlPesos: 0
    });
  }

  eliminarRepeticion(idx: number) {
    if (this.repeticiones.length > 1) {
      this.repeticiones.splice(idx, 1);
      this.repeticiones.forEach((r, i) => r.numero = i + 1);
    }
  }

  onSubmit() {
    const purezaData: any = {
      fecha: this.fecha,
      pesoInicialGr: this.pesoInicialGr,
      pesoInicialPct: this.pesoInicialPct,
      semillaPuraGr: this.semillaPuraGr,
      semillaPuraPct: this.semillaPuraPct,
      semillaCultivosGr: this.semillaCultivosGr,
      semillaCultivosPct: this.semillaCultivosPct,
      semillaMalezasGr: this.semillaMalezasGr,
      semillaMalezasPct: this.semillaMalezasPct,
      materiaInerteGr: this.materiaInerteGr,
      materiaInertePct: this.materiaInertePct,
      pesoFinalGr: this.pesoFinalGr,
      pesoFinalPct: this.pesoFinalPct,
      repeticiones: this.repeticiones
    };
    if (this.isEditing && this.editingId) {
      // Actualizar Pureza existente
      console.log('Actualizando Pureza P. notatum ID:', this.editingId, 'con datos:', purezaData);
    } else {
      // Crear nueva Pureza
      console.log('Creando nueva Pureza P. notatum:', purezaData);
    }
    // Navegar de vuelta al listado
    this.router.navigate(['/listado-pureza-p-notatum']);
  }

  onCancel() {
    // Navegar de vuelta al listado
    this.router.navigate(['/listado-pureza-p-notatum']);
  }
}
