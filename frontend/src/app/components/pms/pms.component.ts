import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PMSService } from '../../../services/PMSService';
import { GramosPmsService } from '../../../services/GramosPmsService';
import { GramosPmsDto } from '../../../models/GramosPms.dto';
import { UrlService } from '../../../services/url.service';
import { PMSDto } from '../../../models/PMS.dto';

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
        fechaCreacion: this.fechaCreacion,
        fechaRepeticion: this.fechaRepeticion
      };
      if (this.isEditing && this.editingId) {
        // Actualizar PMS existente
        if(this.repetido && (!pmsData.repetido || pmsData.fechaRepeticion == null)) {
          pmsData.repetido = true;
          pmsData.fechaRepeticion = new Date().toISOString().split('T')[0]; // Asignar fecha actual si es repetido sin fecha
        }
        console.log('Actualizando PMS ID:', this.editingId, 'con datos:', pmsData);
        this.pmsService.editar(pmsData).subscribe({
          next: (res) => {
            console.log('PMS actualizado correctamente:', res);
            // Ahora procesar los gramos relacionados (editar/crear/eliminar)
            this.procesarGramosDespuesDeGuardar(this.editingId!).then(() => {
              this.safeNavigateToListadoPms();
            }).catch(err => {
              console.error('Error procesando gramos después de editar PMS:', err);
              this.safeNavigateToListadoPms();
            });
          },
          error: (err) => {
            console.error('Error actualizando PMS:', err);
            // Aquí podrías mostrar un mensaje al usuario
          }
        });
      } else {
        // Crear nuevo PMS
        console.log('Creando nuevo PMS:', pmsData);
        pmsData.fechaRepeticion = null;
        pmsData.repetido = false;
        pmsData.fechaCreacion = new Date().toISOString().split('T')[0];
        pmsData.reciboId = this.route.snapshot.params['reciboId'] ? Number(this.route.snapshot.params['reciboId']) : null;
        this.pmsService.crear(pmsData).subscribe({
          next: (res) => {
            console.log('PMS creado correctamente:', res);
            // El endpoint crear devuelve texto; para obtener el PMS creado, listamos por recibo
            const reciboIdNum = this.route.snapshot.params['reciboId'] ? Number(this.route.snapshot.params['reciboId']) : null;
            if (reciboIdNum) {
              this.pmsService.listar(reciboIdNum).subscribe({
                next: (lista) => {
                  if (lista && lista.length > 0) {
                    // Tomar el PMS con mayor id como el recientemente creado
                    const max = lista.reduce((prev, cur) => (prev.id && cur.id && Number(cur.id) > Number(prev.id) ? cur : prev), lista[0]);
                    const nuevoId = max?.id ? Number(max.id) : null;
                    if (nuevoId) {
                      this.procesarGramosDespuesDeCrear(nuevoId).then(() => {
                        this.safeNavigateToListadoPms();
                      }).catch(err => {
                        console.error('Error creando gramos después de crear PMS:', err);
                        this.safeNavigateToListadoPms();
                      });
                      return;
                    }
                  }
                  // Si no logramos determinar id, redirigir
                      this.safeNavigateToListadoPms();
                },
                error: (err) => {
                  console.error('Error listando PMS después de crear:', err);
                  this.safeNavigateToListadoPms();
                }
              });
            } else {
              this.safeNavigateToListadoPms();
            }
          },
          error: (err) => {
            console.error('Error creando PMS:', err);
            // Mostrar feedback si es necesario
          }
        });
      }
    }

    private async procesarGramosDespuesDeCrear(pmsId: number): Promise<void> {
      // Crear todos los gramosEntries (GramosPmsDto[])
      const payload: GramosPmsDto[] = this.gramosEntries.map((g: GramosPmsDto, index: number) => ({ 
        id: g.id ?? null, 
        activo: g.activo ?? true, 
        pmsId: pmsId, 
        gramos: g.gramos
      } as GramosPmsDto));
      console.log('GramosEntries antes del mapeo:', this.gramosEntries);
      console.log('Payload GramosPmsDto[] a crear después de crear PMS:', payload);
      console.log('PmsId asignado:', pmsId);
      console.log('Verificando payload:', payload.map(p => ({ id: p.id, gramos: p.gramos })));
      return new Promise((resolve, reject) => {
        if (!payload || payload.length === 0) return resolve();
        this.gramosPmsService.crearMultiplesGramos(payload).subscribe({
          next: (resp) => {
            console.log('Gramos creados exitosamente:', resp);
            resolve();
          },
          error: (err) => reject(err)
        });
      });
    }

    private async procesarGramosDespuesDeGuardar(pmsId: number): Promise<void> {
      // Preparar payload: los que tienen id se consideran edición, los que no tienen id se crean
      const toSend: GramosPmsDto[] = this.gramosEntries.map((g: GramosPmsDto, index: number) => ({ 
        id: g.id ?? null, 
        activo: g.activo ?? true, 
        pmsId: pmsId, 
        gramos: g.gramos
      } as GramosPmsDto));
      console.log('GramosEntries antes del mapeo (edición):', this.gramosEntries);
      console.log('Payload GramosPmsDto[] a editar/crear después de guardar PMS:', toSend);
      console.log('PmsId asignado:', pmsId);
      console.log('Verificando payload (edición):', toSend.map(p => ({ id: p.id, gramos: p.gramos })));
      console.log('IDs de gramos a eliminar:', this.deletedGramosIds);
      return new Promise((resolve, reject) => {
        if (toSend.length === 0 && this.deletedGramosIds.length === 0) return resolve();

        // Primero editar/crear en lote
        if (toSend.length > 0) {
          this.gramosPmsService.editarMultiplesGramos(toSend).subscribe({
            next: (resp) => {
              console.log('Gramos editados/creados exitosamente:', resp);
              // Luego eliminar los marcados
              if (this.deletedGramosIds && this.deletedGramosIds.length > 0) {
                this.gramosPmsService.eliminarMultiplesGramos(this.deletedGramosIds).subscribe({
                  next: () => {
                    console.log('Gramos eliminados exitosamente');
                    resolve();
                  },
                  error: (err) => reject(err)
                });
              } else {
                resolve();
              }
            },
            error: (err) => reject(err)
          });
        } else {
          // Solo eliminaciones pendientes
          this.gramosPmsService.eliminarMultiplesGramos(this.deletedGramosIds).subscribe({
            next: () => {
              console.log('Gramos eliminados exitosamente (solo eliminaciones)');
              resolve();
            },
            error: (err) => reject(err)
          });
        }
      });
    }

    onCancel() {
      this.safeNavigateToListadoPms();
    }

    private safeNavigateToListadoPms() {
      const lote = this.route.snapshot.params['loteId'];
      const recibo = this.route.snapshot.params['reciboId'];
      // Build path segments only when present to avoid null segments
      const segments = [] as string[];
      if (lote) segments.push(lote);
      if (recibo) segments.push(recibo);
      segments.push('listado-pms');
      console.log('Navegando a listado PMS con segmentos:', segments);
      this.router.navigate(segments);
    }
}
