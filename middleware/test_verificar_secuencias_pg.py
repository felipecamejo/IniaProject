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

engine = create_engine(build_connection_string())

tablas_test = ['lote', 'deposito', 'maleza', 'usuario']

print("Verificando secuencias usando pg_get_serial_sequence:")
print("=" * 70)

with engine.connect() as conn:
    for tabla in tablas_test:
        print(f"\nTabla: {tabla.upper()}")
        
        # Obtener todas las columnas que terminan en _id
        query = text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
                AND LOWER(table_name) = LOWER(:tabla)
                AND column_name LIKE '%_id'
        """)
        result = list(conn.execute(query, {"tabla": tabla}))
        
        for row in result:
            col_name = row[0]
            # Verificar si tiene secuencia usando pg_get_serial_sequence
            query_seq = text(f"SELECT pg_get_serial_sequence('{tabla.upper()}', '{col_name}')")
            seq_result = conn.execute(query_seq).scalar()
            if seq_result:
                print(f"  {col_name}: Secuencia encontrada = {seq_result}")
            else:
                print(f"  {col_name}: Sin secuencia")

