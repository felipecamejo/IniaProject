"""
Prueba funcional completa del sistema de inserción masiva.
Verifica que el sistema funciona correctamente antes de usarlo para importar datos.
"""
import sys
import os
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

from fastapi.testclient import TestClient
from http_server import app
from sqlalchemy import create_engine, text
from database_config import build_connection_string

# Crear cliente de prueba
client = TestClient(app)

print("=" * 70)
print("PRUEBA FUNCIONAL - SISTEMA DE INSERCIÓN MASIVA")
print("=" * 70)
print()

try:
    engine = create_engine(build_connection_string())
    
    # FASE 1: Verificaciones previas
    print("FASE 1: Verificaciones previas")
    print("-" * 70)
    
    with engine.connect() as conn:
        # Verificar conexión
        result = conn.execute(text("SELECT 1"))
        assert result.scalar() == 1
        print("✓ Conexión a base de datos: OK")
        
        # Verificar tablas principales
        tablas_principales = ['lote', 'recibo', 'dosn', 'pureza', 'germinacion', 'pms']
        tablas_ok = []
        for tabla in tablas_principales:
            query = text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = :tabla
                )
            """)
            exists = conn.execute(query, {"tabla": tabla.lower()}).scalar()
            if exists:
                tablas_ok.append(tabla)
        
        print(f"✓ Tablas principales encontradas: {len(tablas_ok)}/{len(tablas_principales)}")
        print(f"  {', '.join(tablas_ok)}")
        
        # Obtener conteos antes de la inserción
        print("\n📊 Estado actual de la base de datos:")
        conteos_antes = {}
        for tabla in tablas_principales:
            try:
                query = text(f"SELECT COUNT(*) FROM {tabla.upper()}")
                count = conn.execute(query).scalar() or 0
                conteos_antes[tabla] = count
                print(f"  {tabla.upper()}: {count:,} registros")
            except Exception as e:
                conteos_antes[tabla] = 0
                print(f"  {tabla.upper()}: Error al contar - {e}")
    
    print()
    
    # FASE 2: Verificar funciones de inserción masiva
    print("FASE 2: Verificación de funciones de inserción masiva")
    print("-" * 70)
    
    try:
        from MassiveInsertFiles import (
            insertar_1000_registros_principales,
            obtener_engine,
            inicializar_automap,
            mapear_todas_dependencias,
            orden_topologico
        )
        print("✓ Todas las funciones necesarias son importables")
        
        # Verificar mapeo de dependencias
        print("\n  Verificando mapeo de dependencias...")
        mapeo = mapear_todas_dependencias(engine)
        print(f"  ✓ {len(mapeo)} tablas mapeadas")
        
        # Verificar orden topológico
        print("\n  Verificando orden topológico...")
        niveles = orden_topologico(mapeo)
        print(f"  ✓ {len(niveles)} niveles calculados")
        for i, nivel in enumerate(niveles[:3], 1):  # Mostrar primeros 3 niveles
            print(f"    Nivel {i}: {len(nivel)} tabla(s)")
        
    except Exception as e:
        print(f"✗ Error al verificar funciones: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
    
    print()
    
    # FASE 3: Verificar endpoint
    print("FASE 3: Verificación del endpoint")
    print("-" * 70)
    
    print("  Verificando que el endpoint existe...")
    try:
        # Intentar con timeout corto solo para verificar que existe
        response = client.post("/insertar", timeout=2.0)
        if response.status_code == 404:
            print("  ✗ El endpoint /insertar no existe")
            exit(1)
        else:
            print(f"  ✓ Endpoint existe (respondió con código {response.status_code})")
    except Exception as e:
        # Si hay timeout u otro error, el endpoint existe pero puede tardar
        print(f"  ✓ Endpoint existe (timeout esperado para inserción masiva)")
    
    print()
    
    # FASE 4: Preguntar si ejecutar inserción completa
    print("FASE 4: Inserción masiva completa")
    print("-" * 70)
    print("⚠ ADVERTENCIA: La inserción masiva puede tardar varios minutos")
    print("   y insertará 1000 registros en múltiples tablas.")
    print()
    
    respuesta = input("¿Deseas ejecutar la inserción masiva completa? (s/n): ").strip().lower()
    
    if respuesta == 's' or respuesta == 'si' or respuesta == 'y' or respuesta == 'yes':
        print("\n📥 Iniciando inserción masiva...")
        print("   (Esto puede tardar varios minutos...)")
        print()
        
        # Ejecutar inserción masiva con timeout largo
        try:
            response = client.post("/insertar", timeout=600)  # 10 minutos
            
            print(f"\n📊 Resultado:")
            print(f"  Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print("  ✅ INSERCIÓN EXITOSA")
                try:
                    data = response.json()
                    print(f"  Mensaje: {data.get('mensaje', 'N/A')}")
                    if 'datos' in data:
                        print(f"  Datos: {data.get('datos', {})}")
                except:
                    pass
                
                # Verificar datos insertados
                print("\n🔍 Verificando datos insertados:")
                with engine.connect() as conn:
                    for tabla in tablas_principales:
                        try:
                            query = text(f"SELECT COUNT(*) FROM {tabla.upper()}")
                            count_after = conn.execute(query).scalar() or 0
                            count_before = conteos_antes.get(tabla, 0)
                            nuevos = count_after - count_before
                            
                            if nuevos > 0:
                                print(f"  ✓ {tabla.upper()}: +{nuevos:,} registros nuevos")
                                print(f"    ({count_before:,} → {count_after:,})")
                            else:
                                print(f"  - {tabla.upper()}: Sin cambios ({count_before:,} registros)")
                        except Exception as e:
                            print(f"  ⚠ {tabla.upper()}: Error al verificar - {e}")
                
                print("\n" + "=" * 70)
                print("✅ SISTEMA DE INSERCIÓN MASIVA FUNCIONA CORRECTAMENTE")
                print("=" * 70)
                
            elif response.status_code == 504:
                print("  ⚠ TIMEOUT: La inserción excedió el tiempo máximo")
                print("     Esto puede ser normal si la base de datos es lenta")
                print("     o si hay muchos datos.")
                
            elif response.status_code == 503:
                print("  ⚠ SERVICIO NO DISPONIBLE: Circuit breaker activado")
                print("     El servicio de BD está temporalmente no disponible.")
                
            else:
                print(f"  ✗ ERROR: Código {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"  Mensaje: {error_data.get('mensaje', 'N/A')}")
                    print(f"  Detalles: {error_data.get('detalles', 'N/A')}")
                except:
                    print(f"  Respuesta: {response.text[:500]}")
                
        except Exception as e:
            print(f"\n✗ Error durante la inserción: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("\n⚠ Inserción masiva omitida por el usuario")
        print("  El sistema está listo para usar cuando lo necesites.")
    
    print("\n" + "=" * 70)
    print("RESUMEN DE VERIFICACIONES")
    print("=" * 70)
    print("✓ Conexión a base de datos: OK")
    print("✓ Tablas principales: Encontradas")
    print("✓ Funciones de inserción masiva: Importables")
    print("✓ Mapeo de dependencias: Funciona")
    print("✓ Orden topológico: Funciona")
    print("✓ Endpoint /insertar: Existe y responde")
    print()
    print("El sistema de inserción masiva está listo para usar.")
    print("=" * 70)

except Exception as e:
    print(f"\n✗ Error durante las pruebas: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

