"""
Módulo centralizado para cálculo de orden topológico de tablas.
Proporciona funciones reutilizables para determinar el orden de inserción de tablas
basado en sus dependencias de foreign keys.

Usa database_config.py para la conexión a la base de datos.
"""
import os
import logging
from typing import Dict, List, Any, Optional, Tuple, Set
from sqlalchemy import create_engine, inspect, text

# Importar configuración centralizada de base de datos
from database_config import build_connection_string

logger = logging.getLogger(__name__)

# ================================
# MÓDULO: CONFIGURACIÓN
# ================================

# Tablas que deben ser ignoradas en el cálculo del orden topológico
TABLAS_IGNORAR = {'certificado'}

# Orden de prioridad para inserción de tablas
# 1 = Mayor prioridad, números mayores = menor prioridad
PRIORIDAD_TABLAS = {
    # Nivel 1: Usuario (primero)
    'usuario': 1,
    
    # Nivel 2: Lote (segundo)
    'lote': 2,
    
    # Nivel 3: Listados/Catálogos (malezas, especies, hongos, depósitos, métodos, etc.)
    'maleza': 3,
    'especie': 3,
    'hongo': 3,
    'deposito': 3,
    'metodo': 3,
    'autocompletado': 3,
    
    # Nivel 4: Recibos
    'recibo': 4,
    
    # Nivel 5: Análisis (orden específico: PMS primero, luego los demás)
    'pms': 5.0,  # Primero: PMS
    'humedad_recibo': 5.1,  # Segundo: Humedad recibo
    'pureza': 5.2,  # Tercero: Pureza
    'pureza_pnotatum': 5.3,  # Cuarto: Pureza Pnotatum
    'germinacion': 5.4,  # Quinto: Germinación
    'dosn': 5.5,  # Sexto: DOSN
    'sanitario': 5.6,  # Séptimo: Sanitario
    'tetrazolio': 5.7,  # Último: Tetrazolio
    
    # Nivel 6: Tablas relacionadas con análisis (detalles, repeticiones, etc.)
    'dosn_cultivo': 6,
    'dosn_maleza': 6,
    'pureza_maleza_normal': 6,
    'pureza_maleza_tolerada': 6,
    'pureza_maleza_tolerancia_cero': 6,
    'germinacion_curada_laboratorio': 6,
    'germinacion_curada_planta': 6,
    'germinacion_sin_curar': 6,
    'germinacion_normal_por_conteo': 6,
    'conteo_germinacion': 6,
    'sanitario_hongo': 6,
    'tetrazolio_detalle_semillas': 6,
    'viabilidad_reps_tetrazolio': 6,
    'repeticiones_pureza_pnotatum': 6,
    'gramos_pms': 6,
    
    # Nivel 7: Tablas de relación y logs
    'usuario_lote': 7,
    'logs': 7,
}

def obtener_prioridad_tabla(tabla: str) -> float:
    """
    Obtiene la prioridad de una tabla para el orden de inserción.
    
    Args:
        tabla: Nombre de la tabla
        
    Returns:
        Prioridad (número menor = mayor prioridad)
    """
    tabla_lower = tabla.lower()
    
    # Buscar prioridad exacta
    if tabla_lower in PRIORIDAD_TABLAS:
        return float(PRIORIDAD_TABLAS[tabla_lower])
    
    # Buscar por prefijo para variantes (ej: dosn_cultivo_inia -> dosn_cultivo)
    for tabla_prioridad, prioridad in PRIORIDAD_TABLAS.items():
        if tabla_lower.startswith(tabla_prioridad) or tabla_prioridad in tabla_lower:
            return float(prioridad)
    
    # Si no tiene prioridad definida, asignar prioridad alta (8) para que se inserte después
    # pero antes de las tablas sin prioridad
    return 8.0

# ================================
# MÓDULO: OBTENCIÓN DE DEPENDENCIAS
# ================================

