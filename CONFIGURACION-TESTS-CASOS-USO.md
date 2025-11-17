# Configuración de Tests - Solo Casos de Uso

Este documento explica cómo está configurado el proyecto para ejecutar solo tests de casos de uso, omitiendo los tests CRUD básicos.

---

## Configuración Actual

Por defecto, el proyecto está configurado para ejecutar **solo tests de casos de uso de negocio importantes**, excluyendo tests CRUD y tests de seguridad/autorización.

### Tests Excluidos

Los siguientes tests **NO se ejecutan** por defecto:

#### Tests CRUD (Excluidos)
- `**/integration/*ControllerTest.java` - Tests CRUD básicos de controladores
  - `UsuarioControllerTest.java`
  - `HongoControllerTest.java`
  - `CultivoControllerTest.java`
  - `MalezaControllerTest.java`
  - `DepositoControllerTest.java`
  - `MetodoControllerTest.java`
  - `CertificadoControllerTest.java`
  - `AutoCompletadoControllerTest.java`
  - `LogControllerTest.java`

- `**/integration/*IntegrationTest.java` - Tests de integración con Testcontainers que son CRUD
  - `UsuarioIntegrationTest.java`

#### Tests de Seguridad/Autorización (Excluidos)
Los tests de seguridad verifican permisos y autorización, no son casos de uso de negocio:

- `**/security/**Test.java` - Tests de seguridad y autorización
  - `LoteSecurityTest.java`
  - `DOSNSecurityTest.java`
  - `ReciboSecurityTest.java`
  - `HongoSecurityTest.java`
  - `MalezaSecurityTest.java`
  - `CultivoSecurityTest.java`
  - `DepositoSecurityTest.java`
  - `GerminacionSecurityTest.java`
  - `PurezaPNotatumSecurityTest.java`
  - `MetodoSecurityTest.java`
  - `LogSecurityTest.java`
  - `CertificadoSecurityTest.java`
  - `AutocompletadoSecurityTest.java`
  - `GramosPMSSecurityTest.java`
  - `HumedadReciboSecurityTest.java`
  - `GerminacionTablasSecurityTest.java`
  - `PandMiddlewareSecurityTest.java`

- `**/security/**Service.java` - Tests de servicios de seguridad
  - `UsuarioSecurityService.java`
  - `PurezaSecurityService.java`
  - `TetrazolioSecurityService.java`
  - `PMSSecurityService.java`
  - `SanitarioSecurityService.java`

### Tests Incluidos (Casos de Uso de Negocio)

Solo se ejecutan tests de **casos de uso de negocio importantes**, como:
- Validaciones de reglas de negocio
- Cálculos específicos del dominio
- Validaciones de integridad de datos
- Lógica de negocio compleja

**Nota**: Si no existen tests de casos de uso de negocio, no se ejecutará ningún test por defecto.

---

## Ejecutar Tests

### Opción 1: Solo Casos de Uso de Negocio (Por Defecto)

```powershell
# Ejecutar solo tests de casos de uso de negocio importantes
# (Excluye CRUDs y tests de seguridad)
mvn test

# Con cobertura
mvn test jacoco:report
```

**Nota**: Si no hay tests de casos de uso de negocio, no se ejecutará ningún test.

### Opción 2: Todos los Tests (Incluyendo CRUDs y Seguridad)

Si necesitas ejecutar todos los tests:

```powershell
# Ejecutar todos los tests usando el perfil all-tests
mvn test -Pall-tests

# Con cobertura
mvn test -Pall-tests jacoco:report
```

### Opción 3: Solo Tests CRUD

Si quieres ejecutar solo los tests CRUD:

```powershell
# Ejecutar solo tests CRUD
mvn test -Dtest=*ControllerTest -Pall-tests

# O específicos
mvn test -Dtest=UsuarioControllerTest -Pall-tests
mvn test -Dtest=HongoControllerTest -Pall-tests
```

### Opción 4: Solo Tests de Seguridad

Si quieres ejecutar solo los tests de seguridad/autorización:

```powershell
# Ejecutar todos los tests de seguridad
mvn test -Dtest=*SecurityTest -Pall-tests

# O específicos
mvn test -Dtest=LoteSecurityTest -Pall-tests
mvn test -Dtest=*SecurityService -Pall-tests
```

