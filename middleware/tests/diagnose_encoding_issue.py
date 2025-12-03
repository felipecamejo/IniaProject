"""
Script de diagnóstico para identificar problemas de codificación en la base de datos.
Este script ayuda a identificar qué tabla o columna está causando el error UnicodeDecodeError.
"""
import os
import sys
from pathlib import Path

# Agregar el directorio raíz del middleware al path
middleware_root = Path(__file__).parent.parent
sys.path.insert(0, str(middleware_root))

# Configurar variables de entorno
os.environ.setdefault('DB_PASSWORD', 'Inia2024SecurePass!')
os.environ.setdefault('DB_USER', 'postgres')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')
os.environ.setdefault('DB_NAME', 'Inia')

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.automap import automap_base
from database_config import build_connection_string
import traceback

def verificar_encoding_bd():
    """Verifica el encoding de la base de datos PostgreSQL."""
    print("=" * 80)
    print("VERIFICANDO ENCODING DE BASE DE DATOS")
    print("=" * 80)
    
    try:
        conn_str = build_connection_string()
        engine = create_engine(conn_str)
        
        with engine.connect() as conn:
            # Verificar server encoding
            result = conn.execute(text("SHOW server_encoding"))
            server_encoding = result.scalar()
            print(f"Server Encoding: {server_encoding}")
            
            # Verificar client encoding
            result = conn.execute(text("SHOW client_encoding"))
            client_encoding = result.scalar()
            print(f"Client Encoding: {client_encoding}")
            
            # Verificar encoding de la base de datos
            result = conn.execute(text(
                "SELECT datname, pg_encoding_to_char(encoding) as encoding "
                "FROM pg_database WHERE datname = current_database()"
            ))
            db_info = result.fetchone()
            if db_info:
                print(f"Database Encoding: {db_info[1]}")
            
            print()
            return True
    except Exception as e:
        print(f"Error verificando encoding: {e}")
        traceback.print_exc()
        return False

def listar_todas_las_tablas():
    """Lista todas las tablas en la base de datos."""
    print("=" * 80)
    print("LISTANDO TODAS LAS TABLAS")
    print("=" * 80)
    
    try:
        conn_str = build_connection_string()
        engine = create_engine(conn_str)
        inspector = inspect(engine)
        
        # Obtener todas las tablas de todos los esquemas
        schemas = inspector.get_schema_names()
        todas_las_tablas = []
        
        for schema in schemas:
            if schema in ['pg_catalog', 'information_schema']:
                continue
            tablas = inspector.get_table_names(schema=schema)
            for tabla in tablas:
                todas_las_tablas.append((schema, tabla))
        
        print(f"Total de tablas encontradas: {len(todas_las_tablas)}")
        print("\nTablas por esquema:")
        for schema, tabla in todas_las_tablas:
            print(f"  {schema}.{tabla}")
        
        print()
        return todas_las_tablas
    except Exception as e:
        print(f"Error listando tablas: {e}")
        traceback.print_exc()
        return []

def verificar_caracteres_especiales_tablas(tablas):
    """Verifica si hay caracteres especiales en los nombres de tablas."""
    print("=" * 80)
    print("VERIFICANDO CARACTERES ESPECIALES EN NOMBRES DE TABLAS")
    print("=" * 80)
    
    problemas = []
    for schema, tabla in tablas:
        try:
            # Intentar codificar/decodificar el nombre
            tabla_bytes = tabla.encode('utf-8')
            tabla_decoded = tabla_bytes.decode('utf-8')
            
            # Verificar si hay caracteres no-ASCII
            tiene_especiales = any(ord(c) > 127 for c in tabla)
            if tiene_especiales:
                problemas.append((schema, tabla, "Contiene caracteres no-ASCII"))
                print(f"⚠ {schema}.{tabla} - Contiene caracteres no-ASCII")
        except UnicodeError as e:
            problemas.append((schema, tabla, str(e)))
            print(f"✗ {schema}.{tabla} - Error de codificación: {e}")
    
    if not problemas:
        print("✓ No se encontraron problemas de codificación en nombres de tablas")
    
    print()
    return problemas

def verificar_caracteres_especiales_columnas():
    """Verifica si hay caracteres especiales en los nombres de columnas."""
    print("=" * 80)
    print("VERIFICANDO CARACTERES ESPECIALES EN NOMBRES DE COLUMNAS")
    print("=" * 80)
    
    try:
        conn_str = build_connection_string()
        engine = create_engine(conn_str)
        inspector = inspect(engine)
        
        schemas = inspector.get_schema_names()
        problemas = []
        
        for schema in schemas:
            if schema in ['pg_catalog', 'information_schema']:
                continue
            tablas = inspector.get_table_names(schema=schema)
            for tabla in tablas:
                try:
                    columnas = inspector.get_columns(tabla, schema=schema)
                    for columna in columnas:
                        nombre_col = columna['name']
                        try:
                            nombre_col.encode('utf-8').decode('utf-8')
                            tiene_especiales = any(ord(c) > 127 for c in nombre_col)
                            if tiene_especiales:
                                problemas.append((schema, tabla, nombre_col))
                                print(f"⚠ {schema}.{tabla}.{nombre_col} - Contiene caracteres no-ASCII")
                        except UnicodeError as e:
                            problemas.append((schema, tabla, nombre_col))
                            print(f"✗ {schema}.{tabla}.{nombre_col} - Error de codificación: {e}")
                except Exception as e:
                    print(f"Error verificando columnas de {schema}.{tabla}: {e}")
        
        if not problemas:
            print("✓ No se encontraron problemas de codificación en nombres de columnas")
        
        print()
        return problemas
    except Exception as e:
        print(f"Error verificando columnas: {e}")
        traceback.print_exc()
        return []

