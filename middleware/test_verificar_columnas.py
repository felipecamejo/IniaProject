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

tablas_test = ['lote', 'deposito', 'maleza']

print("Verificando definicion de columnas:")
print("=" * 70)

with engine.connect() as conn:
    for tabla in tablas_test:
        print(f"\nTabla: {tabla.upper()}")
        
        # Obtener todas las columnas
        query = text("""
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
                AND LOWER(table_name) = LOWER(:tabla)
            ORDER BY ordinal_position
        """)
        result = list(conn.execute(query, {"tabla": tabla}))
        
        for row in result:
            col_name, data_type, default, nullable = row
            print(f"  {col_name}:")
            print(f"    Tipo: {data_type}")
            print(f"    Default: {default}")
            print(f"    Nullable: {nullable}")
            
            # Verificar si tiene secuencia usando pg_get_serial_sequence
            if col_name.lower().endswith('_id'):
                query_seq = text(f"SELECT pg_get_serial_sequence('{tabla.upper()}', '{col_name}')")
                seq_result = conn.execute(query_seq).scalar()
                if seq_result:
                    print(f"    Secuencia: {seq_result}")

