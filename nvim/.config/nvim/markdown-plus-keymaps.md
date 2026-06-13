# markdown-plus.nvim — Keymaps por defecto

Configuración: `<leader>` = `<Space>`, `<localleader>` = `\`

---

## Tabla de Contenidos (TOC)

| Key | Modo | Descripción |
|-----|------|-------------|
| `\ht` | n | Generar TOC al inicio |
| `\hu` | n | Actualizar TOC existente |
| `\hT` | n | Abrir TOC en ventana navegable |
| `gd` | n | Seguir enlace del TOC al header |

Comandos: `:Toc`, `:Toch`, `:Toct`

---

## Headers

| Key | Modo | Descripción |
|-----|------|-------------|
| `]]` | n | Ir al siguiente header |
| `[[` | n | Ir al header anterior |
| `\h+` | n | Aumentar nivel de header |
| `\h-` | n | Disminuir nivel de header |
| `\ms` | n | Alternar entre ATX y setext |
| `\h1` | n | Convertir a H1 |
| `\h2` | n | Convertir a H2 |
| `\h3` | n | Convertir a H3 |
| `\h4` | n | Convertir a H4 |
| `\h5` | n | Convertir a H5 |
| `\h6` | n | Convertir a H6 |

---

## Texto

| Key | Modo | Descripción |
|-----|------|-------------|
| `\mb` | n/x | Negrita |
| `\mi` | n/x | Itálica |
| `\mS` | n/x | Tachado |
| `\m`` | n/x | Código inline |
| `\m=` | n/x | Resaltado (`==texto==`) |
| `\mu` | n/x | Subrayado (`++texto++`) |
| `\me` | x | Escapar/desescapar puntuación markdown |
| `\mw` | x | Convertir selección a code block |
| `\mF` | n/x | Limpiar todo el formato |

---

## Listas

| Key | Modo | Descripción |
|-----|------|-------------|
| `<CR>` | i | Auto-continuar lista |
| `<A-CR>` | i | Continuar lista en línea siguiente |
| `<Tab>` | i | Indentar item |
| `<S-Tab>` | i | Outdentar item |
| `<BS>` | i | Backspace inteligente |
| `o` | n | Nuevo item debajo |
| `O` | n | Nuevo item arriba |
| `\mr` | n | Renumerar listas ordenadas |
| `\mx` | n/x | Toggle checkbox |
| `\ltu` | n/x | Convertir a lista sin orden |
| `\ltn` | n/x | Convertir a lista ordenada |
| `\ltt` | n/x | Convertir a task list |
| `\ltN` | n/x | Lista ordenada con paréntesis |
| `\ltl` | n/x | Lista letra minúscula |
| `\ltL` | n/x | Lista letra mayúscula |
| `\ltp` | n/x | Lista minúscula con paréntesis |
| `\ltP` | n/x | Lista mayúscula con paréntesis |
| `\ltc` | n/x | Limpiar marcadores de lista |

---

## Links

| Key | Modo | Descripción |
|-----|------|-------------|
| `\ml` | n | Insertar link |
| `\ml` | v | Convertir selección a link |
| `\me` | n | Editar link bajo el cursor |
| `\mR` | n | Convertir a reference-style link |
| `\mI` | n | Convertir a inline link |
| `\ma` | n | Auto-convertir URL a link |
| `\mp` | n | Smart paste URL desde clipboard |

---

## Imágenes

| Key | Modo | Descripción |
|-----|------|-------------|
| `\mL` | n | Insertar imagen |
| `\mL` | v | Convertir selección a imagen |
| `\mE` | n | Editar imagen bajo el cursor |
| `\mA` | n | Alternar entre link e imagen |

---

## Blockquotes

| Key | Modo | Descripción |
|-----|------|-------------|
| `\mq` | n/x | Toggle blockquote |

---

## Callouts

| Key | Modo | Descripción |
|-----|------|-------------|
| `\mQi` | n/x | Insertar callout (pide tipo) |
| `\mQt` | n | Cambiar tipo de callout |
| `\mQc` | n | Convertir blockquote a callout |
| `\mQb` | n | Convertir callout a blockquote |

---

## Code Blocks

| Key | Modo | Descripción |
|-----|------|-------------|
| `\mc` | n | Insertar fenced code block |
| `\mc` | x | Envolver selección en code block |
| `]b` | n | Ir al siguiente code block |
| `[b` | n | Ir al code block anterior |
| `\mC` | n | Cambiar lenguaje del code block |

---

## Línea temática

| Key | Modo | Descripción |
|-----|------|-------------|
| `\mh` | n | Insertar línea temática (---) |
| `\mH` | n | Cambiar estilo: `---` > `***` > `___` |

---

## Tablas (prefijo: `<leader>t` = `<Space>t`)

| Key | Modo | Descripción |
|-----|------|-------------|
| `<Space>tc` | n | Crear tabla |
| `<Space>tf` | n | Formatear tabla |
| `<Space>tn` | n | Normalizar tabla |
| `<Space>tir` | n | Insertar fila debajo |
| `<Space>tiR` | n | Insertar fila arriba |
| `<Space>tdr` | n | Eliminar fila |
| `<Space>tyr` | n | Duplicar fila |
| `<Space>tic` | n | Insertar columna derecha |
| `<Space>tiC` | n | Insertar columna izquierda |
| `<Space>tdc` | n | Eliminar columna |
| `<Space>tyc` | n | Duplicar columna |
| `<Space>ta` | n | Alternar alineación celda |
| `<Space>tx` | n | Limpiar celda |
| `<Space>tb` | n | Insertar `<br>` en celda |
| `<Space>tw` | n | Wrap celda |
| `<Space>tW` | n | Unwrap celda |
| `<Space>te` | n | Editar celda en popup |
| `<Space>tmj` | n | Mover fila abajo |
| `<Space>tmk` | n | Mover fila arriba |
| `<Space>tmh` | n | Mover columna izquierda |
| `<Space>tml` | n | Mover columna derecha |
| `<Space>tt` | n | Transponer tabla |
| `<Space>tsa` | n | Ordenar columna ascendente |
| `<Space>tsd` | n | Ordenar columna descendente |
| `<Space>tvx` | n | Convertir tabla a CSV |
| `<Space>tvi` | n | Convertir CSV a tabla |
| `<A-h/j/k/l>` | i | Navegar entre celdas |

---

## Footnotes

| Key | Modo | Descripción |
|-----|------|-------------|
| `\mfi` | n | Insertar footnote |
| `\mfe` | n | Editar footnote |
| `\mfd` | n | Eliminar footnote |
| `\mfg` | n | Ir a la definición |
| `\mfr` | n | Volver a la referencia |
| `\mfn` | n | Siguiente footnote |
| `\mfp` | n | Anterior footnote |
| `\mfl` | n | Listar footnotes |

---

## Notas

- `<localleader>` = `\` por defecto en Neovim
- `<leader>` = `<Space>` en tu config
- Si querés cambiar `<localleader>` a algo más cómodo (ej. `,`), agregá en tu config:

```lua
vim.g.maplocalleader = ","
```

- Verificá que el plugin esté activo en un `.md` con `:LspInfo` y `:nmap \ht`
