"""Script simple para probar la conexión a la base de datos."""
import os
import sys

# Configurar variables de entorno
os.environ.setdefault('DB_PASSWORD', 'Inia2024SecurePass!')
os.environ.setdefault('DB_USER', 'postgres')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')
os.environ.setdefault('DB_NAME', 'Inia')

try:
    from app.services.database_service import create_engine_with_pool
    from sqlalchemy import text
    
    print("Creando engine...")
    engine = create_engine_with_pool()
    print("Engine creado exitosamente")
    
    print("Probando conexión...")
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print(f"Conexión exitosa: {result.scalar()}")
    
    print("✓ Todo funcionó correctamente")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

