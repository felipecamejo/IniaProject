import pandas as pd
from sqlalchemy import create_engine, Column, Integer, String, Date, Float, Text
from sqlalchemy.orm import declarative_base, sessionmaker
import logging
import os
from dotenv import load_dotenv, find_dotenv
from urllib.parse import quote_plus

"""
Carga robusta de variables .env con codificación por defecto UTF-8 y
retroceso a Latin-1 (Windows-1252) para evitar UnicodeDecodeError típicos
cuando el archivo fue guardado en ANSI.
"""
dotenv_path = find_dotenv()
if dotenv_path:
    try:
        load_dotenv(dotenv_path=dotenv_path, override=True, encoding='utf-8')
    except UnicodeDecodeError:
        load_dotenv(dotenv_path=dotenv_path, override=True, encoding='latin-1')
else:
    # Si no hay .env, intentar variables de entorno del sistema
    load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Obtener variables de entorno
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASS')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')

def build_connection_string():
    """Construye la cadena de conexión escapando credenciales.

    Escapar evita errores cuando la contraseña/usuario contienen caracteres no ASCII
    o reservados en URLs.
    """
    user_esc = quote_plus(DB_USER or '')
    pass_esc = quote_plus(DB_PASSWORD or '')
    host = DB_HOST or 'localhost'
    port = DB_PORT or '5432'
    db = DB_NAME or ''
    return f'postgresql://{user_esc}:{pass_esc}@{host}:{port}/{db}'

# Crear la base declarativa (SQLAlchemy 2.0)
Base = declarative_base()

# Definir la estructura de la tabla
class MiTabla(Base):
    __tablename__ = 'mi_tabla'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(255), unique=True)
    edad = Column(Integer)
    fecha_registro = Column(Date)
    salario = Column(Float)
    descripcion = Column(Text)

def crear_tabla():
    """Crear la tabla en la base de datos"""
    try:
        # Verificar que las variables estén cargadas
        print(f"Conectando a: {DB_HOST}:{DB_PORT}/{DB_NAME} como {DB_USER}")
        
        connection_string = build_connection_string()
        engine = create_engine(connection_string)
        
        # Crear todas las tablas definidas
        Base.metadata.create_all(engine)
        logger.info("Tabla 'mi_tabla' creada correctamente")
        
        return engine
        
    except Exception as e:
        logger.error(f"Error creando tabla: {e}")
        return None

def insertar_datos_desde_excel(archivo_excel):
    """Leer Excel e insertar datos en la tabla creada"""
    try:
        # Crear tabla primero
        engine = crear_tabla()
        if not engine:
            return False
            
        # Leer archivo Excel
        logger.info(f"Leyendo archivo: {archivo_excel}")
        df = pd.read_excel(archivo_excel)
        logger.info(f"Leídas {len(df)} filas")
        
        # Mostrar estructura de datos
        print("\nColumnas encontradas:")
        print(df.columns.tolist())
        print("\nPrimeras 5 filas:")
        print(df.head())
        
        # Limpiar datos
        df = df.dropna()  # Eliminar filas vacías
        
        # Insertar datos usando pandas
        df.to_sql('mi_tabla', engine, if_exists='append', index=False)
        logger.info("Datos insertados correctamente")
        
        return True
        
    except Exception as e:
        logger.error(f"Error insertando datos: {e}")
        return False

def consultar_datos():
    """Consultar datos de la tabla"""
    try:
        connection_string = build_connection_string()
        engine = create_engine(connection_string)
        
        # Consultar usando pandas
        df = pd.read_sql('SELECT * FROM mi_tabla', engine)
        print(f"\nDatos en la tabla: {len(df)} registros")
        print(df.head())
        
        return df
        
    except Exception as e:
        logger.error(f"Error consultando datos: {e}")
        return None

if __name__ == "__main__":
    
    print("=== Script de importación Excel a PostgreSQL ===")
    
  
    print("\n1. Creando tabla...")
    engine = crear_tabla()
    
    print("\n¡Script completado!")
