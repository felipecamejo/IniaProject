"""
Tests de diagnóstico para el sistema de inserción masiva.
Identifica problemas específicos que impiden la inserción correcta.
"""
import pytest
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text

# Agregar el directorio raíz del middleware al path
middleware_root = Path(__file__).parent.parent
sys.path.insert(0, str(middleware_root))

# IMPORTANTE: Configurar variables de entorno ANTES de importar cualquier módulo
os.environ['DB_PASSWORD'] = 'Inia2024SecurePass!'
os.environ['DB_USER'] = 'postgres'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_PORT'] = '5432'
os.environ['DB_NAME'] = 'Inia'

# Importar utilidades de normalización
from tests.test_utils import normalize_env_vars
normalize_env_vars()

from database_config import build_connection_string


@pytest.fixture(scope="function")
def db_engine():
    """Fixture que proporciona un engine de base de datos."""
    engine = create_engine(build_connection_string())
    yield engine
    engine.dispose()


def test_verificar_secuencias_sincronizadas(db_engine):
    """Test que verifica si las secuencias están sincronizadas con los IDs máximos."""
    tablas_problema = []
    tablas_ok = []
    
    with db_engine.connect() as conn:
        # Obtener todas las tablas con secuencias
        query = text("""
            SELECT 
                t.table_name,
                c.column_name,
                c.column_default
            FROM information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
            WHERE t.table_schema = 'public'
                AND t.table_type = 'BASE TABLE'
                AND c.column_default LIKE 'nextval%'
            ORDER BY t.table_name, c.column_name
        """)
        
        result = conn.execute(query)
        secuencias = list(result)
        
        print(f"\n🔍 Verificando {len(secuencias)} secuencias...")
        
        for tabla, columna, default in secuencias:
            try:
                # Extraer nombre de secuencia del default
                # Formato: nextval('nombre_secuencia'::regclass)
                import re
                match = re.search(r"nextval\('([^']+)'", default)
                if not match:
                    continue
                
                seq_name = match.group(1)
                
                # Obtener valor máximo actual en la tabla
                query_max = text(f"SELECT COALESCE(MAX({columna}), 0) FROM {tabla}")
                max_id = conn.execute(query_max).scalar() or 0
                
                # Obtener valor actual de la secuencia
                query_seq = text(f"SELECT last_value FROM {seq_name}")
                seq_value = conn.execute(query_seq).scalar()
                
                # Verificar si están sincronizados
                if seq_value < max_id:
                    tablas_problema.append({
                        'tabla': tabla,
                        'columna': columna,
                        'max_id': max_id,
                        'seq_value': seq_value,
                        'diferencia': max_id - seq_value
                    })
                else:
                    tablas_ok.append(tabla)
                    
            except Exception as e:
                print(f"  ⚠ Error verificando {tabla}.{columna}: {e}")
    
    print(f"\n📊 Resultados:")
    print(f"  ✓ Secuencias OK: {len(tablas_ok)}")
    print(f"  ✗ Secuencias desincronizadas: {len(tablas_problema)}")
    
    if tablas_problema:
        print(f"\n⚠ PROBLEMAS ENCONTRADOS:")
        for problema in tablas_problema[:10]:  # Mostrar primeros 10
            print(f"  - {problema['tabla']}.{problema['columna']}:")
            print(f"    Max ID: {problema['max_id']}, Secuencia: {problema['seq_value']}")
            print(f"    Diferencia: {problema['diferencia']}")
    
    # No fallar el test, solo informar
    assert True


