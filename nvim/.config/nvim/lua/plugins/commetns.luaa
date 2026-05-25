return {
  {
    'numToStr/Comment.nvim',
    dependencies = {
      'JoosepAlviste/nvim-ts-context-commentstring',
    },

    config = function()
      require('ts_context_commentstring').setup {
        enable_autocmd = false,
      }
      require('Comment').setup {
        pre_hook = require('ts_context_commentstring.integrations.comment_nvim').create_pre_hook(),
      }
    end,

  },
  {

    "LudoPinelli/comment-box.nvim",
    config = function()
      require('comment-box').setup()
      local my_config = require('comment-box').setup({

        -- =========================================================
        -- 1. CONFIGURACIÓN DEL ESTILO (LÍNEA)
        -- =========================================================

        -- Aseguramos que solo se usen comentarios de línea
        comment_style = "line",

        -- Define el ancho total del comentario de línea
        line_width = 80,

        lines = {
          -- El plugin usa estas cinco propiedades para construir cualquier línea.
          -- Al establecer todas con el mismo carácter, garantizas la uniformidad.
          line = "▰",
          line_start = "● ",
          line_end = " ●",
          title_left = "▰",
          title_right = "▰",
        },

        -- =========================================================
        -- 2. DESACTIVACIÓN DE BORDES Y ESPACIOS
        -- =========================================================

        -- Dejar 'borders' vacío asegura que no se dibujen cajas con bordes simples
        borders = {},

        -- Desactivar todas las líneas en blanco para mantener la máxima compacidad
        outer_blank_lines_above = false,
        outer_blank_lines_below = false,
        inner_blank_lines = false,
        line_blank_line_above = false,
        line_blank_line_below = false,

        -- Esto es importante si planeas usar los comandos de CAJA (box)
        box_width = 60,
      })

      local keymap = vim.keymap.set
      local opts = { noremap = true, silent = true }
      -- Titles
      -- dsfsdf
      keymap({ "n", "v" }, "<Leader>cb", "<Cmd>CBllbox 18 <CR>", opts)
      -- keymap({ "n", "v" }, '<Leader>cb', ':<C-U>execute "CBccbox " . v:count<CR>',opts)
      keymap({ "n", "v" }, '<Leader>cbc', ':<C-U>execute "CBlcbox " . v:count<CR>', opts)
      keymap({ "n", "v" }, '<Leader>cbl', ':<C-U>execute "CBllbox " . v:count<CR>', opts)
      keymap({ 'n', 'v' }, '<Leader>cblc', ':<C-U>execute "CBllbox " . v:count<CR>', opts)
      keymap({ 'n', 'v' }, '<Leader>cbr', ':<C-U>execute "CBrrbox " . v:count<CR>', opts)
      -- Named parts
      -- keymap({ "n", "v" }, "<Leader>ct", "<Cmd>CBllline<CR>", opts)
      keymap({ "n", "v" }, "<Leader>ct", ':<C-U>execute "CBclline " . v:count<CR>', opts)
      keymap({ "n", "v" }, "<Leader>ctr", ':<C-U>execute "CBrrline " . v:count<CR>', opts)
      keymap({ "n", "v" }, "<Leader>ctc", ':<C-U>execute "CBccline " . v:count<CR>', opts)
      -- Simple line

      keymap({ "i", "n" }, "<M-n>", "<Cmd>CBclline<CR>", opts)     -- To use in Insert Mode
      keymap({ "i", "n", "v" }, "<M-m>", "<Cmd>CBlcbox<CR>", opts) -- To use in Insert Mode
      -- Marked comments
      keymap({ "n", "v" }, "<Leader>cm", "<Cmd>CBllbox14<CR>", opts)
      -- Removing a box is simple enough with the command (CBd), but if you
      -- use it a lot:
      keymap({ "n", "v" }, "<Leader>cd", "<Cmd>CBd<CR>", opts)
      keymap({ "n", "v", "i" }, "<M-d>", "<Cmd>CBd<CR>", opts)
    end
  },





  --  ╭─ ( START ) ──────────────────────────────────────────────────────╮
  --
  --  ╰─ ( END ) ────────────────────────────────────────────────────────╯
}
-- ╭─────────────────────────────────────────────────────────╮
-- │                        COMMANDOS                        │
-- ╰─────────────────────────────────────────────────────────╯
-- ┌─────────────────────────────────────────────────────────┐
--   NORMAL MODE
-- └─────────────────────────────────────────────────────────┘
-- ┌                                                         ┐
-- │ `gcc` - Toggles the current line using linewise comment │
-- │ `gbc` - Toggles the current line using blockwise comment│
-- │ `[count]gcc` - Toggles the number of line given as a    │
-- │ prefix-count using linewise                             │
-- │ `[count]gbc` - Toggles the number of line given as a    │
-- │ prefix-count using blockwise                            │
-- │ `gc[count]{motion}` - (Op-pending) Toggles the region   │
-- │ using linewise comment                                  │
-- │ `gb[count]{motion}` - (Op-pending) Toggles the region   │
-- │ using blockwise comment                                 │
-- └                                                         ┘
-- ┌─────────────────────────────────────────────────────────┐
--   EXTRA MAPPINGS
-- └─────────────────────────────────────────────────────────┘
-- ┌                                                         ┐
-- │ gco` - Insert comment to the next line and enters       │
-- │ INSERT mode                                             │
-- │ gcO` - Insert comment to the previous line and enters   │
-- │ INSERT mode                                             │
-- │ gcA` - Insert comment to end of the current line and    │
-- │ enters INSERT mode                                      │
-- └                                                         ┘
-- ┌─────────────────────────────────────────────────────────┐
--   VISUAL MODE
-- └─────────────────────────────────────────────────────────┘
-- ┌                                                         ┐
-- │ gc` - Toggles the region using linewise comment         │
-- │ gb` - Toggles the region using blockwise comment        │
-- └                                                         ┘
--
--
