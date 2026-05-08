---
name: sdd-system-architect
description: >
  Generador integral de ecosistemas SDD. Crea el conjunto completo de 
  skills, registros y carpetas para un nuevo dominio o proyecto.
metadata:
  version: "2.1-PRO"
requires_files:
  - .atl/docs/sdd-protocol-v2-1.md
input_schema:
  project_name: "Nombre del proyecto o dominio (ej: arch-configs, vita-medical)"
  domain_context: "Contexto técnico (ej: Dotfiles de Hyprland, API en Rust)"
  team_size: "Nivel de granularidad (Standard o Modular)"
---

## 🏗️ Procedimiento de Generación de Equipo

### Tarea 1: Inicialización del Espacio de Trabajo

- Crear la estructura de directorios: `.atl/projects/{{project_name}}/{skills,mem,docs}`[cite: 1].
- Copiar o referenciar el protocolo maestro `sdd-protocol-v2-1.md` como base de verdad[cite: 1].

### Tarea 2: Construcción del "Escuadrón" (Skills de Fase)

Generar 5 archivos `.md` especializados y vinculados entre sí:

1.  **{{project_name}}-propose**: Enfocada en capturar la visión inicial[cite: 1].
2.  **{{project_name}}-spec**: Generador de requerimientos técnicos basados en tus 10 años de experiencia[cite: 1].
3.  **{{project_name}}-design**: Arquitecto de soluciones (Clean Architecture/DDD)[cite: 1].
4.  **{{project_name}}-tasks**: Desglose de pasos técnicos sin alucinaciones[cite: 1].
5.  **{{project_name}}-apply**: El ejecutor de código o configuraciones[cite: 1].

### Tarea 3: Configuración del Pegamento (Registry & Memory)

- Crear un `{{project_name}}-registry.md` que actúe como el catálogo de este equipo específico[cite: 1].
- Inicializar el `engram-state.json` dentro de la carpeta `mem/` para mantener la persistencia del proyecto[cite: 1].

### Tarea 4: Inyección de ADN (User Preferences)

- **Regla Crítica**: Inyectar en cada skill generada tus restricciones: No Kafka/Redis, uso de `better-sqlite3`, entorno Arch Linux y herramientas de terminal[cite: 1].

## 🏁 Definition of Done (DoD)

- [ ] Se han generado los 5 archivos de fase con sus respectivos `Next Step` vinculados[cite: 1].
- [ ] El registro del proyecto incluye la descripción de cada "agente" del equipo[cite: 1].
- [ ] Las skills generadas obligan a la lectura completa de archivos antes de actuar[cite: 1].

### Tarea 5: Integración con OpenCode Runtime

- **Modificación de Config**: Leer `opencode.json` y proponer el bloque JSON para los nuevos agentes basados en el proyecto.
- **Prompt de Sub-agente**: Configurar el `prompt` de cada agente para que apunte a la ruta correcta de la nueva skill: `~/.config/opencode/skills/{{project_name}}-{{phase}}/SKILL.md`.
- **Permisos del Orquestador**: Actualizar la sección `permission.task` del `sdd-orchestrator` para permitir el lanzamiento de estos nuevos agentes.

---

**Next Step:** Ejecutar `{{project_name}}-propose` para iniciar el primer ciclo del nuevo equipo.