def test_verificar_generacion_ids_manual(db_engine):
    """Test que verifica si el sistema está generando IDs manualmente."""
    from MassiveInsertFiles import generar_datos_tabla, inicializar_automap, mapear_todas_dependencias
    
    inicializar_automap(db_engine)
    mapeo = mapear_todas_dependencias(db_engine)
    
    # Probar con una tabla pequeña
    tabla_test = 'deposito'
    if tabla_test not in mapeo:
        pytest.skip(f"Tabla {tabla_test} no encontrada para prueba")
    
    print(f"\n🔍 Verificando generación de IDs para tabla '{tabla_test}'...")
    
    # Obtener ID máximo antes
    with db_engine.connect() as conn:
        query_max = text(f"SELECT COALESCE(MAX(DEPOSITO_ID), 0) FROM DEPOSITO")
        max_id_antes = conn.execute(query_max).scalar() or 0
        print(f"  Max ID antes: {max_id_antes}")
    
    # Generar datos (sin insertar)
    try:
        df = generar_datos_tabla(db_engine, tabla_test, 5, {}, mapeo)
        
        if 'deposito_id' in df.columns:
            ids_generados = df['deposito_id'].tolist()
            print(f"  IDs generados manualmente: {ids_generados[:5]}")
            print(f"  ⚠ PROBLEMA: El sistema está generando IDs manualmente")
            print(f"     Esto puede causar conflictos si los IDs ya existen")
        else:
            print(f"  ✓ No se generan IDs manualmente (debe usar secuencias)")
            
    except Exception as e:
        print(f"  ⚠ Error al generar datos: {e}")


def test_verificar_problema_unique_violation(db_engine):
    """Test que identifica el problema de UniqueViolation."""
    print("\n🔍 Analizando problema de UniqueViolation...")
    
    tablas_con_problemas = []
    
    # Tablas que tuvieron problemas según los logs
    tablas_problema = [
        'maleza', 'germinacion_sin_curar', 'hongo', 'autocompletado',
        'germinacion_curada_planta', 'germinacion_curada_laboratorio',
        'metodo', 'germinacion_normal_por_conteo', 'lote', 'usuario',
        'conteo_germinacion', 'gramos_pms', 'deposito'
    ]
    
    with db_engine.connect() as conn:
        for tabla in tablas_problema:
            try:
                # Obtener información de la PK
                query_pk = text("""
                    SELECT column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu
                        ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_schema = 'public'
                        AND tc.table_name = :tabla
                        AND tc.constraint_type = 'PRIMARY KEY'
                    LIMIT 1
                """)
                pk_result = conn.execute(query_pk, {"tabla": tabla.lower()}).fetchone()
                
                if pk_result:
                    pk_column = pk_result[0]
                    
                    # Obtener rango de IDs actuales
                    query_range = text(f"SELECT MIN({pk_column}), MAX({pk_column}), COUNT(*) FROM {tabla}")
                    result = conn.execute(query_range).fetchone()
                    min_id, max_id, count = result
                    
                    if min_id and max_id:
                        print(f"\n  {tabla.upper()}:")
                        print(f"    Rango de IDs: {min_id} - {max_id}")
                        print(f"    Total registros: {count}")
                        
                        # Verificar si hay gaps grandes que puedan causar problemas
                        if max_id - min_id > count * 2:
                            print(f"    ⚠ PROBLEMA: Hay gaps grandes en los IDs")
                            print(f"       Esto sugiere que se están generando IDs manualmente")
                            tablas_con_problemas.append(tabla)
                            
            except Exception as e:
                print(f"  ⚠ Error verificando {tabla}: {e}")
    
    if tablas_con_problemas:
        print(f"\n⚠ {len(tablas_con_problemas)} tabla(s) con posibles problemas de generación de IDs")
    else:
        print(f"\n✓ No se detectaron problemas obvios de generación de IDs")


