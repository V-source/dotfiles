return {
  {
    'nvim-telescope/telescope.nvim',
    -- Quitamos el tag fijo '0.1.5' para que Lazy descargue la versión más reciente con los fixes de la v0.12
    dependencies = {
      'nvim-lua/plenary.nvim',
      'jonarrien/telescope-cmdline.nvim',
      'katkodeorg/telescope_worktree.nvim',
      'nvim-telescope/telescope-ui-select.nvim',
      'nvim-telescope/telescope-file-browser.nvim',
    },
    config = function()
      local telescope = require('telescope')
      local builtin = require('telescope.builtin')

      -- Centralizamos todo el setup en un solo bloque limpio
      telescope.setup({
        defaults = {
          layout_config = { prompt_position = "top" },
          sorting_strategy = "ascending",
          path_display = { 'truncate' },
          file_ignore_patterns = { "node_modules/*" },
          preview = {
            treesitter = true,
          },
        },
        extensions = {
          ["ui-select"] = {
            require("telescope.themes").get_dropdown({})
          }
        }
      })

      -- Carga de extensiones ordenada
      telescope.load_extension("ui-select")
      telescope.load_extension("cmdline")

      -- ╭─────────────────────────────────────────────────────────╮
      -- │                      K E Y M A P S                      │
      -- ╰─────────────────────────────────────────────────────────╯

      vim.keymap.set('n', '<leader>ff', builtin.find_files, {})
      vim.keymap.set('n', '<leader>fg', builtin.live_grep, {})
      vim.keymap.set('n', '<leader>fb', builtin.buffers, {})
      vim.keymap.set('n', '<leader>fht', builtin.help_tags, {})
      vim.keymap.set('n', '<leader>fi', builtin.current_buffer_fuzzy_find, {})
      vim.keymap.set('n', ':', ':Telescope cmdline <CR>', { desc = 'Cmdline' })

      -- Treesitter e Intelgencia LSP
      vim.keymap.set('n', '<leader>ts', builtin.treesitter, {})
      vim.keymap.set('n', '<leader>fs', builtin.lsp_document_symbols, {})
      vim.keymap.set('n', '<leader>fr', builtin.lsp_references, {})
      vim.keymap.set('n', '<leader>fw', builtin.grep_string, {})
      vim.keymap.set('n', '<leader>fd', builtin.lsp_definitions, {})
      vim.keymap.set('n', '<leader>fI', builtin.lsp_implementations, {})

      -- Utilidades de Navegación
      vim.keymap.set('n', '<leader>lq', builtin.quickfix, {})
      vim.keymap.set('n', '<leader>fgf', builtin.git_files, {})
      vim.keymap.set('n', '<leader>lm', builtin.marks, {})
      vim.keymap.set('n', '<leader>lp', builtin.builtin, {})
      vim.keymap.set('n', '<leader>lqh', builtin.quickfixhistory, {})
      vim.keymap.set('n', '<leader>reg', builtin.registers, {})
      vim.keymap.set('n', '<leader>lj', builtin.jumplist, {})

      -- File Browser
      vim.keymap.set("n", "<leader><space>", ":Telescope file_browser<CR>", { noremap = true })

      -- Búsqueda avanzada de comentarios/marcas en el buffer actual
      local search_pattern = 'mark:|{/* mark:|// todo:|{/* todo|// done:|{/* done| note:|fix:|warn:|now:|<!-- todo:|<!-- done:|<!-- note:|<!-- fix:|<!-- warn:|<!-- now:|<!-- mark:|/* todo:'
      vim.keymap.set('n', '<leader>lt', function()
        builtin.grep_string {
          search_dirs = { vim.fn.expand("%:p") },
          shorten_path = true,
          word_match = "-w",
          only_sort_text = true,
          search = search_pattern,
          prompt_title = "Find Comments/Marks in Current Buffer",
        }
      end, { desc = "[F]ind [C]omments/Marks in Current Buffer" })

    end,
  },
}
