# Auditoría de Configuración Neovim

> **Fecha**: 2026-06-30  
> **Config base**: lazy.nvim + Lua  
> **Versión Neovim**: 0.12+

---

## 1. Autocompletado se apaga

### 🔥 Causa #1 (Crítica) — `trigger_characters = { "u" }` en fuente `unicode`

**Archivo**: `lua/plugins/completions.lua:223`

```lua
{ name = "unicode", trigger_characters = { "u" } }
```

Cada vez que se escribe la letra `u` en cualquier contexto, nvim-cmp activa la fuente custom `unicode`. La función `complete()` itera **toda** la tabla de `unicode_icons.lua` (20+ entradas) en cada pulsación. Cuando el buffer es extenso, esta iteración puede degradar rendimiento o romper nvim-cmp.

---

### 🔥 Causa #2 (Crítica) — Sin `pcall` en callbacks de fuentes custom

**Archivo**: `lua/plugins/completions.lua:112-173`

Las funciones `complete()` de `unicode` y `md_tags` **no tienen** envoltura `pcall`. Si ocurre cualquier error de Lua dentro de estos callbacks (acceso a campo `nil`, error de patrón regex, etc.), nvim-cmp entero se cae en silencio. No se muestra ningún mensaje de error; el completado simplemente deja de responder.

---

### 🔥 Causa #3 (Crítica) — `textEdit.range` con off-by-one en fuente `unicode`

**Archivo**: `lua/plugins/completions.lua:137-141`

```lua
start = { line = line, character = start_idx - 1 },
["end"] = { line = line, character = col - 1 },
```

- `start_idx`: retorno de `string.find()` (1-indexed sobre `cursor_before_line`)
- `col`: valor de `request.context.cursor` (0-indexed según la especificación LSP)

`col - 1` desplaza el final un caracter a la izquierda. Si el reemplazo del `textEdit` es incorrecto, nvim-cmp puede corromper su estado interno y dejar de responder.

---

### 🔥 Causa #4 — Conflicto `<C-\>` entre nvim-cmp y toggleterm

**Archivo**:
- `lua/plugins/completions.lua:201` → `["<C-\\>"] = cmp.mapping.complete()`
- `lua/plugins/toggle-term.lua:16` → `open_mapping = [[<c-\>]]`

toggleterm registra `<C-\>` en modo **insert** como toggle de terminal. nvim-cmp también lo reclama para `complete()`. Gana el que se cargue segundo. Cuando toggleterm se sobrepone, `<C-\>` en lugar de abrir completado abre una terminal flotante.

---

## 2. Resaltado de sintaxis se apaga

### 🔥 Causa #5 (Crítica) — Treesitter con `pcall` que traga errores

**Archivo**: `lua/plugins/tree-sitter.lua:31-33`

```lua
pcall(vim.treesitter.language.add, lang)
pcall(vim.treesitter.start, buf, lang)
```

Si treesitter falla (parser no compilado para la versión, incompatibilidad, archivo muy grande), el error es capturado por `pcall` y nadie se entera. El buffer se queda sin resaltado y no hay forma de saber por qué.

---

### 🔥 Causa #6 (Importante) — `syntax on` + treesitter compiten

**Archivo**: `lua/config.lua:36`

```lua
vim.cmd("syntax on")
```

Se activa el resaltado por sintaxis Vim (regex-based) al mismo tiempo que treesitter (AST-based). Ambos pelean por los `highlight groups`. Cuando treesitter se conecta a un buffer, debería desactivar Vim syntax, pero el timing entre ambos no está garantizado.

---

### 🔥 Causa #7 — Múltiples plugins modificando highlight groups sin orden

Los siguientes plugins escriben sobre `highlight groups` sin orden de carga definido:

| Plugin | Archivo | Qué modifica |
|--------|---------|-------------|
| `catppuccin` | `catppuccin.lua` | Tema global (todos los grupos) |
| `hlchunk.nvim` | `hlchunk.lua` | Chunk highlights (`Chunk*`) |
| `nvim-highlight-colors` | `colorHighlighter.lua` | Color swatches inline |
| `tiny-inline-diagnostic.nvim` | `tiny-inline.lua` | Diagnósticos inline |
| `noice.nvim` | `noice.lua` | UI messages |
| `render-markdown.nvim` | `markdown.lua` | Markdown rendering |

Catppuccin se fuerza como dependencia de nvim-cmp en `completions.lua:103`:

```lua
"catppuccin", -- FORZAMOS que catppuccin sea una dependencia
```

Esto es un hack. Si catppuccin se carga después de que otro plugin asignó highlights, o viceversa, los grupos se pierden.

---

## 3. `<C-n>` / `<C-p>` dejan de funcionar

### 🔥 Causa #8 (Consecuencia directa de causas 1-4)

`<C-n>` y `<C-p>` están incluidos en `cmp.mapping.preset.insert()` por defecto. Cuando nvim-cmp se cae por las causas #1-#4, sus mappings de navegación quedan apuntando a un estado interno corrupto. El menú puede aparecer (por triggers residuales) pero las teclas de navegación no responden.

**Diagnóstico**: Cuando deje de funcionar, ejecutar:

```vim
:lua print(vim.inspect(require("cmp").get_active_entry()))
```

Si retorna `nil` o lanza error, cmp está caído.

---

### 🔥 Causa #9 — nvim-cmp con `event = "InsertEnter"`

**Archivo**: `lua/plugins/completions.lua:97`

```lua
"hrsh7th/nvim-cmp",
event = "InsertEnter",
```

nvim-cmp carga **diferido** hasta la primera entrada a Insert. Si algo sale mal durante esa carga inicial (dependencias no resueltas, LuaSnip no listo), el plugin nunca se inicializa bien. Al recargar con `:Lazy reload nvim-cmp` se arregla temporalmente, pero el error de fondo sigue ahí.

---

## 4. Hallazgos adicionales

| # | Archivo | Línea(s) | Problema |
|---|---------|----------|----------|
| 🔸 | `inc-rename.lua` | 6-7 | `return` contiene un `vim.keymap.set()` suelto como elemento de tabla. Válido en Lua pero no idiomatico. |
| 🔸 | `errorLens.lua` | 12 | `enabled = false` pero el plugin se carga igual. 0 beneficio, solo overhead. |
| 🔸 | `conform.lua` + `lsp-config.lua` | — | `mason.nvim` aparece en dos specs de plugin separados. lazy.nvim lo deduplica pero las configs pueden pisarse. |
| 🔸 | `tree-sitter.lua` | 18, 21 | `"bash"` aparece **dos veces** en `ensure_installed`. |
| 🔸 | `lsp-config.lua` | 162 | `"markdown_oxide"` en `ensure_installed` pero este server no existe en el registry de Mason. La instalación falla. |
| 🔸 | `config.lua` | 63 | `vim.opt.foldtext = ""` → líneas plegadas no muestran texto. |
| 🔸 | `config.lua` | 124-128 | `c` y `C` mapeados al registro negro en normal/visual. Afecta operator-pending (`cw`, `ciw`, etc.) — los borrados no se pueden pegar. |

---

## Resumen de consecuencias

```
Causa #1 (u trigger)  ──┐
Causa #2 (sin pcall)  ──┤──→ nvim-cmp crash silencioso ──→ #8 (C-n/C-p mueren)
Causa #3 (off-by-one) ──┘
Causa #4 (C-\ conflict) ──→ complete() no funciona

Causa #5 (pcall tree) ──→ syntax highlighting se apaga sin aviso
Causa #6 (syntax on)  ──→ compite con treesitter
Causa #7 (hl groups)  ──→ highlights inestables

Causa #9 (InsertEnter) ──→ carga diferida frágil
```
