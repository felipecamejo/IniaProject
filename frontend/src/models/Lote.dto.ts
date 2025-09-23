export interface LoteDto {
    id: number | null;
    nombre: string;
    descripcion: string;
    fechaCreacion: Date | null;
    fechaFinalizacion: Date | null;
    activo: boolean;
    recibos: any[] | null;
    usuarios: any[] | null;
}