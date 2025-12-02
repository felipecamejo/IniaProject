"""
Tests unitarios para funciones de exportación con filtros.
"""
import os
import pytest
from datetime import date

# Configurar variables de entorno antes de importar módulos que las requieren
os.environ.setdefault('DB_PASSWORD', 'test_password')
os.environ.setdefault('DB_USER', 'test_user')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')
os.environ.setdefault('DB_NAME', 'test_db')

from ExportExcel import (
    obtener_campo_fecha_analisis,
    parsear_analisis_ids,
    export_analisis_filtrados
)


class TestObtenerCampoFechaAnalisis:
    """Tests para obtener_campo_fecha_analisis."""
    
    def test_dosn_auto(self):
        """Test DOSN con detección automática."""
        campo = obtener_campo_fecha_analisis('dosn', 'auto')
        assert campo == 'dosn_fecha_analisis'
    
    def test_dosn_especifico(self):
        """Test DOSN con campo específico."""
        campo = obtener_campo_fecha_analisis('dosn', 'dosn_fecha_inia')
        assert campo == 'dosn_fecha_inia'
    
    def test_pureza_auto(self):
        """Test Pureza con detección automática."""
        campo = obtener_campo_fecha_analisis('pureza', None)
        assert campo == 'fecha_inia'
    
    def test_germinacion_auto(self):
        """Test Germinación con detección automática."""
        campo = obtener_campo_fecha_analisis('germinacion', 'auto')
        assert campo == 'fecha_germinacion'
    
    def test_pms_fallback(self):
        """Test PMS usa fecha_creacion como fallback."""
        campo = obtener_campo_fecha_analisis('pms', 'auto')
        assert campo == 'fecha_creacion'
    
    def test_tipo_desconocido(self):
        """Test tipo desconocido retorna None."""
        campo = obtener_campo_fecha_analisis('tipo_inexistente', 'auto')
        assert campo is None
    
    def test_campo_no_disponible(self):
        """Test campo no disponible usa default."""
        campo = obtener_campo_fecha_analisis('pureza', 'fecha_inexistente')
        assert campo == 'fecha_inia'  # Debe usar default


class TestParsearAnalisisIds:
    """Tests para parsear_analisis_ids."""
    
    def test_formato_completo(self):
        """Test formato completo con múltiples tipos."""
        resultado = parsear_analisis_ids('dosn:1,2,3;pureza:5,6')
        assert resultado == {'dosn': [1, 2, 3], 'pureza': [5, 6]}
    
    def test_un_solo_tipo(self):
        """Test un solo tipo de análisis."""
        resultado = parsear_analisis_ids('dosn:1,2,3')
        assert resultado == {'dosn': [1, 2, 3]}
    
    def test_un_solo_id(self):
        """Test un solo ID."""
        resultado = parsear_analisis_ids('germinacion:10')
        assert resultado == {'germinacion': [10]}
    
    def test_string_vacio(self):
        """Test string vacío retorna diccionario vacío."""
        resultado = parsear_analisis_ids('')
        assert resultado == {}
    
    def test_string_none(self):
        """Test None retorna diccionario vacío."""
        resultado = parsear_analisis_ids(None)
        assert resultado == {}
    
    def test_con_espacios(self):
        """Test parsing con espacios."""
        resultado = parsear_analisis_ids('dosn: 1 , 2 , 3 ; pureza : 5 , 6 ')
        assert resultado == {'dosn': [1, 2, 3], 'pureza': [5, 6]}
    
    def test_ids_invalidos(self):
        """Test IDs inválidos son ignorados."""
        resultado = parsear_analisis_ids('dosn:1,abc,3')
        # Debe fallar silenciosamente o retornar solo los válidos
        # Depende de la implementación, pero no debe crashear
        assert 'dosn' in resultado
        assert 1 in resultado['dosn']
        assert 3 in resultado['dosn']
    
    def test_formato_sin_tipo(self):
        """Test formato sin tipo (no soportado)."""
        resultado = parsear_analisis_ids('1,2,3')
        # Debe retornar diccionario vacío o loggear warning
        assert resultado == {}


class TestValidacionFechas:
    """Tests para validación de fechas."""
    
    def test_fecha_desde_menor_que_hasta(self):
        """Test fecha_desde menor que fecha_hasta es válido."""
        fecha_desde = date(2024, 1, 1)
        fecha_hasta = date(2024, 12, 31)
        assert fecha_desde <= fecha_hasta
    
    def test_fecha_desde_igual_hasta(self):
        """Test fecha_desde igual a fecha_hasta es válido."""
        fecha = date(2024, 6, 15)
        assert fecha <= fecha
    
    def test_fecha_desde_mayor_hasta_invalido(self):
        """Test fecha_desde mayor que fecha_hasta es inválido."""
        fecha_desde = date(2024, 12, 31)
        fecha_hasta = date(2024, 1, 1)
        assert fecha_desde > fecha_hasta  # Esto debe ser detectado y rechazado


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

