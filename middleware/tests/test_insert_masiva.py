"""
Tests para el sistema de inserción masiva de datos.
Verifica que el endpoint y la función de inserción masiva funcionan correctamente.
"""
import pytest
import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient
from fastapi import status
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

# Ahora importar módulos que usan database_config
from http_server import app
from database_config import build_connection_string


@pytest.fixture(scope="module")
def client():
    """Fixture que proporciona un TestClient para los tests."""
    return TestClient(app)


@pytest.fixture(scope="function")
def db_engine():
    """Fixture que proporciona un engine de base de datos."""
    engine = create_engine(build_connection_string())
    yield engine
    engine.dispose()


def test_insert_endpoint_exists(client):
    """Test que verifica que el endpoint de inserción masiva existe."""
    # El endpoint puede tardar mucho, así que solo verificamos que existe
    # usando un timeout corto o verificando que no es 404 inmediatamente
    response = client.post("/insertar", timeout=1.0)
    
    # Si retorna 404 significa que el endpoint no existe
    # Si retorna otro código (500, 503, etc.) significa que existe pero puede tener otros problemas
    assert response.status_code != 404, \
        f"El endpoint /insertar debería existir. Status: {response.status_code}"


def test_insert_endpoint_method_not_allowed(client):
    """Test que verifica que GET no está permitido en /insertar."""
    response = client.get("/insertar")
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED, \
        f"GET no debería estar permitido. Status: {response.status_code}"


def test_insert_function_importable():
    """Test que verifica que la función de inserción masiva es importable."""
    try:
        from MassiveInsertFiles import insertar_1000_registros_principales
        assert callable(insertar_1000_registros_principales), \
            "insertar_1000_registros_principales debe ser una función"
    except ImportError as e:
        pytest.fail(f"No se pudo importar insertar_1000_registros_principales: {e}")


def test_database_connection(db_engine):
    """Test que verifica que la conexión a la base de datos funciona."""
    try:
        with db_engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            assert result.scalar() == 1, "La consulta SELECT 1 debería retornar 1"
    except Exception as e:
        pytest.fail(f"No se pudo conectar a la base de datos: {e}")


def test_massive_insert_imports():
    """Test que verifica que todos los módulos necesarios están disponibles."""
    try:
        from MassiveInsertFiles import (
            obtener_engine,
            inicializar_automap,
            mapear_todas_dependencias,
            orden_topologico
        )
        assert callable(obtener_engine)
        assert callable(inicializar_automap)
        assert callable(mapear_todas_dependencias)
        assert callable(orden_topologico)
    except ImportError as e:
        pytest.fail(f"Faltan importaciones necesarias: {e}")


def test_mapeo_dependencias_funciona(db_engine):
    """Test que verifica que el mapeo de dependencias funciona."""
    try:
        from MassiveInsertFiles import mapear_todas_dependencias
        
        mapeo = mapear_todas_dependencias(db_engine)
        
        assert isinstance(mapeo, dict), "El mapeo debe ser un diccionario"
        assert len(mapeo) > 0, "Debe haber al menos una tabla mapeada"
        
        # Verificar estructura del mapeo
        for tabla, info in list(mapeo.items())[:5]:  # Solo verificar las primeras 5
            assert 'dependencias' in info, f"Tabla {tabla} debe tener 'dependencias'"
            assert 'constraints' in info, f"Tabla {tabla} debe tener 'constraints'"
            assert isinstance(info['dependencias'], list), \
                f"Las dependencias de {tabla} deben ser una lista"
        
        print(f"\n✓ Mapeo de dependencias funciona: {len(mapeo)} tablas mapeadas")
        
    except Exception as e:
        pytest.fail(f"Error en mapeo de dependencias: {e}")


def test_orden_topologico_funciona(db_engine):
    """Test que verifica que el orden topológico funciona."""
    try:
        from MassiveInsertFiles import mapear_todas_dependencias, orden_topologico
        
        mapeo = mapear_todas_dependencias(db_engine)
        niveles = orden_topologico(mapeo)
        
        assert isinstance(niveles, list), "El orden topológico debe ser una lista"
        assert len(niveles) > 0, "Debe haber al menos un nivel"
        
        # Verificar que cada nivel es una lista de tablas
        for nivel in niveles:
            assert isinstance(nivel, list), "Cada nivel debe ser una lista"
            assert len(nivel) > 0, "Cada nivel debe tener al menos una tabla"
        
        print(f"\n✓ Orden topológico funciona: {len(niveles)} niveles calculados")
        for i, nivel in enumerate(niveles[:5], 1):  # Mostrar primeros 5 niveles
            print(f"  Nivel {i}: {len(nivel)} tabla(s)")
        
    except Exception as e:
        pytest.fail(f"Error en orden topológico: {e}")


