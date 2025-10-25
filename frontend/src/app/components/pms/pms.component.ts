import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PMSService } from '../../../services/PMSService';
import { GramosPmsService } from '../../../services/GramosPmsService';
import { GramosPmsDto } from '../../../models/GramosPms.dto';
import { UrlService } from '../../../services/url.service';
import { PMSDto } from '../../../models/PMS.dto';
import { DateService } from '../../../services/DateService';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';

// Interface para manejar las repeticiones en PMS
export interface RepeticionPMS {
  numero: number;
  gramos: number;
}

@Component({
  selector: 'app-pms',
  imports: [
      CommonModule,
      FormsModule,
      CardModule,
      InputTextModule,
      ButtonModule,
      InputNumberModule,
      TableModule
  ],
  templateUrl: './pms.component.html',
  styleUrls: ['./pms.component.scss']
})

export class PmsComponent implements OnInit {
    isEditing: boolean = false;
    isViewing: boolean = false;
    editingId: number | null = null;

    loteId: string | null = '';
    reciboId: string | null = '';

    // Tabla de repeticiones PMS
    repeticiones: RepeticionPMS[] = [];

  // Mantener ids de GramosPms (si existen) para edición
  gramosEntries: GramosPmsDto[] = [];
  // IDs de gramos marcados para eliminación en edición
  deletedGramosIds: number[] = [];

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
    estandar: boolean = false;
    fechaCreacion: string | null = null;
    fechaRepeticion: string | null = null;

    // Properties referenced in template
    humedadPorcentual: number | null = null;
    fechaMedicion: string = '';
    selectedMetodo: string = '';

    // Agregar propiedades para manejar errores
    errores: string[] = [];

