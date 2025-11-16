# Guía Rápida - Abrir JMeter GUI con Planes de Prueba

Esta guía explica cómo abrir JMeter GUI con los planes de prueba ya cargados automáticamente.

---

## Método Rápido (Recomendado)

### Scripts de Acceso Rápido

El proyecto incluye scripts que abren JMeter GUI con el plan de prueba ya cargado:

```powershell
# Plan de prueba funcional básico
.\PowerShell\OpenJMeterTestPlan.ps1

# Plan de prueba de rendimiento
.\PowerShell\OpenJMeterPerformance.ps1

# Plan de prueba de carga masiva
.\PowerShell\OpenJMeterBulkLoad.ps1
```

**Ventaja**: No necesitas abrir el plan manualmente, se carga automáticamente.

---

## Método Avanzado

### Script Principal OpenJMeter.ps1

```powershell
# Abrir un plan específico
.\PowerShell\OpenJMeter.ps1 -TestPlan INIA_API_Test_Plan
.\PowerShell\OpenJMeter.ps1 -TestPlan INIA_API_Performance_Test
.\PowerShell\OpenJMeter.ps1 -TestPlan INIA_API_Bulk_Load_Test

# Abrir todos los planes a la vez
.\PowerShell\OpenJMeter.ps1 -TestPlan All

# Listar planes disponibles
.\PowerShell\OpenJMeter.ps1 -List
```

---

## Usando RunJMeterTests.ps1

```powershell
# Abrir JMeter GUI con plan específico
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Test_Plan -Mode gui
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Performance_Test -Mode gui
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Bulk_Load_Test -Mode gui
```

---

## Planes de Prueba Disponibles

1. **INIA_API_Test_Plan.jmx**
   - Plan de prueba funcional básico
   - Autenticación y endpoints principales
   - Ideal para pruebas rápidas

2. **INIA_API_Performance_Test.jmx**
   - Plan de prueba de rendimiento
   - Múltiples usuarios concurrentes
   - Configurable con threads, ramp-up, loops

3. **INIA_API_Bulk_Load_Test.jmx**
   - Plan de prueba de carga masiva
   - Inserción e importación masiva de datos
   - Timeouts extendidos para operaciones largas

---

## Configuración Automática

Cuando ejecutas los scripts, automáticamente:

1. ✅ Verifica que JMeter esté instalado
2. ✅ Configura variables de entorno (PATH, JMETER_HOME)
3. ✅ Establece el directorio de trabajo correcto
4. ✅ Carga el plan de prueba automáticamente
5. ✅ Abre JMeter GUI listo para usar

---

## Solución de Problemas

### Error: "JMeter no encontrado"

```powershell
# Instalar JMeter
.\PowerShell\setup_Backend.ps1
```

### Error: "Plan de prueba no encontrado"

Verifica que el archivo existe:
```powershell
Test-Path "D:\IniaProject\jmeter\scripts\INIA_API_Test_Plan.jmx"
```

### El plan no se carga automáticamente

1. Verifica que el script se ejecutó correctamente
2. Revisa la consola por mensajes de error
3. Intenta abrir JMeter manualmente y cargar el plan desde File → Open

---

## Ejemplos de Uso

### Ejemplo 1: Prueba Rápida

```powershell
# Abrir plan funcional básico
.\PowerShell\OpenJMeterTestPlan.ps1

# En JMeter GUI:
# 1. El plan ya está cargado
# 2. Click en "Run" (▶️)
# 3. Ver resultados en "View Results Tree"
```

### Ejemplo 2: Prueba de Rendimiento

```powershell
# Abrir plan de rendimiento
.\PowerShell\OpenJMeterPerformance.ps1

# En JMeter GUI:
# 1. El plan ya está cargado
# 2. Ajustar variables si es necesario (Threads, Ramp-up, Loops)
# 3. Click en "Run" (▶️)
# 4. Ver resultados en "Summary Report" y "Aggregate Report"
```

### Ejemplo 3: Prueba de Carga Masiva

```powershell
# Abrir plan de carga masiva
.\PowerShell\OpenJMeterBulkLoad.ps1

# En JMeter GUI:
# 1. El plan ya está cargado
# 2. Verificar que el archivo CSV existe: jmeter/data/bulk_data.csv
# 3. Ajustar variables si es necesario
# 4. Click en "Run" (▶️)
# 5. Esperar (puede tardar varios minutos)
```

---

## Notas Importantes

- **Primera vez**: Si es la primera vez que abres JMeter, puede tardar unos segundos en cargar
- **Múltiples instancias**: Puedes abrir múltiples planes a la vez usando `-TestPlan All`
- **Variables**: Las variables del plan (BASE_URL, THREADS, etc.) se pueden modificar en JMeter GUI
- **Guardar cambios**: Si modificas el plan, guárdalo con Ctrl+S

---

## Referencias

- [JMeter README](./jmeter/README.md) - Documentación completa de JMeter
- [GUIA-EJECUCION-TESTS.md](./GUIA-EJECUCION-TESTS.md) - Guía general de ejecución de tests

---

**Última actualización**: Noviembre 2024

