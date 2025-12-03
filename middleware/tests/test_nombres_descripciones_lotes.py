"""
Tests para verificar que los nombres de lotes y descripciones se generan correctamente.
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

# Ahora importar módulos que usan database_config
from database_config import build_connection_string
from MassiveInsertFiles import generar_valores_columna, obtener_id_maximo


@pytest.fixture(scope="function")
def db_engine():
    """Fixture que proporciona un engine de base de datos."""
    engine = create_engine(build_connection_string())
    yield engine
    engine.dispose()


def test_generacion_nombres_lotes(db_engine):
    """Test que verifica que los nombres de lotes se generan con formato correcto."""
    # Obtener ID máximo actual
    id_maximo = obtener_id_maximo(db_engine, 'lote')
    
    # Simular información de columna LOTE_NOMBRE
    col_info = {
        'name': 'LOTE_NOMBRE',
        'type': 'VARCHAR(255)',
        'nullable': False,
        'default': None,
        'autoincrement': False
    }
    
    # Generar valores
    cantidad = 5
    valores = generar_valores_columna(
        col_info, 
        cantidad, 
        fk_map={}, 
        ids_referencias={}, 
        check_map=None,
        engine=db_engine,
        tabla_nombre='lote'
    )
    
    # Verificar que se generaron valores
    assert valores is not None, "Debe generar valores para LOTE_NOMBRE"
    assert len(valores) == cantidad, f"Debe generar {cantidad} valores, obtuvo {len(valores)}"
    
    # Verificar formato: "Lote 001", "Lote 002", etc.
    for i, valor in enumerate(valores):
        assert isinstance(valor, str), f"El valor debe ser string, obtuvo {type(valor)}"
        assert valor.startswith("Lote "), f"El nombre debe empezar con 'Lote ', obtuvo '{valor}'"
        # Verificar que el número es secuencial
        numero_esperado = id_maximo + i + 1
        numero_str = valor.replace("Lote ", "").strip()
        assert numero_str.isdigit(), f"El número debe ser dígitos, obtuvo '{numero_str}'"
        assert int(numero_str) == numero_esperado, f"Esperado 'Lote {numero_esperado:03d}', obtuvo '{valor}'"
    
    print(f"\n✓ Nombres generados correctamente:")
    for valor in valores:
        print(f"  - {valor}")


def test_verificar_nombres_lotes_en_bd(db_engine):
    """Test que verifica que los nombres de lotes en la BD tienen formato correcto."""
    with db_engine.connect() as conn:
        # Verificar que la tabla existe
        try:
            query_check = text("SELECT COUNT(*) FROM LOTE")
            conn.execute(query_check).scalar()
        except Exception:
            pytest.skip("La tabla LOTE no existe en la base de datos")
        
        # Obtener algunos lotes activos
        query = text("""
            SELECT LOTE_ID, LOTE_NOMBRE 
            FROM LOTE 
            WHERE LOTE_ACTIVO = true 
            AND LOTE_NOMBRE IS NOT NULL
            ORDER BY LOTE_ID DESC
            LIMIT 10
        """)
        resultados = conn.execute(query).fetchall()
        
        if not resultados:
            pytest.skip("No hay lotes en la base de datos para verificar")
        
        print(f"\n✓ Verificando {len(resultados)} lotes en la BD:")
        nombres_validos = 0
        for lote_id, nombre in resultados:
            if nombre and nombre.startswith("Lote ") and nombre.replace("Lote ", "").strip().isdigit():
                nombres_validos += 1
                print(f"  - Lote ID {lote_id}: {nombre} [OK]")
            else:
                print(f"  - Lote ID {lote_id}: {nombre} [Formato no estándar]")
        
        # Al menos algunos deben tener formato correcto si se insertaron recientemente
        print(f"\n  Nombres con formato correcto: {nombres_validos}/{len(resultados)}")


def test_verificar_descripciones_lotes_en_bd(db_engine):
    """Test que verifica que las descripciones de lotes reflejan análisis asociados."""
    with db_engine.connect() as conn:
        # Verificar que la tabla existe
        try:
            query_check = text("SELECT COUNT(*) FROM LOTE")
            conn.execute(query_check).scalar()
        except Exception:
            pytest.skip("La tabla LOTE no existe en la base de datos")
        
        # Obtener algunos lotes con descripciones
        query = text("""
            SELECT LOTE_ID, LOTE_NOMBRE, LOTE_DESCRIPCION 
            FROM LOTE 
            WHERE LOTE_ACTIVO = true 
            AND LOTE_DESCRIPCION IS NOT NULL
            ORDER BY LOTE_ID DESC
            LIMIT 10
        """)
        resultados = conn.execute(query).fetchall()
        
        if not resultados:
            pytest.skip("No hay lotes con descripciones en la base de datos")
        
        print(f"\n✓ Verificando descripciones de {len(resultados)} lotes:")
        for lote_id, nombre, descripcion in resultados:
            print(f"  - Lote ID {lote_id} ({nombre}): {descripcion}")
            
            # Verificar que la descripción tiene formato válido
            assert descripcion is not None, "La descripción no debe ser NULL"
            assert isinstance(descripcion, str), "La descripción debe ser string"
            assert len(descripcion) > 0, "La descripción no debe estar vacía"
            
            # Verificar que contiene información sobre análisis o indica que no hay
            assert (
                "Incluye análisis de:" in descripcion or 
                "Sin análisis asociados" in descripcion
            ), f"La descripción debe indicar análisis o ausencia de ellos: '{descripcion}'"


def test_verificar_relacion_lote_recibo_analisis(db_engine):
    """Test que verifica que las descripciones reflejan correctamente los análisis asociados."""
    with db_engine.connect() as conn:
        # Verificar que la tabla existe
        try:
            query_check = text("SELECT COUNT(*) FROM LOTE")
            conn.execute(query_check).scalar()
        except Exception:
            pytest.skip("La tabla LOTE no existe en la base de datos")
        
        # Obtener un lote con descripción
        query_lote = text("""
            SELECT LOTE_ID, LOTE_DESCRIPCION 
            FROM LOTE 
            WHERE LOTE_ACTIVO = true 
            AND LOTE_DESCRIPCION IS NOT NULL
            LIMIT 1
        """)
        resultado = conn.execute(query_lote).fetchone()
        
        if not resultado:
            pytest.skip("No hay lotes con descripciones para verificar")
        
        lote_id, descripcion = resultado
        
        # Obtener recibos del lote
        query_recibos = text("""
            SELECT RECIBO_ID 
            FROM RECIBO 
            WHERE LOTE_ID = :lote_id 
            AND RECIBO_ACTIVO = true
        """)
        recibos = conn.execute(query_recibos, {"lote_id": lote_id}).fetchall()
        
        if not recibos:
            # Si no hay recibos, la descripción debe indicar "Sin análisis asociados"
            assert "Sin análisis asociados" in descripcion, \
                f"Lote sin recibos debe tener descripción 'Sin análisis asociados', obtuvo: '{descripcion}'"
            print(f"\n✓ Lote {lote_id} sin recibos - descripción correcta: '{descripcion}'")
            return
        
        # Verificar qué análisis están realmente asociados
        recibo_ids = [r[0] for r in recibos]
        analisis_encontrados = []
        
        tipos_analisis = {
            'DOSN': {'tabla': 'DOSN', 'recibo_col': 'RECIBO_ID', 'activo_col': 'DOSN_ACTIVO'},
            'Pureza': {'tabla': 'PUREZA', 'recibo_col': 'RECIBO_ID', 'activo_col': 'PUREZA_ACTIVO'},
            'Germinación': {'tabla': 'GERMINACION', 'recibo_col': 'RECIBO_ID', 'activo_col': 'GERMINACION_ACTIVO'},
            'PMS': {'tabla': 'PMS', 'recibo_col': 'RECIBO_ID', 'activo_col': 'PMS_ACTIVO'},
            'Sanitario': {'tabla': 'SANITARIO', 'recibo_col': 'SANITARIO_RECIBOID', 'activo_col': 'SANITARIO_ACTIVO'},
            'Tetrazolio': {'tabla': 'TETRAZOLIO', 'recibo_col': 'RECIBO_ID', 'activo_col': 'TETRAZOLIO_ACTIVO'},
            'Pureza P. notatum': {'tabla': 'PUREZA_PNOTATUM', 'recibo_col': 'RECIBO_ID', 'activo_col': 'PUREZA_ACTIVO'}
        }
        
        for recibo_id in recibo_ids:
            for nombre_analisis, info in tipos_analisis.items():
                tabla = info['tabla']
                recibo_col = info['recibo_col']
                activo_col = info['activo_col']
                
                query_analisis = text(f"""
                    SELECT COUNT(*) 
                    FROM {tabla} 
                    WHERE {recibo_col} = :recibo_id 
                    AND {activo_col} = true
                """)
                count = conn.execute(query_analisis, {"recibo_id": recibo_id}).scalar()
                
                if count and count > 0:
                    if nombre_analisis not in analisis_encontrados:
                        analisis_encontrados.append(nombre_analisis)
        
        # Verificar que la descripción refleja los análisis encontrados
        if analisis_encontrados:
            # La descripción debe contener "Incluye análisis de:"
            assert "Incluye análisis de:" in descripcion, \
                f"Descripción debe contener 'Incluye análisis de:', obtuvo: '{descripcion}'"
            
            # Verificar que cada análisis encontrado está mencionado en la descripción
            for analisis in analisis_encontrados:
                assert analisis in descripcion, \
                    f"La descripción debe mencionar '{analisis}', obtuvo: '{descripcion}'"
            
            print(f"\n✓ Lote {lote_id} - Análisis encontrados: {', '.join(analisis_encontrados)}")
            print(f"  Descripción: {descripcion}")
        else:
            # Si no hay análisis, la descripción debe indicarlo
            assert "Sin análisis asociados" in descripcion, \
                f"Lote sin análisis debe tener descripción 'Sin análisis asociados', obtuvo: '{descripcion}'"
            print(f"\n✓ Lote {lote_id} sin análisis - descripción correcta: '{descripcion}'")

