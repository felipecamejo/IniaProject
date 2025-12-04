"""
Script para actualizar manualmente las descripciones de lotes.
"""
import os
import sys
from pathlib import Path

# Configurar variables de entorno
os.environ['DB_PASSWORD'] = 'Inia2024SecurePass!'
os.environ['DB_USER'] = 'postgres'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_PORT'] = '5432'
os.environ['DB_NAME'] = 'Inia'

# Agregar el directorio raíz al path
middleware_root = Path(__file__).parent
sys.path.insert(0, str(middleware_root))

from tests.test_utils import normalize_env_vars
normalize_env_vars()

from sqlalchemy import create_engine
from database_config import build_connection_string
from MassiveInsertFiles import actualizar_descripciones_lotes

print("=" * 70)
print("ACTUALIZANDO DESCRIPCIONES DE LOTES")
print("=" * 70)
print()

engine = create_engine(build_connection_string())

try:
    actualizar_descripciones_lotes(engine)
    print("\n[OK] Descripciones actualizadas exitosamente")
except Exception as e:
    print(f"\n[ERROR] Error actualizando descripciones: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("=" * 70)
print("ACTUALIZACION COMPLETADA")
print("=" * 70)

