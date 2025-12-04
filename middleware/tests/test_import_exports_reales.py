"""
Tests de importación usando archivos reales de la carpeta exports.
Verifica que el sistema de importación funcione correctamente con archivos reales exportados.
"""
import pytest
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

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

# Ahora importar módulos de importación
from database_config import build_connection_string
from ImportExcel import (
    inicializar_automap,
    MODELS,
    detect_format_from_path,
    import_one_file,
    asegurar_autoincrementos,
    _detectar_modelo_para_archivo,
    MAPEO_NOMBRES_ARCHIVOS
)


@pytest.fixture(scope="module")
def engine():
    """Fixture que proporciona un engine de SQLAlchemy."""
    engine = create_engine(build_connection_string())
    inicializar_automap(engine)
    yield engine
    engine.dispose()


@pytest.fixture(scope="module")
def session_factory(engine):
    """Fixture que proporciona una factory de sesiones."""
    return sessionmaker(bind=engine)


@pytest.fixture(scope="module")
def exports_dir():
    """Fixture que retorna la ruta al directorio de exports."""
    exports_path = middleware_root / "exports"
    if not exports_path.exists():
        pytest.skip(f"Directorio exports no encontrado: {exports_path}")
    return exports_path


@pytest.fixture(scope="module")
def archivos_exports(exports_dir):
    """Fixture que retorna lista de archivos .xlsx en exports."""
    archivos = list(exports_dir.glob("*.xlsx"))
    if not archivos:
        pytest.skip(f"No se encontraron archivos .xlsx en {exports_dir}")
    return sorted(archivos)


def test_exports_dir_existe(exports_dir):
    """Verifica que el directorio exports existe."""
    assert exports_dir.exists(), f"El directorio exports no existe: {exports_dir}"
    assert exports_dir.is_dir(), f"La ruta exports no es un directorio: {exports_dir}"


def test_archivos_exports_encontrados(archivos_exports):
    """Verifica que se encontraron archivos para importar."""
    assert len(archivos_exports) > 0, "No se encontraron archivos .xlsx en exports"
    print(f"\nArchivos encontrados para importar: {len(archivos_exports)}")


def test_mapeo_nombres_archivos_completo():
    """Verifica que el mapeo de nombres de archivos está completo."""
    assert MAPEO_NOMBRES_ARCHIVOS is not None
    assert len(MAPEO_NOMBRES_ARCHIVOS) > 0
    print(f"\nMapeo de nombres de archivos: {len(MAPEO_NOMBRES_ARCHIVOS)} entradas")


def test_modelos_inicializados(engine):
    """Verifica que los modelos están inicializados."""
    assert MODELS is not None
    assert len(MODELS) > 0
    print(f"\nModelos disponibles: {len(MODELS)} tablas")


def test_deteccion_formato_archivos(archivos_exports):
    """Verifica que se puede detectar el formato de todos los archivos."""
    formatos_detectados = {}
    for archivo in archivos_exports:
        formato = detect_format_from_path(str(archivo))
        assert formato in ('xlsx', 'csv'), f"Formato no reconocido para {archivo.name}: {formato}"
        formatos_detectados[formato] = formatos_detectados.get(formato, 0) + 1
    
    print(f"\nFormatos detectados: {formatos_detectados}")


def test_deteccion_tabla_por_nombre_archivo(archivos_exports, engine):
    """Verifica que se puede detectar la tabla para cada archivo por su nombre."""
    from ImportExcel import detectar_tabla_por_nombre_archivo
    
    detecciones_exitosas = 0
    detecciones_con_tabla_inexistente = []
    detecciones_fallidas = []
    
    for archivo in archivos_exports:
        nombre_archivo = archivo.name
        tabla_detectada = detectar_tabla_por_nombre_archivo(nombre_archivo)
        
        if tabla_detectada:
            # Verificar que la tabla existe en MODELS
            if tabla_detectada in MODELS:
                detecciones_exitosas += 1
            else:
                # La tabla fue detectada pero no existe en MODELS (puede ser una tabla que no está en la BD)
                detecciones_con_tabla_inexistente.append((nombre_archivo, tabla_detectada))
        else:
            detecciones_fallidas.append(nombre_archivo)
    
    print(f"\nDetecciones por nombre de archivo:")
    print(f"  - Exitosas (tabla existe en MODELS): {detecciones_exitosas}/{len(archivos_exports)}")
    if detecciones_con_tabla_inexistente:
        print(f"  - Detectadas pero tabla no en MODELS: {len(detecciones_con_tabla_inexistente)} archivos")
        for nombre, tabla in detecciones_con_tabla_inexistente[:3]:
            print(f"    - {nombre} -> {tabla}")
    if detecciones_fallidas:
        print(f"  - Sin detección: {len(detecciones_fallidas)} archivos")
        print(f"    Archivos sin detección: {', '.join(detecciones_fallidas[:5])}")
    
    # Al menos el 70% de los archivos deberían ser detectados por nombre (con o sin tabla en MODELS)
    total_detectados = detecciones_exitosas + len(detecciones_con_tabla_inexistente)
    porcentaje_exito = (total_detectados / len(archivos_exports)) * 100
    assert porcentaje_exito >= 70, f"Solo {porcentaje_exito:.1f}% de archivos fueron detectados por nombre (mínimo 70%)"
    
    # Al menos el 60% deberían tener tablas que existen en MODELS
    porcentaje_con_tabla = (detecciones_exitosas / len(archivos_exports)) * 100
    assert porcentaje_con_tabla >= 60, f"Solo {porcentaje_con_tabla:.1f}% de archivos tienen tablas válidas en MODELS (mínimo 60%)"