def obtener_dependencias_tabla(engine, tabla_nombre: str) -> List[Tuple[str, str]]:
    """
    Obtiene las foreign keys de una tabla.
    
    Args:
        engine: Engine de SQLAlchemy
        tabla_nombre: Nombre de la tabla
        
    Returns:
        Lista de tuplas (tabla_referenciada, columna_fk)
    """
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys(tabla_nombre, schema='public')
    dependencias = []
    
    for fk in fks:
        tabla_ref = fk['referred_table']
        columna_fk = fk['constrained_columns'][0] if fk['constrained_columns'] else None
        if columna_fk:
            dependencias.append((tabla_ref, columna_fk))
    
    return dependencias


def obtener_dependencias_tabla_con_nullable(engine, tabla_nombre: str) -> List[Tuple[str, str, bool]]:
    """
    Obtiene las foreign keys de una tabla incluyendo información de si son nullable.
    
    Args:
        engine: Engine de SQLAlchemy
        tabla_nombre: Nombre de la tabla
        
    Returns:
        Lista de tuplas (tabla_referenciada, columna_fk, es_nullable)
    """
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys(tabla_nombre, schema='public')
    columnas_info = {col['name']: col.get('nullable', True) for col in inspector.get_columns(tabla_nombre, schema='public')}
    
    dependencias = []
    for fk in fks:
        tabla_ref = fk['referred_table']
        columna_fk = fk['constrained_columns'][0] if fk['constrained_columns'] else None
        if columna_fk:
            es_nullable = columnas_info.get(columna_fk, True)
            dependencias.append((tabla_ref, columna_fk, es_nullable))
    
    return dependencias


def mapear_todas_dependencias(engine, tablas_ignorar: Optional[Set[str]] = None) -> Dict[str, Dict[str, Any]]:
    """
    Mapea todas las dependencias de todas las tablas de la base de datos.
    
    Args:
        engine: Engine de SQLAlchemy
        tablas_ignorar: Conjunto de nombres de tablas a ignorar (opcional)
        
    Returns:
        Diccionario con información de dependencias de cada tabla:
        {
            'tabla': {
                'dependencias': [(tabla_ref, columna_fk), ...],
                'dependencias_validas': [(tabla_ref, columna_fk), ...],  # Solo tablas mapeadas
                'dependencias_nullable': [(tabla_ref, columna_fk), ...],  # Solo nullable
                'tablas_dependientes': [tabla1, tabla2, ...],
                'pk_columns': [...],
                'es_relacional': bool
            }
        }
    """
    if tablas_ignorar is None:
        tablas_ignorar = TABLAS_IGNORAR
    
    inspector = inspect(engine)
    tablas = inspector.get_table_names(schema='public')
    
    mapeo_completo = {}
    
    # Primera pasada: mapear todas las tablas y sus dependencias
    for tabla in tablas:
        # Ignorar tablas específicas
        if tabla.lower() in tablas_ignorar:
            logger.debug(f"Tabla '{tabla}' ignorada en el proceso de orden topológico")
            continue
        
        dependencias = obtener_dependencias_tabla(engine, tabla)
        dependencias_con_nullable = obtener_dependencias_tabla_con_nullable(engine, tabla)
        
        pk_constraint = inspector.get_pk_constraint(tabla, schema='public')
        pk_columns = pk_constraint.get('constrained_columns', [])
        
        # Separar dependencias válidas (solo tablas que están en el mapeo)
        dependencias_validas = []
        dependencias_nullable = []
        
        for tabla_ref, columna_fk in dependencias:
            # Verificar si la tabla referenciada está en el mapeo o será mapeada
            tabla_ref_lower = tabla_ref.lower()
            if tabla_ref_lower not in tablas_ignorar:
                dependencias_validas.append((tabla_ref, columna_fk))
        
        # Obtener información de nullable para dependencias válidas
        for tabla_ref, columna_fk, es_nullable in dependencias_con_nullable:
            tabla_ref_lower = tabla_ref.lower()
            if tabla_ref_lower not in tablas_ignorar and es_nullable:
                dependencias_nullable.append((tabla_ref, columna_fk))
        
        mapeo_completo[tabla] = {
            'dependencias': dependencias,  # Todas las dependencias (incluyendo ignoradas)
            'dependencias_validas': dependencias_validas,  # Solo tablas mapeadas
            'dependencias_nullable': dependencias_nullable,  # Solo nullable
            'pk_columns': pk_columns,
            'es_relacional': len(pk_columns) > 1,
            'tablas_dependientes': []  # Se llenará después
        }
    
    # Segunda pasada: identificar tablas que dependen de cada tabla
    for tabla, info in mapeo_completo.items():
        for tabla_dep, _ in info['dependencias_validas']:
            if tabla_dep in mapeo_completo:
                mapeo_completo[tabla_dep]['tablas_dependientes'].append(tabla)
    
    logger.info(f"Mapeo de dependencias completado: {len(mapeo_completo)} tablas mapeadas")
    return mapeo_completo


