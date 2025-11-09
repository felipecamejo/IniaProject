import os
import argparse
import logging
from typing import Dict, List, Any, Optional
from collections import defaultdict

# Intentar importar módulo de instalación de dependencias
try:
    from InstallDependencies import verificar_e_instalar, instalar_dependencias_faltantes
    INSTALL_DEPS_AVAILABLE = True
except ImportError:
    INSTALL_DEPS_AVAILABLE = False

# Verificar e instalar dependencias openpyxl
if INSTALL_DEPS_AVAILABLE:
    if not verificar_e_instalar('openpyxl', 'openpyxl', silent=True):
        print("Intentando instalar openpyxl...")
        verificar_e_instalar('openpyxl', 'openpyxl', silent=False)

# Dependencias para Excel
try:
    from openpyxl import load_workbook
    OPENPYXL_AVAILABLE = True
except Exception:
    OPENPYXL_AVAILABLE = False
    if INSTALL_DEPS_AVAILABLE:
        if verificar_e_instalar('openpyxl', 'openpyxl', silent=False):
            try:
                from openpyxl import load_workbook
                OPENPYXL_AVAILABLE = True
            except Exception:
                OPENPYXL_AVAILABLE = False

# Verificar e instalar dependencias pandas
if INSTALL_DEPS_AVAILABLE:
    if not verificar_e_instalar('pandas', 'pandas', silent=True):
        print("Intentando instalar pandas...")
        verificar_e_instalar('pandas', 'pandas', silent=False)

# Importaciones Pandas
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ModuleNotFoundError:
    PANDAS_AVAILABLE = False
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('AnalizedExcel', silent=False):
            import pandas as pd
            PANDAS_AVAILABLE = True
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install -r requirements.txt")
    else:
        print("Falta el paquete 'pandas'. Instálalo con: pip install pandas")

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================================
# MÓDULO: ANÁLISIS DE EXCEL
# ================================
def analizar_estructura_excel(ruta_archivo: str) -> Dict[str, Any]:
    """
    Analiza la estructura de un archivo Excel y retorna información sobre sus hojas y columnas.
    
    Args:
        ruta_archivo: Ruta al archivo Excel a analizar
        
    Returns:
        Diccionario con información de la estructura del Excel
    """
    if not OPENPYXL_AVAILABLE:
        raise RuntimeError("openpyxl no está instalado")
    
    if not os.path.exists(ruta_archivo):
        raise FileNotFoundError(f"El archivo no existe: {ruta_archivo}")
    
    estructura = {
        'archivo': os.path.basename(ruta_archivo),
        'ruta_completa': os.path.abspath(ruta_archivo),
        'hojas': []
    }
    
    try:
        wb = load_workbook(ruta_archivo, data_only=True)
        hojas = wb.sheetnames
        
        for nombre_hoja in hojas:
            ws = wb[nombre_hoja]
            info_hoja = {
                'nombre': nombre_hoja,
                'columnas': [],
                'total_filas': ws.max_row,
                'total_columnas': ws.max_column
            }
            
            # Obtener encabezados (primera fila)
            encabezados = []
            if ws.max_row > 0:
                for col in range(1, ws.max_column + 1):
                    celda = ws.cell(row=1, column=col)
                    valor = celda.value
                    if valor is not None:
                        encabezados.append(str(valor).strip())
                    else:
                        encabezados.append(f"Columna_{col}")
            
            # Analizar cada columna
            for idx, encabezado in enumerate(encabezados, start=1):
                columna_info = {
                    'nombre': encabezado,
                    'indice': idx,
                    'tipo_datos': [],
                    'valores_unicos': set(),
                    'valores_nulos': 0,
                    'total_valores': 0
                }
                
                # Analizar valores de la columna (desde la fila 2 en adelante)
                for row in range(2, ws.max_row + 1):
                    celda = ws.cell(row=row, column=idx)
                    valor = celda.value
                    columna_info['total_valores'] += 1
                    
                    if valor is None:
                        columna_info['valores_nulos'] += 1
                    else:
                        tipo_valor = type(valor).__name__
                        if tipo_valor not in columna_info['tipo_datos']:
                            columna_info['tipo_datos'].append(tipo_valor)
                        
                        # Agregar valor único (limitado a 100 para no sobrecargar)
                        if len(columna_info['valores_unicos']) < 100:
                            columna_info['valores_unicos'].add(str(valor))
                
                # Convertir set a lista para serialización
                columna_info['valores_unicos'] = sorted(list(columna_info['valores_unicos']))[:50]
                columna_info['tipo_datos'] = columna_info['tipo_datos']
                
                info_hoja['columnas'].append(columna_info)
            
            estructura['hojas'].append(info_hoja)
        
        wb.close()
        
    except Exception as e:
        logger.error(f"Error analizando Excel: {e}")
        raise
    
    return estructura