def test_deteccion_modelo_para_archivo(archivos_exports, engine):
    """Verifica que se puede detectar el modelo para cada archivo."""
    detecciones_exitosas = 0
    detecciones_fallidas = []
    
    for archivo in archivos_exports:
        try:
            formato = detect_format_from_path(str(archivo))
            tabla_destino, modelo = _detectar_modelo_para_archivo(
                str(archivo),
                formato,
                None  # Sin tabla especificada, detección automática
            )
            
            assert tabla_destino is not None, f"No se detectó tabla para {archivo.name}"
            assert modelo is not None, f"No se detectó modelo para {archivo.name}"
            assert tabla_destino in MODELS, f"Tabla '{tabla_destino}' no existe en MODELS"
            
            detecciones_exitosas += 1
        except Exception as e:
            detecciones_fallidas.append((archivo.name, str(e)))
    
    print(f"\nDetecciones de modelo:")
    print(f"  - Exitosas: {detecciones_exitosas}/{len(archivos_exports)}")
    if detecciones_fallidas:
        print(f"  - Fallidas: {len(detecciones_fallidas)} archivos")
        for nombre, error in detecciones_fallidas[:5]:
            print(f"    - {nombre}: {error}")
    
    # Al menos el 90% de los archivos deberían ser detectados
    porcentaje_exito = (detecciones_exitosas / len(archivos_exports)) * 100
    assert porcentaje_exito >= 90, f"Solo {porcentaje_exito:.1f}% de archivos fueron detectados (mínimo 90%)"


@pytest.mark.slow
def test_importacion_archivos_reales(archivos_exports, session_factory, engine):
    """
    Test completo de importación de archivos reales.
    Importa cada archivo y verifica que se complete exitosamente.
    """
    # Sincronizar secuencias antes de importar
    try:
        asegurar_autoincrementos(engine)
        print("\n[OK] Secuencias sincronizadas")
    except Exception as e:
        print(f"\n[ADVERTENCIA] Error sincronizando secuencias: {e}")
    
    session = session_factory()
    
    try:
        archivos_exitosos = []
        archivos_con_errores = []
        total_insertados = 0
        total_actualizados = 0
        
        for i, archivo in enumerate(archivos_exports, 1):
            nombre_archivo = archivo.name
            print(f"\n[{i}/{len(archivos_exports)}] Procesando: {nombre_archivo}")
            
            try:
                # Detectar formato
                formato = detect_format_from_path(str(archivo))
                assert formato is not None, f"Formato no detectado para {nombre_archivo}"
                
                # Detectar tabla y modelo
                tabla_destino, modelo = _detectar_modelo_para_archivo(
                    str(archivo),
                    formato,
                    None
                )
                
                print(f"  Tabla detectada: {tabla_destino}")
                
                # Importar archivo
                resultado = import_one_file(
                    session=session,
                    model=modelo,
                    ruta_archivo=str(archivo),
                    formato=formato,
                    upsert=True,  # Actualizar si existe
                    keep_ids=False  # No mantener IDs
                )
                
                # Manejar resultado
                if isinstance(resultado, tuple):
                    if len(resultado) == 3:
                        insertados, actualizados, errores_detalle = resultado
                    elif len(resultado) == 2:
                        insertados, actualizados = resultado
                        errores_detalle = {}
                    else:
                        raise ValueError(f"Retorno inesperado: {resultado}")
                else:
                    raise ValueError(f"Retorno inesperado: {resultado}")
                
                print(f"  Insertados: {insertados}, Actualizados: {actualizados}")
                
                if errores_detalle and errores_detalle.get('total_errores', 0) > 0:
                    print(f"  [ADVERTENCIA] Errores: {errores_detalle.get('total_errores', 0)}")
                
                archivos_exitosos.append((nombre_archivo, insertados, actualizados))
                total_insertados += insertados
                total_actualizados += actualizados
                
            except Exception as e:
                print(f"  [ERROR] {e}")
                archivos_con_errores.append((nombre_archivo, str(e)))
                continue
        
        # Resumen
        print("\n" + "=" * 70)
        print("RESUMEN DE IMPORTACIÓN")
        print("=" * 70)
        print(f"Archivos procesados: {len(archivos_exports)}")
        print(f"  - Exitosos: {len(archivos_exitosos)}")
        print(f"  - Con errores: {len(archivos_con_errores)}")
        print(f"Total insertados: {total_insertados:,}")
        print(f"Total actualizados: {total_actualizados:,}")
        
        if archivos_con_errores:
            print("\nArchivos con errores:")
            for nombre, error in archivos_con_errores[:10]:
                print(f"  - {nombre}: {error[:100]}")
        
        # Verificaciones finales
        assert len(archivos_exitosos) > 0, "No se importó ningún archivo exitosamente"
        
        # Al menos el 80% de los archivos deberían importarse exitosamente
        porcentaje_exito = (len(archivos_exitosos) / len(archivos_exports)) * 100
        assert porcentaje_exito >= 80, f"Solo {porcentaje_exito:.1f}% de archivos se importaron exitosamente (mínimo 80%)"
        
        # Verificar que se insertaron o actualizaron registros
        assert total_insertados > 0 or total_actualizados > 0, "No se insertaron ni actualizaron registros"
        
    finally:
        session.close()