# ================================
# MÓDULO: ORDEN TOPOLÓGICO
# ================================

def orden_topologico(mapeo_completo: Dict[str, Dict[str, Any]], 
                    considerar_nullable: bool = True,
                    detectar_ciclos: bool = True) -> List[List[str]]:
    """
    Calcula el orden topológico de inserción de tablas usando algoritmo de Kahn.
    
    Corrige el bug original donde se contaban dependencias a tablas no mapeadas.
    Solo cuenta dependencias válidas (a tablas que están en el mapeo).
    
    Args:
        mapeo_completo: Diccionario con información de dependencias de cada tabla
        considerar_nullable: Si True, las FK nullable no bloquean el orden (opcional)
        detectar_ciclos: Si True, detecta y reporta ciclos específicos
        
    Returns:
        Lista de niveles, donde cada nivel es una lista de tablas que pueden insertarse en paralelo
        
    Raises:
        RuntimeError: Si se detectan ciclos o dependencias faltantes
    """
    niveles = []
    tablas_restantes = set(mapeo_completo.keys())
    grados_entrada = {}
    
    # Calcular grados de entrada SOLO para dependencias válidas (tablas mapeadas)
    for tabla, info in mapeo_completo.items():
        dependencias_a_contar = info['dependencias_validas']
        
        # Si considerar_nullable, excluir dependencias nullable del conteo
        if considerar_nullable:
            dependencias_nullable_set = {
                (tabla_ref, col) for tabla_ref, col in info['dependencias_nullable']
            }
            dependencias_a_contar = [
                (tabla_ref, col) for tabla_ref, col in dependencias_a_contar
                if (tabla_ref, col) not in dependencias_nullable_set
            ]
        
        # Excluir auto-referencias del conteo inicial (se manejan después)
        dependencias_sin_auto = [
            (tabla_ref, col) for tabla_ref, col in dependencias_a_contar
            if tabla_ref.lower() != tabla.lower()
        ]
        
        grados_entrada[tabla] = len(dependencias_sin_auto)
    
    # Algoritmo de Kahn
    iteracion = 0
    max_iteraciones = len(mapeo_completo) * 2  # Prevenir loops infinitos
    
    while tablas_restantes and iteracion < max_iteraciones:
        iteracion += 1
        nivel_actual = []
        
        # Encontrar tablas sin dependencias pendientes
        for tabla in list(tablas_restantes):
            if grados_entrada[tabla] == 0:
                nivel_actual.append(tabla)
        
        if not nivel_actual:
            # No hay tablas sin dependencias pendientes
            # Esto indica un ciclo o dependencias faltantes
            tablas_problema = [t for t in tablas_restantes if grados_entrada[t] > 0]
            
            if detectar_ciclos:
                # Intentar detectar ciclos específicos
                ciclos = detectar_ciclos_dependencias(mapeo_completo, tablas_problema)
                if ciclos:
                    mensaje = f"Error: Ciclos detectados en las dependencias:\n"
                    for ciclo in ciclos:
                        mensaje += f"  {' -> '.join(ciclo)} -> {ciclo[0]}\n"
                    mensaje += f"\nTablas con problemas: {tablas_problema}"
                    raise RuntimeError(mensaje)
            
            raise RuntimeError(
                f"Error: Ciclo detectado o dependencias faltantes. "
                f"Tablas con problemas: {tablas_problema}. "
                f"Verifica que todas las tablas referenciadas estén en el mapeo."
            )
        
        # Ordenar nivel actual por prioridad (menor número = mayor prioridad)
        nivel_actual_ordenado = sorted(nivel_actual, key=lambda t: obtener_prioridad_tabla(t))
        
        # Procesar nivel actual en orden de prioridad
        for tabla in nivel_actual_ordenado:
            tablas_restantes.remove(tabla)
            
            # Reducir grados de entrada de tablas dependientes
            for tabla_dep in mapeo_completo[tabla]['tablas_dependientes']:
                if tabla_dep in grados_entrada:
                    grados_entrada[tabla_dep] -= 1
                    # Asegurar que no sea negativo
                    if grados_entrada[tabla_dep] < 0:
                        grados_entrada[tabla_dep] = 0
        
        # Agregar nivel ordenado por prioridad
        niveles.append(nivel_actual_ordenado)
    
    if iteracion >= max_iteraciones:
        raise RuntimeError(
            f"Error: Se excedió el número máximo de iteraciones. "
            f"Posible ciclo infinito en las dependencias."
        )
    
    return niveles


