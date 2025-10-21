export interface MetodoDto {
    id: number | null;
    nombre: string;
    autor: string;
    descripcion: string | null;
    activo: boolean;
}

export interface ResponseListadoMetodos {
    metodos: MetodoDto[];
}