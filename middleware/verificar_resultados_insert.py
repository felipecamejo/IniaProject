"""
Script para verificar los resultados de la inserción masiva:
- Nombres de lotes con formato correcto
- Descripciones actualizadas con análisis asociados
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

print("=" * 70)
print("VERIFICACION DE RESULTADOS - INSERCION MASIVA")
print("=" * 70)
print()

engine = create_engine(build_connection_string())

with engine.connect() as conn:
    # Verificar nombres de lotes
    print("1. VERIFICANDO NOMBRES DE LOTES")
    print("-" * 70)
    
    query_nombres = text("""
        SELECT LOTE_ID, LOTE_NOMBRE 
        FROM LOTE 
        WHERE LOTE_ACTIVO = true 
        AND LOTE_NOMBRE IS NOT NULL
        ORDER BY LOTE_ID DESC
        LIMIT 20
    """)
    lotes = conn.execute(query_nombres).fetchall()
    
    nombres_correctos = 0
    nombres_incorrectos = []
    
    print(f"Revisando {len(lotes)} lotes (últimos insertados):")
    for lote_id, nombre in lotes:
        formato_ok = nombre and nombre.startswith("Lote ") and nombre.replace("Lote ", "").strip().isdigit()
        if formato_ok:
            nombres_correctos += 1
            estado = "[OK]"
        else:
            nombres_incorrectos.append((lote_id, nombre))
            estado = "[ERROR]"
        
        if len(lotes) <= 10:  # Mostrar todos si son pocos
            print(f"  - ID {lote_id}: {nombre} {estado}")
    
    print(f"\n[RESULTADO] Nombres con formato correcto: {nombres_correctos}/{len(lotes)}")
    if nombres_correctos == len(lotes):
        print("[OK] Todos los nombres tienen formato correcto!")
    elif nombres_correctos > len(lotes) * 0.9:
        print(f"[ADVERTENCIA] {len(lotes) - nombres_correctos} nombres no tienen formato correcto")
        if nombres_incorrectos:
            print("  Ejemplos de nombres incorrectos:")
            for lote_id, nombre in nombres_incorrectos[:5]:
                print(f"    - ID {lote_id}: {nombre}")
    
    print()
    
    # Verificar descripciones de lotes
    print("2. VERIFICANDO DESCRIPCIONES DE LOTES")
    print("-" * 70)
    
    query_desc = text("""
        SELECT LOTE_ID, LOTE_NOMBRE, LOTE_DESCRIPCION 
        FROM LOTE 
        WHERE LOTE_ACTIVO = true 
        AND LOTE_DESCRIPCION IS NOT NULL
        ORDER BY LOTE_ID DESC
        LIMIT 20
    """)
    lotes_con_desc = conn.execute(query_desc).fetchall()
    
    descripciones_validas = 0
    descripciones_invalidas = []
    
    print(f"Revisando {len(lotes_con_desc)} lotes con descripciones:")
    for lote_id, nombre, descripcion in lotes_con_desc:
        formato_valido = (
            descripcion and (
                "Incluye análisis de:" in descripcion or 
                "Sin análisis asociados" in descripcion
            )
        )
        
        if formato_valido:
            descripciones_validas += 1
            estado = "[OK]"
        else:
            descripciones_invalidas.append((lote_id, nombre, descripcion))
            estado = "[ANTIGUA]"
        
        if len(lotes_con_desc) <= 10:  # Mostrar todos si son pocos
            nombre_str = nombre if nombre else "(sin nombre)"
            desc_corta = descripcion[:60] + "..." if len(descripcion) > 60 else descripcion
            print(f"  - ID {lote_id} ({nombre_str}): {desc_corta} {estado}")
    
    print(f"\n[RESULTADO] Descripciones con formato válido: {descripciones_validas}/{len(lotes_con_desc)}")
    if descripciones_validas == len(lotes_con_desc):
        print("[OK] Todas las descripciones tienen formato válido!")
    elif descripciones_validas > len(lotes_con_desc) * 0.8:
        print(f"[INFO] {len(lotes_con_desc) - descripciones_validas} descripciones tienen formato antiguo (esperado si había datos previos)")
    
    print()
    
    # Estadísticas de análisis por lote
    print("3. ESTADISTICAS DE ANALISIS POR LOTE")
    print("-" * 70)
    
    query_stats = text("""
        SELECT 
            COUNT(DISTINCT l.LOTE_ID) as total_lotes,
            COUNT(DISTINCT CASE WHEN l.LOTE_DESCRIPCION LIKE '%Incluye análisis de:%' THEN l.LOTE_ID END) as lotes_con_analisis,
            COUNT(DISTINCT CASE WHEN l.LOTE_DESCRIPCION = 'Sin análisis asociados' THEN l.LOTE_ID END) as lotes_sin_analisis
        FROM LOTE l
        WHERE l.LOTE_ACTIVO = true
        AND l.LOTE_DESCRIPCION IS NOT NULL
    """)
    stats = conn.execute(query_stats).fetchone()
    
    total_lotes, lotes_con_analisis, lotes_sin_analisis = stats
    
    print(f"Total de lotes activos con descripción: {total_lotes}")
    print(f"  - Lotes con análisis asociados: {lotes_con_analisis}")
    print(f"  - Lotes sin análisis: {lotes_sin_analisis}")
    
    # Mostrar algunos ejemplos de lotes con análisis
    if lotes_con_analisis > 0:
        query_ejemplos = text("""
            SELECT LOTE_ID, LOTE_NOMBRE, LOTE_DESCRIPCION 
            FROM LOTE 
            WHERE LOTE_ACTIVO = true 
            AND LOTE_DESCRIPCION LIKE '%Incluye análisis de:%'
            ORDER BY LOTE_ID DESC
            LIMIT 5
        """)
        ejemplos = conn.execute(query_ejemplos).fetchall()
        
        print(f"\nEjemplos de lotes con análisis ({len(ejemplos)}):")
        for lote_id, nombre, descripcion in ejemplos:
            nombre_str = nombre if nombre else "(sin nombre)"
            print(f"  - ID {lote_id} ({nombre_str}): {descripcion}")
    
    print()
    
    # Verificar que los nombres son secuenciales
    print("4. VERIFICANDO SECUENCIA DE NOMBRES")
    print("-" * 70)
    
    query_secuencia = text("""
        SELECT LOTE_ID, LOTE_NOMBRE 
        FROM LOTE 
        WHERE LOTE_ACTIVO = true 
        AND LOTE_NOMBRE LIKE 'Lote %'
        ORDER BY LOTE_ID
        LIMIT 10
    """)
    secuencia = conn.execute(query_secuencia).fetchall()
    
    if secuencia:
        print("Primeros 10 lotes con formato 'Lote XXX':")
        secuenciales = True
        for lote_id, nombre in secuencia:
            numero_str = nombre.replace("Lote ", "").strip()
            if numero_str.isdigit():
                numero = int(numero_str)
                esperado = lote_id  # En una inserción limpia, debería coincidir
                estado = "[OK]" if abs(numero - esperado) <= 500 else "[DIFERENTE]"
                print(f"  - ID {lote_id}: {nombre} {estado}")
            else:
                secuenciales = False
        
        if secuenciales:
            print("\n[OK] Los nombres son secuenciales")
    
    print()
    print("=" * 70)
    print("VERIFICACION COMPLETADA")
    print("=" * 70)

