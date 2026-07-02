---
name: clean-architecture
description: >
  Orchestrador completo de Clean Architecture. Analiza el codebase, genera cada
  capa (Entities → Repositories → Use Cases → Data Sources → Services) con
  bucle de calidad: escribir, revisar Clean Code, auditar Big O, corregir y
  mejorar antes de avanzar a la siguiente capa.
license: MIT
metadata:
  author: gentleman-programming
  version: "2.0"
  orchestrator: true
  atomic-skills:
    - clean-architecture/entities
    - clean-architecture/repositories
    - clean-architecture/use-cases
    - clean-architecture/data-sources
    - clean-architecture/services
    - clean-code
    - code-auditor-elite
---

## Purpose

Actuar como un desarrollador real construyendo una arquitectura limpia capa por capa. Por cada capa, ejecuta el bucle: **Escribir → Revisar (Clean Code) → Auditar (Big O) → Corregir/Mejorar → Avanzar**. No sales de una capa hasta que pasa los estándares de calidad.

## Trigger

- "clean architecture", "clean-architecture", "arquitectura limpia"
- "aplica clean architecture a [feature/domain]"
- "genera la arquitectura completa para [entidad]"
- Cualquier solicitud de construir un sistema con Clean Architecture

## Workflow General

```
1. ANALIZAR codebase — entender lo que ya existe (entities, repos, stack)
2. ENTITIES   → escribir → clean-code → big-o → corregir → ✅
3. REPOS      → escribir → clean-code → big-o → corregir → ✅
4. USE CASES  → escribir → clean-code → big-o → corregir → ✅
5. DATA SRCS  → escribir → clean-code → big-o → corregir → ✅
6. SERVICES   → escribir → clean-code → big-o → corregir → ✅
7. VERIFICAR integración completa
```

## Orquestación Detallada

### Fase 0: Análisis del Codebase

Antes de escribir UNA línea, debes:

1. Leer la estructura actual de `src/` o el directorio principal
2. Detectar stack tecnológico (Express, NestJS, Prisma, TypeORM, etc.)
3. Revisar si ya existen entities, repos, use cases previos
4. Identificar convenciones de nomenclatura existentes
5. Confirmar con el usuario el dominio a modelar y las entidades involucradas

### Fase 1: Entities

**Skill base**: `clean-architecture/entities`

**Bucle por cada entidad**:

1. **Escribir** — Crea la entity en `src/domain/entities/` siguiendo el patrón de la skill (clase pura, factory methods, invariants, value objects si aplica)
2. **Clean Code Review** — Carga `clean-code` y verifica:
   - Nombres significativos (ubícua language del dominio)
   - Funciones pequeñas, una sola responsabilidad
   - DRY, KISS, YAGNI
   - Manejo de errores correcto
   - Sin comentarios innecesarios ni código muerto
3. **Big O Audit** — Carga `code-auditor-elite` y audita:
   - Complejidad ciclomática de métodos
   - Algoritmos ineficientes en validaciones
   - Acceso a colecciones (O(n²) innecesario)
   - Sugerencias de optimización
4. **Corregir/Mejorar** — Aplica las mejoras encontradas en pasos 2 y 3
5. **Repetir** — Si hay más entidades, vuelve al paso 1. Sino, ✅ avanzar

**Output**: Entities + Value Objects limpias, validadas, optimizadas.

### Fase 2: Repositories

**Skill base**: `clean-architecture/repositories`

**Bucle por cada repositorio**:

1. **Escribir** — Crea la interfaz en `src/domain/repositories/` — solo el contrato (métodos async, retorna entities, sin implementation details)
2. **Clean Code Review** — Carga `clean-code`:
   - Interfaces cohesivas (Interface Segregation Principle)
   - Nombres de métodos con intención clara (`findById`, no `get`)
   - Sin métodos genéricos o sobrecargados
3. **Big O Audit** — Carga `code-auditor-elite`:
   - Los métodos definidos implican consultas ineficientes?
   - Hay métodos que podrían combinarse para reducir N+1?
4. **Corregir/Mejorar** — Refina las interfaces
5. **Repetir** — Si hay más repos, vuelve al paso 1. Sino, ✅ avanzar