def detectar_ciclos_dependencias(mapeo_completo: Dict[str, Dict[str, Any]], 
                                  tablas_problema: List[str]) -> List[List[str]]:
    """
    Detecta ciclos específicos en las dependencias usando DFS.
    
    Args:
        mapeo_completo: Diccionario con información de dependencias
        tablas_problema: Lista de tablas que tienen problemas
        
    Returns:
        Lista de ciclos encontrados, cada ciclo es una lista de nombres de tablas
    """
    ciclos = []
    visitados = set()
    en_recursion = set()
    
    def dfs(tabla: str, camino: List[str]) -> None:
        if tabla in en_recursion:
            # Ciclo detectado
            inicio_ciclo = camino.index(tabla)
            ciclo = camino[inicio_ciclo:] + [tabla]
            if ciclo not in ciclos:
                ciclos.append(ciclo)
            return
        
        if tabla in visitados:
            return
        
        visitados.add(tabla)
        en_recursion.add(tabla)
        
        # Seguir las dependencias válidas
        if tabla in mapeo_completo:
            for tabla_dep, _ in mapeo_completo[tabla]['dependencias_validas']:
                if tabla_dep in mapeo_completo:
                    dfs(tabla_dep, camino + [tabla])
        
        en_recursion.remove(tabla)
    
    # Buscar ciclos desde las tablas problemáticas
    for tabla in tablas_problema:
        if tabla not in visitados:
            dfs(tabla, [])
    
    return ciclos


# ================================
# MÓDULO: FUNCIONES DE CONVENIENCIA
# ================================

def obtener_orden_topologico(engine=None, 
                             tablas_ignorar: Optional[Set[str]] = None,
                             considerar_nullable: bool = True) -> List[List[str]]:
    """
    Función de conveniencia que obtiene el orden topológico completo.
    
    Args:
        engine: Engine de SQLAlchemy (opcional, se crea si no se proporciona)
        tablas_ignorar: Conjunto de nombres de tablas a ignorar (opcional)
        considerar_nullable: Si True, las FK nullable no bloquean el orden
        
    Returns:
        Lista de niveles de inserción
    """
    if engine is None:
        engine = create_engine(build_connection_string())
    
    mapeo = mapear_todas_dependencias(engine, tablas_ignorar)
    niveles = orden_topologico(mapeo, considerar_nullable=considerar_nullable)
    
    return niveles


