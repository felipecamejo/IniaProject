-- Script para corregir la restricción CHECK de tratamiento en la tabla GERMINACION
-- Este script actualiza la restricción para que coincida con el enum Tratamiento en Java

-- Primero, eliminar la restricción CHECK antigua
ALTER TABLE germinacion 
DROP CONSTRAINT IF EXISTS germinacion_germinacion_tratamiento_check;

-- Crear la nueva restricción CHECK con los valores correctos del enum Java
ALTER TABLE germinacion 
ADD CONSTRAINT germinacion_germinacion_tratamiento_check 
CHECK (
    (germinacion_tratamiento)::text = ANY (
        ARRAY[
            'SIN_CURAR'::character varying, 
            'CURADA_PLANTA'::character varying, 
            'CURADA_LABORATORIO'::character varying
        ]::text[]
    )
);

-- Verificar que la restricción se creó correctamente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conname = 'germinacion_germinacion_tratamiento_check';

