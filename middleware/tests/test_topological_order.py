"""
Tests para el módulo TopologicalOrder.
Verifica que el orden topológico respeta las prioridades definidas.
"""
import pytest
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine

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
from database_config import build_connection_string
from TopologicalOrder import (
    obtener_orden_topologico,
    obtener_orden_topologico_flat,
    obtener_informacion_dependencias,
    obtener_prioridad_tabla,
    PRIORIDAD_TABLAS
)


@pytest.fixture(scope="function")
def db_engine():
    """Fixture que proporciona un engine de base de datos."""
    engine = create_engine(build_connection_string())
    yield engine
    engine.dispose()


def test_orden_topologico_con_prioridades(db_engine):
    """Test que verifica que el orden topológico respeta las prioridades."""
    print("\n" + "=" * 80)
    print("TEST: Orden Topológico con Prioridades")
    print("=" * 80)
    
    # Obtener orden topológico
    niveles = obtener_orden_topologico(db_engine)
    
    print(f"\nTotal de niveles: {len(niveles)}")
    print("\nOrden de inserción por niveles (con prioridades):")
    print("-" * 80)
    
    # Verificar que usuario está en el primer nivel o muy temprano
    usuario_encontrado = False
    lote_encontrado = False
    recibos_encontrados = False
    listados_encontrados = False
    
    for i, nivel in enumerate(niveles, 1):
        print(f"\nNivel {i} ({len(nivel)} tabla(s)):")
        
        # Mostrar prioridades de cada tabla
        for tabla in nivel:
            prioridad = obtener_prioridad_tabla(tabla)
            print(f"  - {tabla:40s} (Prioridad: {prioridad})")
            
            # Verificar orden de prioridades
            if tabla.lower() == 'usuario':
                usuario_encontrado = True
                print(f"    ✓ Usuario encontrado en nivel {i}")
            elif tabla.lower() == 'lote':
                lote_encontrado = True
                print(f"    ✓ Lote encontrado en nivel {i}")
                # Verificar que usuario ya fue encontrado
                assert usuario_encontrado, "Lote debe estar después de Usuario"
            elif tabla.lower() == 'recibo':
                recibos_encontrados = True
                print(f"    ✓ Recibo encontrado en nivel {i}")
            elif tabla.lower() in ['maleza', 'especie', 'hongo', 'deposito', 'metodo', 'autocompletado']:
                listados_encontrados = True
                print(f"    ✓ Listado encontrado: {tabla}")
    
    print("\n" + "=" * 80)
    print("RESUMEN DE VERIFICACIONES:")
    print("=" * 80)
    print(f"✓ Usuario encontrado: {usuario_encontrado}")
    print(f"✓ Lote encontrado: {lote_encontrado}")
    print(f"✓ Listados encontrados: {listados_encontrados}")
    print(f"✓ Recibos encontrados: {recibos_encontrados}")
    
    # Verificaciones
    assert len(niveles) > 0, "Debe haber al menos un nivel"
    assert usuario_encontrado, "Usuario debe estar en el orden topológico"
    assert lote_encontrado, "Lote debe estar en el orden topológico"
    
    print("\n✓ Test completado exitosamente")


def test_orden_topologico_flat(db_engine):
    """Test que muestra el orden topológico como lista plana."""
    print("\n" + "=" * 80)
    print("TEST: Orden Topológico (Lista Plana)")
    print("=" * 80)
    
    tablas_ordenadas = obtener_orden_topologico_flat(db_engine)
    
    print(f"\nTotal de tablas: {len(tablas_ordenadas)}")
    print("\nOrden de inserción (lista plana):")
    print("-" * 80)
    
    # Encontrar posiciones de tablas clave
    posiciones = {}
    for i, tabla in enumerate(tablas_ordenadas, 1):
        prioridad = obtener_prioridad_tabla(tabla)
        print(f"{i:3d}. {tabla:40s} (Prioridad: {prioridad})")
        
        if tabla.lower() in ['usuario', 'lote', 'recibo']:
            posiciones[tabla.lower()] = i
    
    print("\n" + "=" * 80)
    print("POSICIONES DE TABLAS CLAVE:")
    print("=" * 80)
    for tabla, pos in posiciones.items():
        print(f"  {tabla.capitalize()}: posición {pos}")
    
    # Verificar que usuario está antes que lote
    if 'usuario' in posiciones and 'lote' in posiciones:
        assert posiciones['usuario'] < posiciones['lote'], \
            f"Usuario (posición {posiciones['usuario']}) debe estar antes que Lote (posición {posiciones['lote']})"
        print(f"\n✓ Usuario ({posiciones['usuario']}) está antes que Lote ({posiciones['lote']})")
    
    print("\n✓ Test completado exitosamente")


def test_prioridades_tablas():
    """Test que verifica las prioridades de las tablas."""
    print("\n" + "=" * 80)
    print("TEST: Prioridades de Tablas")
    print("=" * 80)
    
    # Tablas de prueba
    tablas_test = [
        'usuario',
        'lote',
        'maleza',
        'especie',
        'hongo',
        'deposito',
        'metodo',
        'recibo',
        'dosn',
        'pureza',
        'germinacion',
        'pms',
        'sanitario',
        'tetrazolio',
        'dosn_cultivo',
        'dosn_maleza',
        'usuario_lote',
        'logs'
    ]
    
    print("\nPrioridades de tablas:")
    print("-" * 80)
    
    prioridades_obtenidas = {}
    for tabla in tablas_test:
        prioridad = obtener_prioridad_tabla(tabla)
        prioridades_obtenidas[tabla] = prioridad
        print(f"  {tabla:30s} -> Prioridad {prioridad}")
    
    # Verificar prioridades esperadas
    assert prioridades_obtenidas['usuario'] == 1, "Usuario debe tener prioridad 1"
    assert prioridades_obtenidas['lote'] == 2, "Lote debe tener prioridad 2"
    assert prioridades_obtenidas['maleza'] == 3, "Maleza debe tener prioridad 3"
    assert prioridades_obtenidas['recibo'] == 4, "Recibo debe tener prioridad 4"
    assert prioridades_obtenidas['dosn'] == 5, "DOSN debe tener prioridad 5"
    
    print("\n✓ Todas las prioridades son correctas")


def test_informacion_dependencias(db_engine):
    """Test que muestra información detallada de dependencias."""
    print("\n" + "=" * 80)
    print("TEST: Información de Dependencias")
    print("=" * 80)
    
    mapeo = obtener_informacion_dependencias(db_engine)
    
    print(f"\nTotal de tablas mapeadas: {len(mapeo)}")
    print("\nInformación de dependencias (primeras 10 tablas):")
    print("-" * 80)
    
    for i, (tabla, info) in enumerate(list(mapeo.items())[:10], 1):
        prioridad = obtener_prioridad_tabla(tabla)
        print(f"\n{i}. {tabla} (Prioridad: {prioridad})")
        print(f"   Dependencias válidas: {len(info['dependencias_validas'])}")
        if info['dependencias_validas']:
            for tabla_ref, col in info['dependencias_validas'][:3]:  # Mostrar solo las primeras 3
                print(f"     -> {tabla_ref}.{col}")
        print(f"   Tablas que dependen de esta: {len(info['tablas_dependientes'])}")
        if info['tablas_dependientes']:
            for tabla_dep in info['tablas_dependientes'][:3]:  # Mostrar solo las primeras 3
                print(f"     <- {tabla_dep}")
    
    print("\n✓ Test completado exitosamente")


if __name__ == "__main__":
    # Ejecutar tests con pytest para ver los prints
    pytest.main([__file__, "-v", "-s"])