def obtener_orden_topologico_flat(engine=None, 
                                   tablas_ignorar: Optional[Set[str]] = None,
                                   considerar_nullable: bool = True) -> List[str]:
    """
    Obtiene el orden topológico como una lista plana de tablas.
    
    Args:
        engine: Engine de SQLAlchemy (opcional)
        tablas_ignorar: Conjunto de nombres de tablas a ignorar (opcional)
        considerar_nullable: Si True, las FK nullable no bloquean el orden
        
    Returns:
        Lista plana de nombres de tablas en orden de inserción
    """
    niveles = obtener_orden_topologico(engine, tablas_ignorar, considerar_nullable)
    return [tabla for nivel in niveles for tabla in nivel]


def obtener_informacion_dependencias(engine=None, 
                                     tablas_ignorar: Optional[Set[str]] = None) -> Dict[str, Dict[str, Any]]:
    """
    Obtiene información completa de dependencias de todas las tablas.
    
    Args:
        engine: Engine de SQLAlchemy (opcional)
        tablas_ignorar: Conjunto de nombres de tablas a ignorar (opcional)
        
    Returns:
        Diccionario con información de dependencias
    """
    if engine is None:
        engine = create_engine(build_connection_string())
    
    return mapear_todas_dependencias(engine, tablas_ignorar)


# ================================
# MÓDULO: FUNCIÓN PRINCIPAL (CLI)
# ================================

def main():
    """Función principal para uso desde línea de comandos."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Calcula el orden topológico de inserción de tablas"
    )
    parser.add_argument(
        "--formato",
        choices=["niveles", "flat", "detallado"],
        default="niveles",
        help="Formato de salida (por defecto: niveles)"
    )
    parser.add_argument(
        "--ignorar",
        nargs="+",
        default=[],
        help="Tablas a ignorar (adicionales a las por defecto)"
    )
    parser.add_argument(
        "--no-nullable",
        action="store_true",
        help="No considerar FK nullable como opcionales"
    )
    
    args = parser.parse_args()
    
    # Configurar tablas a ignorar
    tablas_ignorar = set(TABLAS_IGNORAR)
    tablas_ignorar.update(t.lower() for t in args.ignorar)
    
    try:
        engine = create_engine(build_connection_string())
        mapeo = mapear_todas_dependencias(engine, tablas_ignorar)
        niveles = orden_topologico(
            mapeo, 
            considerar_nullable=not args.no_nullable
        )
        
        if args.formato == "niveles":
            print(f"Orden topológico ({len(niveles)} niveles):")
            for i, nivel in enumerate(niveles, 1):
                print(f"  Nivel {i}: {', '.join(nivel)}")
        
        elif args.formato == "flat":
            tablas_ordenadas = [tabla for nivel in niveles for tabla in nivel]
            print("Orden topológico (lista plana):")
            for i, tabla in enumerate(tablas_ordenadas, 1):
                print(f"  {i}. {tabla}")
        
        elif args.formato == "detallado":
            print("Información detallada de dependencias:")
            print("=" * 80)
            for tabla, info in mapeo.items():
                print(f"\n{tabla}:")
                print(f"  Dependencias válidas: {len(info['dependencias_validas'])}")
                if info['dependencias_validas']:
                    for tabla_ref, col in info['dependencias_validas']:
                        print(f"    -> {tabla_ref}.{col}")
                print(f"  Tablas que dependen de esta: {len(info['tablas_dependientes'])}")
                if info['tablas_dependientes']:
                    for tabla_dep in info['tablas_dependientes']:
                        print(f"    <- {tabla_dep}")
            
            print("\n" + "=" * 80)
            print(f"Orden topológico ({len(niveles)} niveles):")
            for i, nivel in enumerate(niveles, 1):
                print(f"  Nivel {i}: {', '.join(nivel)}")
    
    except Exception as e:
        logger.error(f"Error calculando orden topológico: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    main()