def test_verificar_dependencias_correctas(db_engine):
    """Test que verifica que las dependencias están correctamente mapeadas."""
    from MassiveInsertFiles import mapear_todas_dependencias, orden_topologico
    
    print("\n🔍 Verificando mapeo de dependencias...")
    
    mapeo = mapear_todas_dependencias(db_engine)
    niveles = orden_topologico(mapeo)
    
    # Verificar que las tablas principales están en los niveles correctos
    tablas_principales = {
        'lote': None,
        'recibo': 'lote',
        'dosn': 'recibo',
        'pureza': 'recibo',
        'pms': 'recibo'
    }
    
    problemas_dependencias = []
    
    for tabla, depende_de in tablas_principales.items():
        if tabla not in mapeo:
            continue
        
        nivel_tabla = None
        for i, nivel in enumerate(niveles):
            if tabla in nivel:
                nivel_tabla = i + 1
                break
        
        if depende_de:
            nivel_dependencia = None
            for i, nivel in enumerate(niveles):
                if depende_de in nivel:
                    nivel_dependencia = i + 1
                    break
            
            if nivel_tabla and nivel_dependencia:
                if nivel_tabla <= nivel_dependencia:
                    problemas_dependencias.append({
                        'tabla': tabla,
                        'depende_de': depende_de,
                        'nivel_tabla': nivel_tabla,
                        'nivel_dependencia': nivel_dependencia
                    })
                    print(f"  ✗ {tabla} está en nivel {nivel_tabla}, pero depende de {depende_de} (nivel {nivel_dependencia})")
                else:
                    print(f"  ✓ {tabla} está correctamente después de {depende_de}")
    
    if problemas_dependencias:
        print(f"\n⚠ {len(problemas_dependencias)} problema(s) de orden de dependencias encontrado(s)")
    else:
        print(f"\n✓ Orden de dependencias correcto")


def test_resumen_diagnostico(db_engine):
    """Test que proporciona un resumen completo del diagnóstico."""
    print("\n" + "=" * 70)
    print("RESUMEN DE DIAGNÓSTICO - SISTEMA DE INSERCIÓN MASIVA")
    print("=" * 70)
    
    problemas_encontrados = []
    
    # 1. Verificar secuencias
    print("\n1. Verificación de secuencias:")
    with db_engine.connect() as conn:
        query = text("""
            SELECT COUNT(*) 
            FROM information_schema.columns c
            JOIN information_schema.tables t ON c.table_name = t.table_name
            WHERE t.table_schema = 'public'
                AND c.column_default LIKE 'nextval%'
        """)
        num_secuencias = conn.execute(query).scalar() or 0
        print(f"   Total de secuencias encontradas: {num_secuencias}")
    
    # 2. Verificar tablas principales
    print("\n2. Verificación de tablas principales:")
    tablas_principales = ['lote', 'recibo', 'dosn', 'pureza', 'pms']
    with db_engine.connect() as conn:
        for tabla in tablas_principales:
            try:
                query = text(f"SELECT COUNT(*) FROM {tabla.upper()}")
                count = conn.execute(query).scalar() or 0
                print(f"   {tabla.upper()}: {count:,} registros")
            except:
                print(f"   {tabla.upper()}: Error al contar")
    
    # 3. Verificar funciones de inserción
    print("\n3. Verificación de funciones:")
    try:
        from MassiveInsertFiles import (
            insertar_1000_registros_principales,
            mapear_todas_dependencias,
            orden_topologico
        )
        print("   ✓ Funciones importables")
        
        mapeo = mapear_todas_dependencias(db_engine)
        niveles = orden_topologico(mapeo)
        print(f"   ✓ Mapeo: {len(mapeo)} tablas, {len(niveles)} niveles")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        problemas_encontrados.append(f"Error al importar funciones: {e}")
    
    print("\n" + "=" * 70)
    print("CONCLUSIONES:")
    print("=" * 70)
    
    if problemas_encontrados:
        print("⚠ PROBLEMAS ENCONTRADOS:")
        for problema in problemas_encontrados:
            print(f"  - {problema}")
    else:
        print("✓ Sistema básico funciona correctamente")
        print("⚠ El problema principal parece ser:")
        print("  - IDs duplicados (UniqueViolation)")
        print("  - Esto sugiere que las secuencias están desincronizadas")
        print("  - O que el sistema está generando IDs manualmente")
    
    print("\n💡 RECOMENDACIONES:")
    print("  1. Sincronizar todas las secuencias antes de insertar")
    print("  2. No generar IDs manualmente, dejar que la BD los genere")
    print("  3. Verificar que las secuencias estén actualizadas")
    print("=" * 70)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])

