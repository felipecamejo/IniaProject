import logging
from urllib.parse import quote_plus
import sys

# Importaciones con manejo explícito de dependencias faltantes

try:
    from sqlalchemy import create_engine, Column, Integer, String, Date, Float, Text
    from sqlalchemy.orm import declarative_base, sessionmaker
except ModuleNotFoundError:
    print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
    raise

# No se usan variables de entorno ni .env: se emplea configuración inline

# Configuración se define más abajo en DEFAULT_CONFIG

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ================================
# Configuración inline por defecto
# ================================
# Ajusta estos valores según tu entorno.
DEFAULT_CONFIG = {
    'DB_USER': 'postgres',
    'DB_PASSWORD': '897888fg2',
    'DB_HOST': 'localhost',
    'DB_PORT': '5432',
    'DB_NAME': 'Inia',
}

# Usar EXCLUSIVAMENTE la configuración por defecto definida arriba
DB_USER = DEFAULT_CONFIG['DB_USER']
DB_PASSWORD = DEFAULT_CONFIG['DB_PASSWORD']
DB_HOST = DEFAULT_CONFIG['DB_HOST']
DB_PORT = DEFAULT_CONFIG['DB_PORT']
DB_NAME = DEFAULT_CONFIG['DB_NAME']

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
    # Forzar driver psycopg2 explícitamente para mensajes de error más claros si falta
    return f'postgresql+psycopg2://{user_esc}:{pass_esc}@{host}:{port}/{db}'

# Crear la base declarativa (SQLAlchemy 2.0)
Base = declarative_base()

# Definir la estructura de la tabla basada en el Excel
class MiTalbla(Base):
    __tablename__ = 'mi_talbla'

    id = Column(Integer, primary_key=True, autoincrement=True)
    segment = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    product = Column(String(100), nullable=True)
    discount_band = Column(String(50), nullable=True)
    units_sold = Column(Integer, nullable=True)
    manufacturing_price = Column(Float, nullable=True)
    sale_price = Column(Float, nullable=True)
    gross_sales = Column(Float, nullable=True)
    discounts = Column(Float, nullable=True)
    sales = Column(Float, nullable=True)
    cogs = Column(Float, nullable=True)
    profit = Column(Float, nullable=True)
    date = Column(Date, nullable=True)
    month_number = Column(Integer, nullable=True)
    month_name = Column(String(20), nullable=True)
    year = Column(Integer, nullable=True)

def crear_tabla():
    """Crear la tabla en la base de datos"""
    try:
        # Validaciones mínimas de variables de entorno
        missing = []
        for k, v in {
            'DB_USER': DB_USER,
            'DB_PASSWORD/DB_PASS': DB_PASSWORD,
            'DB_HOST': DB_HOST,
            'DB_PORT': DB_PORT,
            'DB_NAME': DB_NAME,
        }.items():
            if not v:
                missing.append(k)
        if missing:
            logger.error(f"Faltan variables de entorno requeridas: {', '.join(missing)}")
            return None

        # Verificar que las variables estén cargadas
        print(f"Conectando a: {DB_HOST}:{DB_PORT}/{DB_NAME} como {DB_USER}")
        
        connection_string = build_connection_string()
        try:
            engine = create_engine(connection_string)
        except ModuleNotFoundError as e:
            # Típicamente falta psycopg2
            logger.error("Driver de PostgreSQL no encontrado. Instala: pip install psycopg2-binary")
            raise
        
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
        # Importar pandas solo si se va a usar esta función
        try:
            import pandas as pd  # type: ignore
        except ModuleNotFoundError:
            logger.error("Falta el paquete 'pandas'. Instálalo con: pip install pandas")
            return False

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
        
        # Normalizar encabezados: quitar espacios y mapear case-insensitive
        df.columns = [str(c).strip() for c in df.columns]
        rename_map = {
            'Segment': 'segment',
            'Country': 'country',
            'Product': 'product',
            'Discount Band': 'discount_band',
            'Units Sold': 'units_sold',
            'Manufacturing Price': 'manufacturing_price',
            'Sale Price': 'sale_price',
            'Gross Sales': 'gross_sales',
            'Discounts': 'discounts',
            'Sales': 'sales',
            'COGS': 'cogs',
            'Profit': 'profit',
            'Date': 'date',
            'Month Number': 'month_number',
            'Month Name': 'month_name',
            'Year': 'year',
        }
        norm_map = {k.strip().casefold(): v for k, v in rename_map.items()}
        df = df.rename(columns=lambda c: norm_map.get(str(c).strip().casefold(), c))

        # Asegurar columnas requeridas aun si el Excel trae formatos distintos
        for col in ['segment','country','product','discount_band','units_sold','manufacturing_price','sale_price','gross_sales','discounts','sales','cogs','profit','date','month_number','month_name','year']:
            if col not in df.columns:
                df[col] = None

        # Normalización de tipos básicos
        numeric_cols = ['units_sold','manufacturing_price','sale_price','gross_sales','discounts','sales','cogs','profit','month_number','year']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.date

        # Eliminar filas totalmente vacías
        df = df.dropna(how='all')

        # Insertar datos usando pandas en la tabla mi_talbla
        df.to_sql('mi_talbla', engine, if_exists='append', index=False)
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
    args = sys.argv[1:]
    
    if len(args) >= 2 and args[0] in ("--insert", "-i"):
        excel_path = args[1]
        ok = insertar_datos_desde_excel(excel_path)
        sys.exit(0 if ok else 1)

    print("\n1. Creando tabla...")
    engine = crear_tabla()
    if engine is None:
        print("\nFalló la creación de la tabla.")
        sys.exit(1)
    print("\n¡Script completado!")
    sys.exit(0)