**Output**: Interfaces de repositorio limpias, con contratos precisos.

### Fase 3: Use Cases

**Skill base**: `clean-architecture/use-cases`

**Bucle por cada caso de uso**:

1. **Escribir** — Crea el use case en `src/application/use-cases/` — input/output DTOs, orquesta entities + repositorios, sin framework code
2. **Clean Code Review** — Carga `clean-code`:
   - Single Responsibility (un use case = una operación)
   - Nombres de caso de uso basados en intención de negocio
   - Manejo de errores (DomainError vs TechnicalError)
   - Inyección de dependencias limpia
3. **Big O Audit** — Carga `code-auditor-elite`:
   - Llamadas innecesarias al repositorio dentro de loops
   - Operaciones que deberían ser batch y no individuales
   - Complejidad algorítmica del flujo completo
4. **Corregir/Mejorar** — Refactoriza según hallazgos
5. **Repetir** — Si hay más use cases, vuelve al paso 1. Sino, ✅ avanzar

**Output**: Casos de uso atómicos, eficientes, con dominio puro.

### Fase 4: Data Sources

**Skill base**: `clean-architecture/data-sources`

**Bucle por cada data source**:

1. **Escribir** — Implementa la interfaz del repositorio en `src/infrastructure/repositories/` con el stack real (Prisma, Axios, etc.)
2. **Clean Code Review** — Carga `clean-code`:
   - Separación clara entre mapeo (toDomain/toPrimitives) y acceso a datos
   - Manejo de errores externos traducidos a DomainError
   - Nombres coherentes con la interfaz que implementan
3. **Big O Audit** — Carga `code-auditor-elite`:
   - Consultas N+1 (eager loading vs lazy loading)
   - Bulk operations vs iteración individual
   - Cache ausente donde podría haber
   - Conexiones abiertas innecesarias
4. **Corregir/Mejorar** — Optimiza consultas, agrega batch, cache si aplica
5. **Repetir** — Si hay más data sources, vuelve al paso 1. Sino, ✅ avanzar

**Output**: Implementaciones eficientes, con errores traducidos y consultas optimizadas.

### Fase 5: Services / DI / Controllers

**Skill base**: `clean-architecture/services`

1. **Escribir** — Crea:
   - Service classes (orquestan use cases compuestos si es necesario)
   - Composition Root / DI Container en `src/infrastructure/di/`
   - Controllers/Handlers que conectan los use cases al exterior (HTTP, CLI, etc.)
2. **Clean Code Review** — Carga `clean-code`:
   - Controllers delgados (solo manejan request/response, sin lógica de negocio)
   - DI container simple, sin magia innecesaria
   - Error handlers centralizados
3. **Big O Audit** — Carga `code-auditor-elite`:
   - Creación de objetos por request vs singleton
   - Memoria y performance del pipeline completo
4. **Corregir/Mejorar** — Ajusta wiring y manejo de errores

### Fase 6: Verificación Final

1. Confirmar que todas las capas están conectadas
2. Verificar que las reglas de dependencia se cumplen (domain no importa infra)
3. Verificar que los tests de entidades y use cases existen
4. Resumen final de lo generado con estructura de archivos

## Reglas de Arquitectura (Se hacen cumplir en cada capa)

1. **Dependency Rule**: Las dependencias apuntan hacia adentro. Domain no sabe nada de infraestructura.
2. **Pure Domain**: Entities y Use Cases NO importan nada de frameworks, bases de datos, ni librerías externas.
3. **Contracts in Domain**: Las interfaces de repositorio viven en domain; las implementaciones en infra.
4. **DTOs para cruzar fronteras**: No se pasan entities directamente a los controllers.
5. **Un Use Case = Una Operación**: Si un use case hace dos cosas, se divide.
6. **Cero dependencias cíclicas**: Verificar imports circulares.

## Notas

- Cada capa puede devolverse a la anterior si al avanzar se descubre que algo necesita cambiar (refinement loop natural).
- Si el usuario pide algo específico dentro de una capa (ej: "solo crea las entities"), ignora la orquestación y ejecuta solo esa capa atómica.
- Esta skill orquesta habilidades existentes — no reemplaza ni duplica las skills atómicas.