---

## Perfiles Maven

El proyecto tiene dos perfiles configurados:

### 1. Perfil `use-cases-only` (Por Defecto)

- **Activo por defecto**
- Excluye tests CRUD
- Incluye solo tests de casos de uso (seguridad)

**Uso:**
```powershell
mvn test
# O explícitamente:
mvn test -Puse-cases-only
```

### 2. Perfil `all-tests`

- Ejecuta todos los tests (incluyendo CRUDs)
- Útil para CI/CD o validación completa

**Uso:**
```powershell
mvn test -Pall-tests
```

---

## Configuración en pom.xml

La configuración está en el plugin `maven-surefire-plugin`:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <excludes>
            <!-- Excluir tests CRUD -->
            <exclude>**/integration/*ControllerTest.java</exclude>
            <exclude>**/integration/*IntegrationTest.java</exclude>
            <!-- Excluir tests de seguridad/autorización -->
            <exclude>**/security/**Test.java</exclude>
            <exclude>**/security/**Service.java</exclude>
        </excludes>
        <!-- No incluir nada específico, solo ejecutar tests de casos de uso de negocio si existen -->
    </configuration>
</plugin>
```

---

## Razón de la Configuración

Esta configuración permite:

1. **Enfoque en Casos de Uso de Negocio**: Los tests se centran solo en la lógica de negocio importante y casos de uso reales, no en operaciones CRUD básicas ni en análisis de autorización.

2. **Tests Más Rápidos**: Al omitir tests CRUD y tests de seguridad, la ejecución es más rápida.

3. **Mantenibilidad**: Los tests de casos de uso de negocio son más valiosos para validar el comportamiento del sistema.

4. **Separación de Responsabilidades**: 
   - Tests CRUD: Verifican operaciones básicas (excluidos)
   - Tests de Seguridad: Verifican autorización/permisos (excluidos)
   - Tests de Casos de Uso: Verifican lógica de negocio importante (incluidos)

5. **Flexibilidad**: Puedes ejecutar todos los tests cuando sea necesario usando el perfil `all-tests`.

---

## Ejemplos Prácticos

### Ejecutar Tests de Casos de Uso con Cobertura

```powershell
# Solo casos de uso con cobertura
mvn clean test jacoco:report

# Ver reporte
start target\site\jacoco\index.html
```

### Ejecutar Todos los Tests en CI/CD

```powershell
# En GitHub Actions o CI/CD
mvn clean test -Pall-tests jacoco:report
```

### Ejecutar Tests Específicos

```powershell
# Solo tests de seguridad de Lote
mvn test -Dtest=LoteSecurityTest

# Todos los tests de seguridad
mvn test -Dtest=*SecurityTest

# Solo tests CRUD de Usuario
mvn test -Dtest=UsuarioControllerTest -Pall-tests
```

---

## Verificar Qué Tests se Ejecutan

Para ver qué tests se ejecutarán sin ejecutarlos:

```powershell
# Ver tests que se ejecutarán (solo casos de uso)
mvn test -Dtest=*SecurityTest -DfailIfNoTests=false

# Ver todos los tests disponibles
mvn test -Pall-tests -DfailIfNoTests=false
```

---

## Cambiar la Configuración

Si quieres cambiar el comportamiento por defecto:

1. **Para ejecutar todos los tests por defecto:**
   - Cambiar `<activeByDefault>true</activeByDefault>` del perfil `use-cases-only` a `false`
   - Cambiar `<activeByDefault>true</activeByDefault>` del perfil `all-tests` a `true`

2. **Para excluir más tests:**
   - Agregar más patrones en la sección `<excludes>` del `maven-surefire-plugin`

3. **Para incluir más tests:**
   - Agregar más patrones en la sección `<includes>` del `maven-surefire-plugin`

---

## Resumen

- **Por defecto**: Solo se ejecutan tests de casos de uso de negocio importantes
- **Tests CRUD**: Excluidos por defecto
- **Tests de Seguridad**: Excluidos por defecto (son análisis de autorización, no casos de uso)
- **Todos los tests**: Usar `mvn test -Pall-tests`
- **Tests específicos**: Usar `mvn test -Dtest=NombreTest -Pall-tests`

---

**Última actualización**: Enero 2024

