"""
Script para ejecutar la inserción masiva con variables de entorno configuradas.
"""
import os
import sys

# Configurar variables de entorno
os.environ['DB_PASSWORD'] = 'Inia2024SecurePass!'
os.environ['DB_USER'] = 'postgres'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_PORT'] = '5432'
os.environ['DB_NAME'] = 'Inia'

# Importar y ejecutar
from MassiveInsertFiles import insertar_1000_registros_principales

if __name__ == "__main__":
    print("=" * 80)
    print("EJECUTANDO INSERCIÓN MASIVA DE 1000 REGISTROS")
    print("=" * 80)
    print()
    
    try:
        insertar_1000_registros_principales()
        print()
        print("=" * 80)
        print("✅ INSERCIÓN COMPLETADA EXITOSAMENTE")
        print("=" * 80)
    except Exception as e:
        print()
        print("=" * 80)
        print(f"❌ ERROR EN LA INSERCIÓN: {e}")
        print("=" * 80)
        import traceback
        traceback.print_exc()
        sys.exit(1)

