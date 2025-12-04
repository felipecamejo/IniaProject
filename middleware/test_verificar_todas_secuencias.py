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

print("Verificando todas las secuencias en la base de datos:")
print("=" * 70)

with engine.connect() as conn:
    # Obtener todas las secuencias
    query = text("""
        SELECT sequence_name, sequence_schema
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
        ORDER BY sequence_name
    """)
    result = list(conn.execute(query))
    
    print(f"\nTotal de secuencias encontradas: {len(result)}")
    for row in result[:20]:  # Mostrar primeras 20
        print(f"  {row[1]}.{row[0]}")
    
    # Verificar secuencias relacionadas con tablas específicas
    print("\n" + "=" * 70)
    print("Verificando secuencias para tablas específicas:")
    
    tablas_test = ['lote', 'deposito', 'maleza']
    for tabla in tablas_test:
        # Buscar secuencias que puedan estar relacionadas
        query_seq = text("""
            SELECT sequence_name
            FROM information_schema.sequences
            WHERE sequence_schema = 'public'
                AND sequence_name LIKE :pattern
        """)
        pattern = f"%{tabla}%"
        seqs = list(conn.execute(query_seq, {"pattern": pattern}))
        print(f"\n  Tabla {tabla.upper()}:")
        if seqs:
            for seq in seqs:
                print(f"    Secuencia encontrada: {seq[0]}")
        else:
            print(f"    Sin secuencias relacionadas")

