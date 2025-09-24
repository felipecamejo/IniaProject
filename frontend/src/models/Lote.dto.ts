export interface LoteDto {
    id: number | null;
    nombre: string;
    descripcion: string;
    fechaCreacion: string | null;
    fechaFinalizacion: string | null;
    activo: boolean;
    usuariosId: number[] | null;
}