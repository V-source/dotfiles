# Plan de Acción — Estabilizar Neovim

> Aplica sobre: `lua/plugins/completions.lua`, `lua/plugins/toggle-term.lua`,  
> `lua/plugins/tree-sitter.lua`, `lua/config.lua`  
> **Riesgo**: Bajo — Ningún cambio borra plugins ni altera keymaps principales.

---

## Lote 1 — Arreglar nvim-cmp (causas #1, #2, #3, #9)

### 1.1 Cambiar trigger de `unicode` de `"u"` a `"u:"`

**Archivo**: `lua/plugins/completions.lua:223`

```diff
- { name = "unicode", trigger_characters = { "u" } },
+ { name = "unicode", trigger_characters = { "u:" } },
```

**Efecto**: Solo se activa cuando el usuario escribe `u:` explícitamente. Elimina el fired constantemente con cada `u` en el texto normal. Sin riesgo de rotura.

---

### 1.2 Envolver callbacks en `pcall`

**Archivo**: `lua/plugins/completions.lua`

En el callback de `md_tags` (~línea 152):

```diff
  complete = function(self, request, callback)
+   local ok, result = pcall(function()
      local before = request.context.cursor_before_line:match("@([%w_]*)$")
      if not before then
        callback()
        return
      end
      ...
      callback({ items = items })
+   end)
+   if not ok then
+     callback()
+   end
  end,
```

En el callback de `unicode` (~línea 113):

```diff
  complete = function(self, request, callback)
+   local ok, result = pcall(function()
      local cursor_before_line = request.context.cursor_before_line
      local start_idx, end_idx, name_match = cursor_before_line:find("u:(%w*)$")

      if not start_idx then
        callback()
        return
      end
      ...
      callback({ items = items })
+   end)
+   if not ok then
+     callback()
+   end
  end,
```

**Efecto**: Si algo falla adentro, nvim-cmp no colapsa. Se llama `callback()` vacío y el error se traga limpiamente.

---

### 1.3 Corregir off-by-one en `textEdit.range`

**Archivo**: `lua/plugins/completions.lua:137-141`

```diff
      range = {
        start = { line = line, character = start_idx - 1 },
-       ["end"] = { line = line, character = col - 1 },
+       ["end"] = { line = line, character = col },
      },
```

**Efecto**: El `textEdit` ahora reemplaza exactamente el texto desde donde arrancó `u:` hasta la posición del cursor sin cortar un caracter.

---

### 1.4 Cambiar carga de nvim-cmp a eager

**Archivo**: `lua/plugins/completions.lua:97`

```diff
-   event = "InsertEnter",
+   lazy = false,
```

Alternativa segura: `lazy = false` fuerza carga al inicio. Si preferís mantener carga diferida, usá `event = "VeryLazy"`.

**Efecto**: nvim-cmp carga completo antes de entrar a Insert mode. No hay riesgo de init fallido en el primer `<C-space>`.

---

## Lote 2 — Resolver conflicto `<C-\>` (causa #4)

### 2.1 Cambiar `open_mapping` de toggleterm

**Archivo**: `lua/plugins/toggle-term.lua:16`

```diff
-   open_mapping = [[<c-\>]],
+   open_mapping = [[<leader>tt]],
```

**Efecto**: Libera `<C-\>` para nvim-cmp. toggleterm ahora se abre con `<leader>tt` (espacio + tt). Compatible con el keymap existente `<leader>tt` que ya está en línea 68.

**Nota**: La línea 68 ya tiene `vim.keymap.set('n', '<leader>tt', '<cmd>ToggleTerm direction=tab <cr>', {})`. Va a haber conflicto. Mejor:

```diff
-   open_mapping = [[<c-\>]],
+   open_mapping = [[<leader>tg]],
```
Y mantener `<leader>tt` como tab direction. O viceversa.

---

## Lote 3 — Estabilizar Treesitter (causas #5, #6)

### 3.1 Reemplazar `pcall` con manejo visible de errores

**Archivo**: `lua/plugins/tree-sitter.lua:31-33`

```diff
-       local lang = vim.treesitter.language.get_lang(vim.bo[args.buf].filetype)
-       if lang then
-         pcall(vim.treesitter.language.add, lang)
-         pcall(vim.treesitter.start, args.buf, lang)
-       end
+   local ft = vim.bo[args.buf].filetype
+   local lang = vim.treesitter.language.get_lang(ft)
+   if not lang then
+     vim.notify("[treesitter] No se encontró parser para: " .. ft, vim.log.levels.WARN)
+     return
+   end
+
+   local ok_add, err_add = pcall(vim.treesitter.language.add, lang)
+   if not ok_add then
+     vim.notify("[treesitter] Error al agregar parser " .. lang .. ": " .. err_add, vim.log.levels.WARN)
+     return
+   end
+
+   local ok_start, err_start = pcall(vim.treesitter.start, args.buf, lang)
+   if not ok_start then
+     vim.notify("[treesitter] Error al iniciar parser " .. lang .. ": " .. err_start, vim.log.levels.WARN)
+   end
```

**Efecto**: Si treesitter falla, ahora se ve el error. No queda silencioso.

---

### 3.2 Quitar `syntax on`

**Archivo**: `lua/config.lua:36`

```diff
- vim.cmd("syntax on")
+ -- syntax on se omite: treesitter maneja el resaltado
```

**Efecto**: Elimina la competencia entre Vim syntax y treesitter. Si un buffer no tiene parser treesitter disponible, Neovim cae automáticamente en `:syntax manual` sin necesidad de `syntax on`.

---

## Lote 4 — Limpieza general

### 4.1 Eliminar duplicado `"bash"` en treesitter

**Archivo**: `lua/plugins/tree-sitter.lua:21` — borrar la segunda ocurrencia de `"bash"`.

### 4.2 Quitar `"markdown_oxide"` de `ensure_installed`

**Archivo**: `lua/plugins/lsp-config.lua:162` — ese server no existe en Mason. Quitar de la lista.

### 4.3 Evaluar `error-lens.nvim`

**Archivo**: `lua/plugins/errorLens.lua`

Considerar cambiar `event = "BufRead"` a `event = "VeryLazy"` o quitar el plugin si `enabled = false` es permanente.

---

## Verificación post-cambios

```bash
# 1. Ver que lazy.nvim no reporte errores
nvim --headless "+Lazy! sync" +qa

# 2. Probar que nvim-cmp arranca
nvim --headless -c "lua print(require('cmp').loaded)" -c "qa"

# 3. Monitorear errores en vivo
:lua vim.g.log_level = vim.log.levels.DEBUG
```

---

## Rollback

Cada cambio está aislado en un archivo específico. Si algo sale mal:

```bash
git checkout lua/plugins/completions.lua
git checkout lua/plugins/toggle-term.lua
git checkout lua/plugins/tree-sitter.lua
git checkout lua/config.lua
```
