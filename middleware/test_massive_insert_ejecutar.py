"""
Script para probar la inserción masiva con base de datos vacía.
Ejecuta insertar_1000_registros_principales() y muestra los resultados.
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

from sqlalchemy import create_engine, text
from database_config import build_connection_string
from MassiveInsertFiles import insertar_1000_registros_principales

print("=" * 70)
print("PRUEBA DE INSERCIÓN MASIVA - BASE DE DATOS VACÍA")
print("=" * 70)
print()

try:
    engine = create_engine(build_connection_string())
    
    # Verificar estado inicial de la base de datos
    print("FASE 1: Verificando estado inicial de la base de datos")
    print("-" * 70)
    
    tablas_principales = ['lote', 'recibo', 'dosn', 'pureza', 'germinacion', 'pms', 'sanitario', 'tetrazolio']
    conteos_iniciales = {}
    ids_maximos_iniciales = {}
    
    with engine.connect() as conn:
        # Verificar conexión
        result = conn.execute(text("SELECT 1"))
        assert result.scalar() == 1
        print("[OK] Conexion a base de datos: OK")
        
        # Obtener conteos y IDs máximos iniciales
        print("\nConteos iniciales:")
        from sqlalchemy import inspect as sql_inspect
        inspector = sql_inspect(engine)
        
        for tabla in tablas_principales:
            try:
                query = text(f"SELECT COUNT(*) FROM {tabla.upper()}")
                count = conn.execute(query).scalar() or 0
                conteos_iniciales[tabla] = count
                
                # Obtener ID máximo antes de la inserción
                try:
                    pk_constraint = inspector.get_pk_constraint(tabla.lower(), schema='public')
                except:
                    pk_constraint = inspector.get_pk_constraint(tabla.upper(), schema='public')
                pk_columns = pk_constraint.get('constrained_columns', [])
                
                if pk_columns:
                    pk_column = pk_columns[0]
                    query_max = text(f"SELECT COALESCE(MAX({pk_column}), 0) FROM {tabla.upper()}")
                    max_id = conn.execute(query_max).scalar() or 0
                    ids_maximos_iniciales[tabla] = max_id
                else:
                    ids_maximos_iniciales[tabla] = 0
                
                print(f"  {tabla.upper()}: {count:,} registros (ID max: {ids_maximos_iniciales[tabla]})")
            except Exception as e:
                conteos_iniciales[tabla] = 0
                ids_maximos_iniciales[tabla] = 0
                print(f"  {tabla.upper()}: Error al contar - {e}")
    
    print()
    
    # Ejecutar inserción masiva
    print("FASE 2: Ejecutando inserción masiva")
    print("-" * 70)
    print("[ADVERTENCIA] Esto puede tardar varios minutos...")
    print()
    
    try:
        insertar_1000_registros_principales()
        print("\n[OK] INSERCION MASIVA COMPLETADA EXITOSAMENTE")
    except Exception as e:
        print(f"\n[ERROR] ERROR durante la insercion masiva: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    print()
    
    # Verificar resultados
    print("FASE 3: Verificando resultados")
    print("-" * 70)
    
    with engine.connect() as conn:
        print("\nConteos despues de la insercion:")
        total_nuevos = 0
        
        for tabla in tablas_principales:
            try:
                query = text(f"SELECT COUNT(*) FROM {tabla.upper()}")
                count_after = conn.execute(query).scalar() or 0
                count_before = conteos_iniciales.get(tabla, 0)
                nuevos = count_after - count_before
                total_nuevos += nuevos
                
                if nuevos > 0:
                    print(f"  [OK] {tabla.upper()}: +{nuevos:,} registros nuevos ({count_before:,} -> {count_after:,})")
                    
                    # Verificar IDs únicos y secuenciales
                    try:
                        from sqlalchemy import inspect as sql_inspect
                        inspector = sql_inspect(engine)
                        # Intentar con el nombre de tabla en minúsculas primero
                        try:
                            pk_constraint = inspector.get_pk_constraint(tabla.lower(), schema='public')
                        except:
                            pk_constraint = inspector.get_pk_constraint(tabla.upper(), schema='public')
                        pk_columns = pk_constraint.get('constrained_columns', [])
                        
                        if pk_columns and nuevos > 0:
                            pk_column = pk_columns[0]
                            max_id_antes = ids_maximos_iniciales.get(tabla, 0)
                            query_ids = text(f"""
                                SELECT {pk_column} 
                                FROM {tabla.upper()} 
                                WHERE {pk_column} > :max_id_antes
                                ORDER BY {pk_column}
                                LIMIT :limit
                            """)
                            ids_insertados = [row[0] for row in conn.execute(query_ids, {"max_id_antes": max_id_antes, "limit": nuevos})]
                            
                            if ids_insertados:
                                ids_unicos = set(ids_insertados)
                                if len(ids_unicos) == len(ids_insertados):
                                    print(f"    [OK] IDs unicos: {min(ids_insertados)}-{max(ids_insertados)}")
                                else:
                                    print(f"    [WARNING] IDs duplicados detectados!")
                            else:
                                print(f"    - No se pudieron obtener IDs")
                    except Exception as e:
                        print(f"    [WARNING] Error verificando IDs: {e}")
                else:
                    print(f"  - {tabla.upper()}: Sin cambios ({count_before:,} registros)")
            except Exception as e:
                print(f"  [WARNING] {tabla.upper()}: Error al verificar - {e}")
        
        print(f"\nTotal de registros nuevos insertados: {total_nuevos:,}")
    
    print("\n" + "=" * 70)
    print("[OK] PRUEBA COMPLETADA")
    print("=" * 70)
    
except Exception as e:
    print(f"\n[ERROR] Error durante la prueba: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