def test_importacion_archivo_individual(archivos_exports, session_factory, engine):
    """
    Test de importación de un archivo individual (el primero disponible).
    Útil para pruebas rápidas sin importar todos los archivos.
    """
    if not archivos_exports:
        pytest.skip("No hay archivos disponibles para importar")
    
    # Usar el primer archivo
    archivo = archivos_exports[0]
    nombre_archivo = archivo.name
    
    print(f"\nTest de importación individual: {nombre_archivo}")
    
    # Sincronizar secuencias
    try:
        asegurar_autoincrementos(engine)
    except Exception as e:
        print(f"[ADVERTENCIA] Error sincronizando secuencias: {e}")
    
    session = session_factory()
    
    try:
        # Detectar formato
        formato = detect_format_from_path(str(archivo))
        assert formato is not None, f"Formato no detectado para {nombre_archivo}"
        
        # Detectar tabla y modelo
        tabla_destino, modelo = _detectar_modelo_para_archivo(
            str(archivo),
            formato,
            None
        )
        
        assert tabla_destino is not None, f"No se detectó tabla para {nombre_archivo}"
        assert modelo is not None, f"No se detectó modelo para {nombre_archivo}"
        
        print(f"  Tabla detectada: {tabla_destino}")
        
        # Importar archivo
        resultado = import_one_file(
            session=session,
            model=modelo,
            ruta_archivo=str(archivo),
            formato=formato,
            upsert=True,
            keep_ids=False
        )
        
        # Verificar resultado
        assert isinstance(resultado, tuple), f"Resultado inesperado: {type(resultado)}"
        assert len(resultado) >= 2, f"Resultado incompleto: {resultado}"
        
        insertados, actualizados = resultado[0], resultado[1]
        
        print(f"  Insertados: {insertados}, Actualizados: {actualizados}")
        
        # Verificar que al menos se procesó algo (insertado o actualizado)
        assert insertados > 0 or actualizados > 0, f"No se insertaron ni actualizaron registros para {nombre_archivo}"
        
    finally:
        session.close()


def test_verificar_estructura_archivos(archivos_exports):
    """Verifica que los archivos tienen la estructura esperada (headers y datos)."""
    from ImportExcel import read_rows_from_xlsx
    
    archivos_validos = 0
    archivos_invalidos = []
    
    for archivo in archivos_exports[:10]:  # Probar solo los primeros 10 para no ser muy lento
        try:
            headers, rows = read_rows_from_xlsx(str(archivo), max_rows=5)
            
            assert headers is not None, f"No se pudieron leer headers de {archivo.name}"
            assert len(headers) > 0, f"Headers vacíos en {archivo.name}"
            assert len(headers) >= 3, f"Muy pocos headers en {archivo.name}: {len(headers)}"
            
            archivos_validos += 1
        except Exception as e:
            archivos_invalidos.append((archivo.name, str(e)))
    
    print(f"\nArchivos con estructura válida: {archivos_validos}/10")
    if archivos_invalidos:
        print("Archivos con problemas:")
        for nombre, error in archivos_invalidos:
            print(f"  - {nombre}: {error}")
    
    assert archivos_validos > 0, "Ningún archivo tiene estructura válida"

