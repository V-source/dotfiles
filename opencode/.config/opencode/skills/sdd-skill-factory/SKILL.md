---
name: sdd-skill-factory
description: >
  Especialista en arquitectura SDD encargada de diseñar, redactar y validar 
  nuevas "Skills" siguiendo estrictamente el estándar de la Versión 2.1.
  Genera archivos .md listos para ser integrados en el Skill Registry.
requires_files:
  - .atl/docs/sdd-protocol-v2-1.md # El documento maestro que revisamos
  - .atl/skill-registry.md
input_schema:
  skill_name: "Nombre de la nueva skill (ej: sdd-db-migration)"
  objective: "Qué debe lograr esta skill específicamente"
  phase: "A qué fase del SDD pertenece (Propose, Spec, Design, Tasks, Apply, Verify)"
---

## 🎯 Objetivo
Transformar un requerimiento operativo en una Skill atómica, determinista y funcional que respete el 100% de las reglas de validación del protocolo SDD[cite: 1].

## 📑 Paso 0: Validación de Contexto
1. Leer el `sdd-protocol-v2-1.md` para asegurar que el estándar esté fresco en la memoria de trabajo[cite: 1].
2. Verificar en el `skill-registry.md` que la skill no exista ya o para evitar solapamientos de responsabilidades[cite: 1].

## 🛠️ Ciclo de Construcción (Atomic Loop)

### Tarea 1: Estructura Frontmatter
- Generar el bloque YAML con `name`, `description`, `requires_files` e `input_schema`[cite: 1].
- **Regla Oro**: Los archivos requeridos deben ser rutas relativas y necesarias para la tarea[cite: 1].

### Tarea 2: Definición de Pre-condiciones y DoD
- Redactar el "Step 0" que bloquea la ejecución si los artefactos previos no existen[cite: 1].
- Crear la lista de "Definition of Done" (DoD) con checkboxes que validen el éxito técnico de la skill[cite: 1].

### Tarea 3: Diseño del Procedimiento (Procedural Logic)
- Dividir la lógica en tareas numeradas[cite: 1].
- Insertar los comandos de persistencia (`mem_search`, `mem_get_observation`, `engram_set`) donde sea necesario para asegurar la memoria del proyecto[cite: 1].

### Tarea 4: Return Envelope
- Definir la salida JSON que indicará al orquestador el estado final y la `next_skill` sugerida[cite: 1].

## 🏁 Definition of Done (DoD)
- [ ] La skill incluye el `input_schema` completo[cite: 1].
- [ ] No utiliza "Bridge Phrases" (ej: "Basado en...") en su lógica interna[cite: 1].
- [ ] El procedimiento obliga a la IA a leer archivos completos, no solo fragmentos[cite: 1].
- [ ] La skill se registra automáticamente en el `.atl/skill-registry.md` tras su creación[cite: 1].

---
**Next Step:** `sdd-verify` para asegurar que la nueva skill cumple con los tests sintácticos.
