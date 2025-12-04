import os
import sys
from pathlib import Path

os.environ['DB_PASSWORD'] = 'Inia2024SecurePass!'
os.environ['DB_USER'] = 'postgres'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_PORT'] = '5432'
os.environ['DB_NAME'] = 'Inia'

middleware_root = Path(__file__).parent
sys.path.insert(0, str(middleware_root))

from tests.test_utils import normalize_env_vars
normalize_env_vars()

from sqlalchemy import create_engine, text
from database_config import build_connection_string
from MassiveInsertFiles import obtener_columnas_con_secuencia

engine = create_engine(build_connection_string())

tablas_test = ['lote', 'deposito', 'maleza', 'usuario', 'LOTE', 'DEPOSITO']

print("Verificando deteccion de secuencias:")
print("=" * 70)

for tabla in tablas_test:
    columnas = obtener_columnas_con_secuencia(engine, tabla)
    print(f"\nTabla: {tabla}")
    print(f"  Columnas con secuencia encontradas: {columnas}")
    
    # Verificar directamente en la BD
    with engine.connect() as conn:
        query = text("""
            SELECT table_name, column_name, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
                AND LOWER(table_name) = LOWER(:tabla)
                AND column_default LIKE 'nextval%'
        """)
        result = list(conn.execute(query, {"tabla": tabla}))
        print(f"  Verificacion directa en BD:")
        for row in result:
            print(f"    {row[0]}.{row[1]}: {row[2][:50]}...")