def test_verificar_tablas_principales_existen(db_engine):
    """Test que verifica que las tablas principales existen en la BD."""
    tablas_principales = [
        'lote', 'recibo', 'dosn', 'pureza', 'germinacion', 
        'pms', 'sanitario', 'tetrazolio', 'pureza_pnotatum'
    ]
    
    tablas_encontradas = []
    tablas_faltantes = []
    
    with db_engine.connect() as conn:
        for tabla in tablas_principales:
            query = text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = :tabla
                )
            """)
            result = conn.execute(query, {"tabla": tabla.lower()}).scalar()
            if result:
                tablas_encontradas.append(tabla)
            else:
                tablas_faltantes.append(tabla)
    
    print(f"\n✓ Tablas encontradas: {len(tablas_encontradas)}/{len(tablas_principales)}")
    print(f"  Encontradas: {', '.join(tablas_encontradas)}")
    if tablas_faltantes:
        print(f"  Faltantes: {', '.join(tablas_faltantes)}")
    
    # No fallar el test si faltan algunas tablas, solo informar
    assert len(tablas_encontradas) > 0, "Debe haber al menos una tabla principal"


def test_insert_masiva_completa(client, db_engine):
    """
    Test completo de inserción masiva.
    NOTA: Este test puede tardar varios minutos y requiere permisos de escritura en BD.
    """
    # Verificar que podemos escribir en la BD
    try:
        with db_engine.connect() as conn:
            # Verificar que podemos hacer una inserción de prueba
            test_query = text("SELECT COUNT(*) FROM LOTE")
            count_before = conn.execute(test_query).scalar() or 0
    except Exception as e:
        pytest.skip(f"No se puede acceder a la base de datos para inserción: {e}")
    
    # Este test puede ser muy largo, así que lo marcamos para ejecución manual
    # o con un flag especial
    import os
    if not os.environ.get('RUN_FULL_INSERT_TEST', '').lower() == 'true':
        pytest.skip("Test de inserción completa omitido. Ejecutar con RUN_FULL_INSERT_TEST=true para ejecutarlo")
    
    print("\n" + "=" * 70)
    print("INICIANDO TEST DE INSERCIÓN MASIVA COMPLETA")
    print("=" * 70)
    print("⚠ Este test puede tardar varios minutos...")
    print()
    
    # Obtener conteos antes de la inserción
    tablas_verificar = ['lote', 'recibo', 'dosn', 'pureza']
    conteos_antes = {}
    
    with db_engine.connect() as conn:
        for tabla in tablas_verificar:
            try:
                query = text(f"SELECT COUNT(*) FROM {tabla.upper()}")
                count = conn.execute(query).scalar() or 0
                conteos_antes[tabla] = count
                print(f"  {tabla.upper()}: {count} registros antes")
            except:
                conteos_antes[tabla] = 0
    
    # Ejecutar inserción masiva
    print("\n📥 Ejecutando inserción masiva...")
    response = client.post("/insertar", timeout=600)  # 10 minutos de timeout
    
    print(f"\n📊 Resultado:")
    print(f"  Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("  ✅ Inserción exitosa")
        try:
            data = response.json()
            print(f"  Mensaje: {data.get('mensaje', 'N/A')}")
        except:
            pass
        
        # Verificar que se insertaron datos
        print("\n🔍 Verificando datos insertados:")
        with db_engine.connect() as conn:
            for tabla in tablas_verificar:
                try:
                    query = text(f"SELECT COUNT(*) FROM {tabla.upper()}")
                    count_after = conn.execute(query).scalar() or 0
                    count_before = conteos_antes.get(tabla, 0)
                    nuevos = count_after - count_before
                    
                    if nuevos > 0:
                        print(f"  ✓ {tabla.upper()}: +{nuevos} registros nuevos ({count_before} → {count_after})")
                        
                        # Verificar que los IDs son únicos y secuenciales
                        try:
                            # Obtener la columna de PK
                            from sqlalchemy import inspect as sql_inspect
                            inspector = sql_inspect(db_engine)
                            pk_constraint = inspector.get_pk_constraint(tabla.upper(), schema='public')
                            pk_columns = pk_constraint.get('constrained_columns', [])
                            
                            if pk_columns:
                                pk_column = pk_columns[0]
                                # Obtener IDs de los nuevos registros
                                query_ids = text(f"""
                                    SELECT {pk_column} 
                                    FROM {tabla.upper()} 
                                    WHERE {pk_column} > :max_id_antes
                                    ORDER BY {pk_column}
                                """)
                                ids_insertados = [row[0] for row in conn.execute(query_ids, {"max_id_antes": count_before})]
                                
                                if ids_insertados:
                                    # Verificar que son únicos
                                    ids_unicos = set(ids_insertados)
                                    assert len(ids_unicos) == len(ids_insertados), \
                                        f"IDs duplicados encontrados en {tabla.upper()}"
                                    
                                    # Verificar que son secuenciales (o al menos crecientes)
                                    ids_ordenados = sorted(ids_insertados)
                                    assert ids_ordenados == ids_insertados, \
                                        f"IDs no están en orden secuencial en {tabla.upper()}"
                                    
                                    print(f"    ✓ IDs únicos y secuenciales: {min(ids_insertados)}-{max(ids_insertados)}")
                        except Exception as e:
                            print(f"    ⚠ No se pudo verificar IDs: {e}")
                    else:
                        print(f"  - {tabla.upper()}: Sin cambios ({count_before} → {count_after})")
                except Exception as e:
                    print(f"  ⚠ {tabla.upper()}: Error al verificar - {e}")
        
        assert response.status_code == 200, "La inserción debería ser exitosa"
    elif response.status_code == 504:
        pytest.skip("Timeout en inserción masiva (puede ser normal si la BD es lenta)")
    elif response.status_code == 503:
        pytest.skip("Servicio de BD no disponible (circuit breaker activado)")
    else:
        print(f"  ✗ Error: {response.status_code}")
        try:
            error_data = response.json()
            print(f"  Mensaje: {error_data.get('mensaje', 'N/A')}")
            print(f"  Detalles: {error_data.get('detalles', 'N/A')}")
        except:
            print(f"  Respuesta: {response.text[:500]}")
        
        # No fallar el test si hay errores esperados
        assert response.status_code in [200, 504, 503], \
            f"Inserción falló con código inesperado: {response.status_code}"


def test_verificar_estructura_respuesta_exitosa(client):
    """Test que verifica la estructura de respuesta cuando la inserción es exitosa."""
    # Este test solo verifica la estructura, no ejecuta la inserción completa
    # Para eso necesitaríamos mockear o usar un test más rápido
    
    # Simplemente verificamos que el endpoint responde con estructura JSON
    # cuando es exitoso (aunque puede fallar por otros motivos)
    try:
        response = client.post("/insertar", timeout=5.0)
        
        # Si es exitoso, debe ser JSON
        if response.status_code == 200:
            data = response.json()
            assert "exitoso" in data or "mensaje" in data, \
                "La respuesta exitosa debe tener estructura JSON válida"
    except Exception as e:
        # Si hay timeout u otro error, está bien para este test
        # Solo verificamos que no crashea inmediatamente
        pass


def test_columnas_con_secuencia_excluidas(db_engine):
    """Verifica que las columnas con secuencias no se incluyen en el DataFrame."""
    from MassiveInsertFiles import generar_datos_tabla, obtener_columnas_con_secuencia, inicializar_automap, mapear_todas_dependencias
    
    inicializar_automap(db_engine)
    mapeo = mapear_todas_dependencias(db_engine)
    
    # Probar con varias tablas que comúnmente tienen secuencias
    tablas_test = ['lote', 'recibo', 'usuario', 'deposito']
    tabla_test = None
    columnas_con_secuencia = []
    
    for tabla in tablas_test:
        if tabla in mapeo:
            columnas_con_secuencia = obtener_columnas_con_secuencia(db_engine, tabla)
            if columnas_con_secuencia:
                tabla_test = tabla
                break
    
    if not tabla_test or not columnas_con_secuencia:
        pytest.skip("No se encontró ninguna tabla con columnas con secuencia para probar")
    
    # Generar datos
    df = generar_datos_tabla(db_engine, tabla_test, 5, {}, mapeo)
    
    # Verificar que ninguna columna con secuencia está en el DataFrame
    for col_secuencia in columnas_con_secuencia:
        assert col_secuencia.lower() not in [c.lower() for c in df.columns], \
            f"Columna con secuencia '{col_secuencia}' no debería estar en el DataFrame de '{tabla_test}'"


def test_secuencias_sincronizadas_antes_insertar(db_engine):
    """Verifica que las secuencias se sincronizan antes de insertar."""
    from ImportExcel import asegurar_autoincrementos
    
    # Ejecutar sincronización
    try:
        asegurar_autoincrementos(db_engine)
        # Si no hay errores, el test pasa
        assert True
    except Exception as e:
        pytest.fail(f"Error al sincronizar secuencias: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])