    isSaving: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pmsService: PMSService,
    private gramosPmsService: GramosPmsService
  ) {}

    ngOnInit() {

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.editingId = parseInt(params['id']);
                // Verificar si es modo visualización por query parameter
                this.route.queryParams.subscribe(queryParams => {
                    this.isViewing = queryParams['view'] === 'true';
                    this.isEditing = !this.isViewing;
                });
        // Cargar los datos reales desde el servicio
        if (this.editingId) {
          this.pmsService.obtener(this.editingId).subscribe({
            next: (data: PMSDto) => {
              console.log('PMS obtenido para editar:', data);
              // Mapear los campos del DTO al formulario local (campos en PMSDto)
              this.pesoPromedioCienSemillas = data.pesoPromedioCienSemillas;
              this.pesoMilSemillas = data.pesoMilSemillas;
              this.pesoPromedioMilSemillas = data.pesoPromedioMilSemillas;
              this.desvioEstandar = data.desvioEstandar;
              this.coeficienteVariacion = data.coeficienteVariacion;
              this.comentarios = data.comentarios || '';
              this.activo = data.activo ?? true;
              this.repetido = data.repetido ?? false;
              this.humedadPorcentual = data.humedadPorcentual ?? null;
              this.fechaMedicion = data.fechaMedicion ? data.fechaMedicion.split('T')[0] : '';
              this.reciboId = this.route.snapshot.params['reciboId'];
              this.fechaCreacion = data.fechaCreacion || null;
              this.fechaRepeticion = data.fechaRepeticion || null;
              // Cargar los gramos asociados a este PMS (entidad separada)
              this.gramosPmsService.listarGramosPorPms(this.editingId!).subscribe({
                next: (grams: GramosPmsDto[]) => {
                  console.log('Gramos cargados para edición:', grams);
                  if (grams && grams.length > 0) {
                    this.gramosEntries = grams.map((g, index) => ({ 
                      id: g.id ?? null, 
                      pmsId: g.pmsId ?? null,
                      gramos: g.gramos ?? 0, 
                      activo: g.activo ?? true
                    } as GramosPmsDto));
                    this.repeticiones = this.gramosEntries.map((g, index) => ({ numero: index + 1, gramos: g.gramos! }));
                    console.log('Gramos del backend:', grams);
                    console.log('GramosEntries mapeados:', this.gramosEntries);
                    console.log('Repeticiones mapeadas:', this.repeticiones);
                  } else {
                    // fallback a lo local si no hay registros - sin repeticiones por defecto
                    this.gramosEntries = [];
                    this.repeticiones = [];
                  }
                },
                error: (err) => {
                  console.error('Error cargando gramos PMS:', err);
                  // Sin repeticiones por defecto en caso de error
                  this.gramosEntries = [];
                  this.repeticiones = [];
                }
              });
            },
            error: (err) => {
              console.error('Error obteniendo PMS:', err);
              // Podrías navegar al listado o mostrar mensaje
            }
          });
        }
            } else {
                this.isEditing = false;
                this.isViewing = false;
                this.editingId = null;
                this.limpiarCampos();
            }
        });
    }

    // Getter para determinar si está en modo readonly
    get isReadonly(): boolean {
        return this.isViewing;
    }

    // Métodos para manejar las repeticiones
    agregarRepeticion() {
        const nuevoNumero = this.repeticiones.length + 1;
        this.repeticiones.push({
            numero: nuevoNumero,
            gramos: 0
        });
        this.gramosEntries.push({ 
            id: null, 
            pmsId: null, 
            gramos: 0, 
            activo: true
        } as GramosPmsDto);
        console.log('Repetición agregada. Total repeticiones:', this.repeticiones.length);
    }

    eliminarRepeticion(index: number) {
        if (this.repeticiones.length > 0) {
            this.repeticiones.splice(index, 1);
            // Re-enumerar repeticiones
            this.repeticiones.forEach((r, i) => r.numero = i + 1);
            
            // sincronizar gramosEntries (GramosPmsDto[])
            const removed: GramosPmsDto[] = this.gramosEntries.splice(index, 1);
            if (removed && removed.length > 0 && removed[0].id) {
                this.deletedGramosIds.push(removed[0].id as number);
            }
            
            // Los gramosEntries se mantienen sincronizados por índice con las repeticiones
            console.log('Repetición eliminada. Total repeticiones:', this.repeticiones.length);
            console.log('GramosEntries después de eliminar (GramosPmsDto[]):', this.gramosEntries);
        }
    }

    // Método para sincronizar cambios de gramos desde el input
    onGramosChange(index: number, value: any) {
        const numericValue = parseFloat(value) || 0;
        console.log(`Cambiando gramos en índice ${index} a valor ${numericValue}`);
        
        // Actualizar tanto repeticiones como gramosEntries
        if (this.repeticiones[index]) {
            this.repeticiones[index].gramos = numericValue;
        }
        if (this.gramosEntries[index]) {
            this.gramosEntries[index].gramos = numericValue;
            // Los gramosEntries se mantienen sincronizados por índice
        }
        console.log('Repeticiones actualizadas:', this.repeticiones);
        console.log('GramosEntries actualizados (GramosPmsDto[]):', this.gramosEntries);
    }


    limpiarCampos() {
      this.repeticiones = [];
      this.gramosPorRepeticiones = [];
      this.gramosEntries = [];
      this.deletedGramosIds = [];
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
      if (this.isSaving) return;

      // Verificar si hay errores antes de continuar
      if (this.manejarProblemas()) {
        console.error('Errores detectados:', this.errores);
        this.isSaving = false;
        return;
      }

      this.isSaving = true;

      // Convertir repeticiones a array de gramos
      this.gramosPorRepeticiones = this.repeticiones.map(rep => rep.gramos);

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
        reciboId: this.route.snapshot.params['reciboId'] ? Number(this.route.snapshot.params['reciboId']) : null,
        fechaMedicion: this.fechaMedicion ? this.fechaMedicion.split('T')[0] : null,
        fechaCreacion: this.fechaCreacion ? this.fechaCreacion.split('T')[0] : null,
        fechaRepeticion: this.fechaRepeticion ? this.fechaRepeticion.split('T')[0] : null,
        humedadPorcentual: this.humedadPorcentual ?? null, // Asegurar que se incluya
        estandar: this.estandar
      };

      console.log("fechaMedicion antes de ajustar:", pmsData.fechaMedicion);
      console.log("fechaCreacion antes de ajustar:", pmsData.fechaCreacion);
      console.log("fechaRepeticion antes de ajustar:", pmsData.fechaRepeticion);

      console.log('📋 PMS DTO:', pmsData);

      if (this.isEditing && this.editingId) {
        this.actualizarPms(pmsData);
      } else {
        this.crearNuevoPms(pmsData);
      }
    }

    private crearNuevoPms(pmsData: PMSDto) {
      pmsData.fechaCreacion = DateService.ajustarFecha(new Date().toISOString().split('T')[0]);
      console.log('Creando nuevo PMS:', pmsData);
      this.pmsService.crear(pmsData).subscribe({
        next: (res) => {
          console.log('PMS creado correctamente:', res);
          // Guardar gramos asociados al PMS
          this.guardarGramos(res);
          this.onCancel();
        },
        error: (err) => {
          console.error('Error creando PMS:', err);
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }

    private actualizarPms(pmsData: PMSDto) {

      console.log('Actualizando PMS ID:', this.editingId, 'con datos:', pmsData);
      this.pmsService.editar(pmsData).subscribe({
        next: (res) => {
          console.log('PMS actualizado correctamente:', res);
          // Guardar gramos asociados al PMS
          this.guardarGramos(this.editingId!);
          this.onCancel();
        },
        error: (err) => {
          console.error('Error actualizando PMS:', err);
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }

    private guardarGramos(pmsId: number) {
      const gramosPayload = this.gramosEntries.map(entry => ({
        id: entry.id,
        pmsId: pmsId,
        gramos: entry.gramos,
        activo: entry.activo
      }));

      // Crear o recrear todos los gramos asociados al PMS
      this.gramosPmsService.crearMultiplesGramos(gramosPayload).subscribe({
        next: () => console.log('Gramos creados correctamente para el PMS:', pmsId),
        error: (error: any) => console.error('Error creando gramos para el PMS:', error)
      });
    }

    manejarProblemas(): boolean {
    this.errores = []; // Reiniciar errores

    const hoy = new Date();
    const fecha = this.fechaMedicion ? new Date(this.fechaMedicion) : null;

    if (this.pesoMilSemillas != null && this.pesoMilSemillas < 0) {
      this.errores.push('El peso de mil semillas no puede ser un número negativo.');
    }

    if (this.pesoPromedioMilSemillas != null && this.pesoPromedioMilSemillas < 0) {
      this.errores.push('El peso promedio de mil semillas no puede ser un número negativo.');
    }

    if (this.pesoPromedioCienSemillas != null && this.pesoPromedioCienSemillas < 0) {
      this.errores.push('El peso promedio de cien semillas no puede ser un número negativo.');
    }

    if (this.desvioEstandar != null && this.desvioEstandar < 0) {
      this.errores.push('El desvío estándar no puede ser un número negativo.');
    }

    if (this.humedadPorcentual != null && this.humedadPorcentual < 0 && this.humedadPorcentual > 100) {
      this.errores.push('La humedad porcentual debe estar entre 0 y 100.');
    }

    if (this.gramosEntries.some(h => h.gramos != null && h.gramos < 0)) {

      this.errores.push('Algunos hongos tienen un número de gramos negativo.');
    }

    if (fecha != null && fecha > hoy) {
      this.errores.push('La fecha no puede ser mayor a la fecha actual.');
    }

    return this.errores.length > 0;
  }

    onCancel() {
      const loteId = this.route.snapshot.params['loteId'] || this.loteId || 'default-lote-id';
      const reciboId = this.route.snapshot.params['reciboId'] || this.reciboId || 'default-recibo-id';
      console.log('Navigating to listado-pms with:', loteId, reciboId);
      this.router.navigate([loteId, reciboId, 'listado-pms']);
    }

    validarFecha(fecha: string): boolean {
        if (!fecha) return false;
        const selectedDate = new Date(fecha);
        const today = new Date();
        return selectedDate >= today;
    }
  }