def identificar_entidades_columnas(columnas: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """
    Identifica a qué entidades pertenecen las columnas basándose en patrones de nombres.
    
    Args:
        columnas: Lista de información de columnas
        
    Returns:
        Diccionario mapeando nombres de entidades a listas de columnas
    """
    # Patrones de identificación de entidades basados en el proyecto
    patrones_entidades = {
        'recibo': ['recibo', 'numero_muestra', 'numero_lote', 'fecha_ingreso', 'peso_kg', 'numero_envases'],
        'lote': ['lote', 'numero_lote', 'categoria', 'especie', 'cultivar'],
        'usuario': ['usuario', 'nombre', 'email', 'rol'],
        'dosn': ['dosn', 'gramos_analizados', 'tipos_analisis', 'determinacion', 'fecha_inia', 'fecha_inase'],
        'pureza': ['pureza', 'semilla_pura', 'material_inerte', 'otros_cultivos', 'malezas', 'fecha_inase', 'fecha_inia'],
        'pureza_pnotatum': ['pnotatum', 'pureza_pnotatum', 'repeticion'],
        'germinacion': ['germinacion', 'semillas_germinadas', 'semillas_no_germinadas', 'porcentaje_germinacion', 'fecha_germinacion'],
        'tetrazolio': ['tetrazolio', 'viables', 'no_viables', 'duras', 'concentracion', 'tincion'],
        'sanitario': ['sanitario', 'hongo', 'patogeno', 'enfermedad'],
        'pms': ['pms', 'gramos_pms', 'peso_muestra'],
        'deposito': ['deposito', 'nombre_deposito', 'ubicacion'],
        'certificado': ['certificado', 'numero_certificado', 'fecha_emision', 'firmante'],
        'maleza': ['maleza', 'nombre_maleza', 'tipo_maleza'],
        'cultivo': ['cultivo', 'nombre_cultivo'],
        'metodo': ['metodo', 'nombre_metodo', 'descripcion_metodo']
    }
    
    mapeo_entidades = defaultdict(list)
    
    for columna in columnas:
        nombre_col = columna['nombre'].lower()
        entidad_asignada = None
        mejor_coincidencia = 0
        
        # Buscar la mejor coincidencia
        for entidad, patrones in patrones_entidades.items():
            coincidencias = sum(1 for patron in patrones if patron in nombre_col)
            if coincidencias > mejor_coincidencia:
                mejor_coincidencia = coincidencias
                entidad_asignada = entidad
        
        # Si no hay coincidencia clara, intentar identificar por prefijos comunes
        if entidad_asignada is None:
            if nombre_col.startswith('recibo_'):
                entidad_asignada = 'recibo'
            elif nombre_col.startswith('lote_'):
                entidad_asignada = 'lote'
            elif nombre_col.startswith('dosn_'):
                entidad_asignada = 'dosn'
            elif nombre_col.startswith('pureza_') or nombre_col.startswith('pnotatum_'):
                entidad_asignada = 'pureza_pnotatum' if 'pnotatum' in nombre_col else 'pureza'
            elif nombre_col.startswith('germinacion_'):
                entidad_asignada = 'germinacion'
            elif nombre_col.startswith('tetrazolio_'):
                entidad_asignada = 'tetrazolio'
            elif nombre_col.startswith('sanitario_'):
                entidad_asignada = 'sanitario'
            elif nombre_col.startswith('pms_'):
                entidad_asignada = 'pms'
            elif nombre_col.startswith('certificado_'):
                entidad_asignada = 'certificado'
            elif 'maleza' in nombre_col:
                entidad_asignada = 'maleza'
            elif 'cultivo' in nombre_col:
                entidad_asignada = 'cultivo'
            elif 'metodo' in nombre_col:
                entidad_asignada = 'metodo'
            elif 'usuario' in nombre_col or 'user' in nombre_col:
                entidad_asignada = 'usuario'
            elif 'deposito' in nombre_col:
                entidad_asignada = 'deposito'
            else:
                entidad_asignada = 'general'
        
        mapeo_entidades[entidad_asignada].append(columna['nombre'])
    
    return dict(mapeo_entidades)

def generar_mapeo_datos(estructura: Dict[str, Any]) -> Dict[str, Any]:
    """
    Genera un mapeo completo de datos del Excel, indicando qué datos tiene y a quiénes pertenecen.
    
    Args:
        estructura: Estructura del Excel analizada
        
    Returns:
        Mapeo completo de datos
    """
    mapeo_completo = {
        'archivo': estructura['archivo'],
        'ruta': estructura['ruta_completa'],
        'resumen': {
            'total_hojas': len(estructura['hojas']),
            'total_columnas': sum(len(hoja['columnas']) for hoja in estructura['hojas']),
            'total_filas': sum(hoja['total_filas'] for hoja in estructura['hojas'])
        },
        'hojas': []
    }
    
    for hoja_info in estructura['hojas']:
        hoja_mapeo = {
            'nombre': hoja_info['nombre'],
            'resumen': {
                'total_columnas': hoja_info['total_columnas'],
                'total_filas': hoja_info['total_filas']
            },
            'entidades': {}
        }
        
        # Identificar entidades de las columnas
        entidades_columnas = identificar_entidades_columnas(hoja_info['columnas'])
        
        # Organizar datos por entidad
        for entidad, columnas_nombres in entidades_columnas.items():
            columnas_info = [col for col in hoja_info['columnas'] if col['nombre'] in columnas_nombres]
            
            entidad_info = {
                'nombre': entidad,
                'columnas': [],
                'total_columnas': len(columnas_info),
                'tipos_datos': set(),
                'valores_unicos_por_columna': {}
            }
            
            for col_info in columnas_info:
                col_mapeo = {
                    'nombre': col_info['nombre'],
                    'tipo_datos': col_info['tipo_datos'],
                    'valores_nulos': col_info['valores_nulos'],
                    'total_valores': col_info['total_valores'],
                    'porcentaje_nulos': round((col_info['valores_nulos'] / col_info['total_valores'] * 100) if col_info['total_valores'] > 0 else 0, 2),
                    'valores_unicos_muestra': col_info['valores_unicos'][:10]  # Solo primeros 10 para el mapeo
                }
                
                entidad_info['columnas'].append(col_mapeo)
                entidad_info['tipos_datos'].update(col_info['tipo_datos'])
                entidad_info['valores_unicos_por_columna'][col_info['nombre']] = len(col_info['valores_unicos'])
            
            entidad_info['tipos_datos'] = list(entidad_info['tipos_datos'])
            hoja_mapeo['entidades'][entidad] = entidad_info
        
        mapeo_completo['hojas'].append(hoja_mapeo)
    
    return mapeo_completo

def imprimir_mapeo(mapeo: Dict[str, Any], formato: str = 'texto') -> None:
    """
    Imprime el mapeo de datos en el formato especificado.
    
    Args:
        mapeo: Mapeo de datos a imprimir
        formato: Formato de salida ('texto' o 'json')
    """
    if formato == 'json':
        import json
        print(json.dumps(mapeo, indent=2, ensure_ascii=False))
    else:
        # Formato texto legible
        print("=" * 80)
        print(f"ANÁLISIS DE EXCEL: {mapeo['archivo']}")
        print("=" * 80)
        print(f"Ruta: {mapeo['ruta']}")
        print(f"\nResumen General:")
        print(f"  - Total de hojas: {mapeo['resumen']['total_hojas']}")
        print(f"  - Total de columnas: {mapeo['resumen']['total_columnas']}")
        print(f"  - Total de filas: {mapeo['resumen']['total_filas']}")
        print("\n" + "=" * 80)
        
        for hoja in mapeo['hojas']:
            print(f"\nHOJA: {hoja['nombre']}")
            print("-" * 80)
            print(f"  Columnas: {hoja['resumen']['total_columnas']}, Filas: {hoja['resumen']['total_filas']}")
            print("\n  Entidades identificadas:")
            
            for entidad_nombre, entidad_info in hoja['entidades'].items():
                print(f"\n    [{entidad_nombre.upper()}]")
                print(f"      Columnas: {entidad_info['total_columnas']}")
                print(f"      Tipos de datos: {', '.join(entidad_info['tipos_datos'])}")
                print(f"      Columnas detalladas:")
                
                for col in entidad_info['columnas']:
                    print(f"        - {col['nombre']}")
                    print(f"          Tipo: {', '.join(col['tipo_datos'])}")
                    print(f"          Valores nulos: {col['valores_nulos']} ({col['porcentaje_nulos']}%)")
                    if col['valores_unicos_muestra']:
                        muestra = ', '.join(col['valores_unicos_muestra'][:5])
                        print(f"          Muestra valores: {muestra}...")
        
        print("\n" + "=" * 80)

# ================================
# MÓDULO: FUNCIÓN PRINCIPAL
# ================================
def analizar_excel(ruta_archivo: str, formato_salida: str = 'texto') -> Dict[str, Any]:
    """
    Función principal que analiza un archivo Excel y genera el mapeo de datos.
    
    Args:
        ruta_archivo: Ruta al archivo Excel a analizar
        formato_salida: Formato de salida ('texto' o 'json')
        
    Returns:
        Mapeo completo de datos
    """
    logger.info(f"Iniciando análisis de Excel: {ruta_archivo}")
    
    try:
        # Analizar estructura
        estructura = analizar_estructura_excel(ruta_archivo)
        logger.info(f"Estructura analizada: {len(estructura['hojas'])} hojas")
        
        # Generar mapeo
        mapeo = generar_mapeo_datos(estructura)
        logger.info(f"Mapeo generado: {len(mapeo['hojas'])} hojas mapeadas")
        
        # Imprimir resultado
        imprimir_mapeo(mapeo, formato_salida)
        
        return mapeo
        
    except Exception as e:
        logger.error(f"Error analizando Excel: {e}")
        raise

def main():
    """Función principal del script."""
    parser = argparse.ArgumentParser(description="Analiza un archivo Excel y genera un mapeo de datos")
    parser.add_argument(
        "archivo",
        help="Ruta al archivo Excel a analizar"
    )
    parser.add_argument(
        "--formato",
        choices=["texto", "json"],
        default="texto",
        help="Formato de salida (texto por defecto)"
    )
    args = parser.parse_args()
    
    try:
        analizar_excel(args.archivo, args.formato)
    except Exception as e:
        logger.error(f"Error en el proceso principal: {e}")
        raise

if __name__ == "__main__":
    main()

