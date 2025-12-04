"""
Script de prueba rápida para verificar nombres y descripciones de lotes.
Inserta una pequeña cantidad de datos y verifica que todo funciona correctamente.
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
from sqlalchemy import inspect
from database_config import build_connection_string
from MassiveInsertFiles import (
    obtener_engine, 
    inicializar_automap,
    mapear_todas_dependencias,
    orden_topologico,
    procesar_nivel_insercion,
    actualizar_descripciones_lotes,
    obtener_id_maximo
)

print("=" * 70)
print("PRUEBA DE NOMBRES Y DESCRIPCIONES DE LOTES")
print("=" * 70)
print()

try:
    engine = create_engine(build_connection_string())
    
    # Verificar estado inicial
    print("FASE 1: Verificando estado inicial")
    print("-" * 70)
    
    with engine.connect() as conn:
        try:
            query = text("SELECT COUNT(*) FROM LOTE")
            count_antes = conn.execute(query).scalar() or 0
            print(f"[OK] Lotes existentes antes: {count_antes}")
            
            if count_antes > 0:
                # Obtener algunos lotes existentes para verificar formato
                query_lotes = text("""
                    SELECT LOTE_ID, LOTE_NOMBRE, LOTE_DESCRIPCION 
                    FROM LOTE 
                    WHERE LOTE_ACTIVO = true 
                    ORDER BY LOTE_ID DESC 
                    LIMIT 5
                """)
                lotes = conn.execute(query_lotes).fetchall()
                
                print(f"\nMuestra de lotes existentes:")
                for lote_id, nombre, descripcion in lotes:
                    nombre_str = nombre if nombre else "(NULL)"
                    desc_str = descripcion if descripcion else "(NULL)"
                    formato_ok = nombre and nombre.startswith("Lote ") if nombre else False
                    print(f"  - ID {lote_id}: {nombre_str} | Desc: {desc_str[:50]}... {'[OK]' if formato_ok else '[Formato antiguo]'}")
        except Exception as e:
            print(f"[INFO] No se pudo verificar lotes existentes: {e}")
            count_antes = 0
    
    print()
    
    # Preparar inserción masiva (pero con cantidad reducida para prueba rápida)
    print("FASE 2: Preparando inserción masiva (10 registros para prueba)")
    print("-" * 70)
    
    inicializar_automap(engine)
    mapeo_completo = mapear_todas_dependencias(engine)
    niveles = orden_topologico(mapeo_completo)
    
    print(f"[OK] Mapeo completado: {len(mapeo_completo)} tablas")
    print(f"[OK] Orden topológico: {len(niveles)} niveles")
    
    # Obtener ID máximo antes de insertar
    id_maximo_antes = obtener_id_maximo(engine, 'lote')
    print(f"[OK] ID máximo de LOTE antes: {id_maximo_antes}")
    
    print()
    print("FASE 3: Insertando 10 registros de prueba")
    print("-" * 70)
    print("[ADVERTENCIA] Esto puede tardar unos minutos...")
    print()
    
    # Insertar solo 10 registros para prueba rápida
    ids_referencias = {}
    cantidad = 10
    tablas_completadas = []
    tablas_pendientes = []
    errores_encontrados = []
    
    # Insertar solo el primer nivel (que debería incluir LOTE)
    if niveles:
        primer_nivel = niveles[0]
        print(f"Insertando nivel 1: {primer_nivel}")
        
        ids_referencias, pendientes_nivel, errores_nivel = procesar_nivel_insercion(
            engine, primer_nivel, 1, mapeo_completo, ids_referencias, cantidad
        )
        tablas_completadas.extend([t for t in primer_nivel if t not in pendientes_nivel])
        tablas_pendientes.extend(pendientes_nivel)
        errores_encontrados.extend(errores_nivel)
        
        if 'lote' in tablas_completadas:
            print("[OK] Lotes insertados exitosamente")
        else:
            print("[ADVERTENCIA] Lotes no se insertaron en el primer nivel")
    
    print()
    
    # Verificar nombres generados
    print("FASE 4: Verificando nombres generados")
    print("-" * 70)
    
    with engine.connect() as conn:
        # Obtener los últimos lotes insertados
        id_maximo_despues = obtener_id_maximo(engine, 'lote')
        print(f"[OK] ID máximo de LOTE después: {id_maximo_despues}")
        
        if id_maximo_despues > id_maximo_antes:
            # Obtener los nuevos lotes
            query_nuevos = text("""
                SELECT LOTE_ID, LOTE_NOMBRE, LOTE_DESCRIPCION 
                FROM LOTE 
                WHERE LOTE_ID > :id_max_antes
                ORDER BY LOTE_ID
            """)
            nuevos_lotes = conn.execute(query_nuevos, {"id_max_antes": id_maximo_antes}).fetchall()
            
            print(f"\nLotes nuevos insertados ({len(nuevos_lotes)}):")
            nombres_correctos = 0
            for lote_id, nombre, descripcion in nuevos_lotes:
                formato_ok = nombre and nombre.startswith("Lote ") and nombre.replace("Lote ", "").strip().isdigit()
                if formato_ok:
                    nombres_correctos += 1
                nombre_str = nombre if nombre else "(NULL)"
                desc_str = descripcion if descripcion else "(NULL)"
                estado = "[OK]" if formato_ok else "[ERROR]"
                print(f"  - ID {lote_id}: {nombre_str} | Desc: {desc_str[:50]}... {estado}")
            
            print(f"\n[RESULTADO] Nombres con formato correcto: {nombres_correctos}/{len(nuevos_lotes)}")
            
            if nombres_correctos == len(nuevos_lotes) and len(nuevos_lotes) > 0:
                print("[OK] Todos los nombres tienen el formato correcto!")
            elif len(nuevos_lotes) == 0:
                print("[ADVERTENCIA] No se insertaron nuevos lotes")
            else:
                print(f"[ADVERTENCIA] Solo {nombres_correctos}/{len(nuevos_lotes)} nombres tienen formato correcto")
        else:
            print("[ADVERTENCIA] No se insertaron nuevos lotes (ID máximo no cambió)")
    
    print()
    
    # Actualizar descripciones manualmente para probar
    print("FASE 5: Actualizando descripciones de lotes")
    print("-" * 70)
    
    try:
        actualizar_descripciones_lotes(engine)
        print("[OK] Descripciones actualizadas exitosamente")
    except Exception as e:
        print(f"[ERROR] Error actualizando descripciones: {e}")
        import traceback
        traceback.print_exc()
    
    print()
    
    # Verificar descripciones actualizadas
    print("FASE 6: Verificando descripciones actualizadas")
    print("-" * 70)
    
    with engine.connect() as conn:
        query_desc = text("""
            SELECT LOTE_ID, LOTE_NOMBRE, LOTE_DESCRIPCION 
            FROM LOTE 
            WHERE LOTE_ID > :id_max_antes
            AND LOTE_DESCRIPCION IS NOT NULL
            ORDER BY LOTE_ID
        """)
        lotes_con_desc = conn.execute(query_desc, {"id_max_antes": id_maximo_antes}).fetchall()
        
        if lotes_con_desc:
            print(f"\nDescripciones actualizadas ({len(lotes_con_desc)}):")
            for lote_id, nombre, descripcion in lotes_con_desc:
                nombre_str = nombre if nombre else "(NULL)"
                print(f"  - ID {lote_id} ({nombre_str}): {descripcion}")
            
            # Verificar formato de descripciones
            descripciones_validas = 0
            for _, _, descripcion in lotes_con_desc:
                if descripcion and (
                    "Incluye análisis de:" in descripcion or 
                    "Sin análisis asociados" in descripcion
                ):
                    descripciones_validas += 1
            
            print(f"\n[RESULTADO] Descripciones con formato válido: {descripciones_validas}/{len(lotes_con_desc)}")
            
            if descripciones_validas == len(lotes_con_desc):
                print("[OK] Todas las descripciones tienen formato válido!")
        else:
            print("[ADVERTENCIA] No se encontraron lotes con descripciones actualizadas")
    
    print()
    print("=" * 70)
    print("PRUEBA COMPLETADA")
    print("=" * 70)
    
except Exception as e:
    print(f"\n[ERROR] Error durante la prueba: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