def reflejar_tablas_incrementalmente(tablas):
    """Intenta reflejar tablas de forma incremental para identificar la problemática."""
    print("=" * 80)
    print("REFLECTANDO TABLAS INCREMENTALMENTE")
    print("=" * 80)
    
    conn_str = build_connection_string()
    engine = create_engine(
        conn_str,
        connect_args={
            'client_encoding': 'UTF8',
            'options': '-c client_encoding=UTF8'
        }
    )
    
    tablas_exitosas = []
    tablas_con_error = []
    
    # Intentar reflejar todas las tablas primero
    print("\n[Paso 1] Intentando reflejar todas las tablas...")
    try:
        Base = automap_base()
        Base.prepare(autoload_with=engine, generate_relationship=None)
        print(f"✓ Éxito reflejando todas las tablas: {len(Base.classes)} tablas")
        return tablas_exitosas, tablas_con_error
    except UnicodeDecodeError as e:
        print(f"✗ Error de codificación al reflejar todas las tablas: {e}")
        print(f"  Posición del error: {e.start if hasattr(e, 'start') else 'desconocida'}")
        print(f"  Byte problemático: {hex(e.object[e.start]) if hasattr(e, 'object') and hasattr(e, 'start') else 'desconocido'}")
    except Exception as e:
        print(f"✗ Error inesperado: {e}")
        traceback.print_exc()
    
    # Si falla, intentar reflejar tabla por tabla
    print("\n[Paso 2] Intentando reflejar tabla por tabla...")
    for schema, tabla in tablas:
        try:
            Base = automap_base()
            # Intentar reflejar solo esta tabla
            metadata = Base.metadata
            metadata.reflect(engine, only=[tabla], schema=schema)
            Base.prepare()
            tablas_exitosas.append((schema, tabla))
            print(f"✓ {schema}.{tabla} - OK")
        except UnicodeDecodeError as e:
            tablas_con_error.append((schema, tabla, "UnicodeDecodeError", str(e)))
            print(f"✗ {schema}.{tabla} - Error de codificación: {e}")
        except Exception as e:
            tablas_con_error.append((schema, tabla, type(e).__name__, str(e)))
            print(f"⚠ {schema}.{tabla} - Error: {e}")
    
    print(f"\nResumen:")
    print(f"  Tablas exitosas: {len(tablas_exitosas)}")
    print(f"  Tablas con error: {len(tablas_con_error)}")
    
    if tablas_con_error:
        print("\nTablas con problemas:")
        for schema, tabla, error_type, error_msg in tablas_con_error:
            print(f"  {schema}.{tabla} - {error_type}: {error_msg[:100]}")
    
    print()
    return tablas_exitosas, tablas_con_error

def generar_reporte(tablas_problema_tablas, tablas_problema_columnas, tablas_con_error):
    """Genera un reporte con los problemas encontrados."""
    print("=" * 80)
    print("REPORTE FINAL")
    print("=" * 80)
    
    if not tablas_problema_tablas and not tablas_problema_columnas and not tablas_con_error:
        print("✓ No se encontraron problemas de codificación")
        print("  El error puede estar en otro lugar (metadatos, comentarios, etc.)")
        return
    
    if tablas_problema_tablas:
        print("\nPROBLEMAS EN NOMBRES DE TABLAS:")
        for schema, tabla, motivo in tablas_problema_tablas:
            print(f"  - {schema}.{tabla}: {motivo}")
    
    if tablas_problema_columnas:
        print("\nPROBLEMAS EN NOMBRES DE COLUMNAS:")
        for schema, tabla, columna in tablas_problema_columnas:
            print(f"  - {schema}.{tabla}.{columna}")
    
    if tablas_con_error:
        print("\nTABLAS QUE FALLAN AL REFLEJAR:")
        for schema, tabla, error_type, error_msg in tablas_con_error:
            print(f"  - {schema}.{tabla}: {error_type}")
            print(f"    {error_msg[:200]}")
    
    print("\nRECOMENDACIONES:")
    if tablas_con_error:
        print("  1. Considerar reflejar solo las tablas que funcionan")
        print("  2. Usar 'only' parameter en Base.prepare() para excluir tablas problemáticas")
        print("  3. Verificar y corregir encoding de la base de datos si es necesario")
    else:
        print("  1. El problema puede estar en metadatos o comentarios de la BD")
        print("  2. Considerar usar encoding diferente en la conexión")
        print("  3. Verificar configuración de PostgreSQL")

def main():
    """Función principal del diagnóstico."""
    print("\n" + "=" * 80)
    print("DIAGNÓSTICO DE PROBLEMAS DE CODIFICACIÓN EN BASE DE DATOS")
    print("=" * 80 + "\n")
    
    # Paso 1: Verificar encoding
    if not verificar_encoding_bd():
        print("No se pudo verificar encoding. Continuando...\n")
    
    # Paso 2: Listar todas las tablas
    tablas = listar_todas_las_tablas()
    if not tablas:
        print("No se encontraron tablas. Abortando diagnóstico.")
        return
    
    # Paso 3: Verificar caracteres especiales en nombres de tablas
    problemas_tablas = verificar_caracteres_especiales_tablas(tablas)
    
    # Paso 4: Verificar caracteres especiales en nombres de columnas
    problemas_columnas = verificar_caracteres_especiales_columnas()
    
    # Paso 5: Intentar reflejar tablas incrementalmente
    tablas_exitosas, tablas_con_error = reflejar_tablas_incrementalmente(tablas)
    
    # Paso 6: Generar reporte
    generar_reporte(problemas_tablas, problemas_columnas, tablas_con_error)
    
    print("\n" + "=" * 80)
    print("DIAGNÓSTICO COMPLETADO")
    print("=" * 80)

if __name__ == "__main__":
    main()

