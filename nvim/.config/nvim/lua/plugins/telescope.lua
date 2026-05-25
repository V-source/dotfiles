-- return {
--   {
--     'nvim-telescope/telescope.nvim',
--     -- Quitamos el tag fijo '0.1.5' para que Lazy descargue la versión más reciente con los fixes de la v0.12
--     dependencies = {
--       'nvim-lua/plenary.nvim',
--       'jonarrien/telescope-cmdline.nvim',
--       'katkodeorg/telescope_worktree.nvim',
--       'nvim-telescope/telescope-ui-select.nvim',
--       'nvim-telescope/telescope-file-browser.nvim',
--     },
--     config = function()
--       local telescope = require('telescope')
--       local builtin = require('telescope.builtin')
--
--       -- Centralizamos todo el setup en un solo bloque limpio
--       telescope.setup({
--         defaults = {
--           layout_config = { prompt_position = "top" },
--           sorting_strategy = "ascending",
--           path_display = { 'truncate' },
--           file_ignore_patterns = { "node_modules/*" },
--           preview = {
--             treesitter = true,
--           },
--         },
--         extensions = {
--           ["ui-select"] = {
--             require("telescope.themes").get_dropdown({})
--           }
--         }
--       })
--
--       -- Carga de extensiones ordenada
--       telescope.load_extension("ui-select")
--       telescope.load_extension("cmdline")
--
--       -- ╭─────────────────────────────────────────────────────────╮
--       -- │                      K E Y M A P S                      │
--       -- ╰─────────────────────────────────────────────────────────╯
--
--       vim.keymap.set('n', '<leader>ff', builtin.find_files, {})
--       vim.keymap.set('n', '<leader>fg', builtin.live_grep, {})
--       vim.keymap.set('n', '<leader>fb', builtin.buffers, {})
--       vim.keymap.set('n', '<leader>fht', builtin.help_tags, {})
--       vim.keymap.set('n', '<leader>fi', builtin.current_buffer_fuzzy_find, {})
--       vim.keymap.set('n', ':', ':Telescope cmdline <CR>', { desc = 'Cmdline' })
--
--       -- Treesitter e Intelgencia LSP
--       vim.keymap.set('n', '<leader>ts', builtin.treesitter, {})
--       vim.keymap.set('n', '<leader>fs', builtin.lsp_document_symbols, {})
--       vim.keymap.set('n', '<leader>fr', builtin.lsp_references, {})
--       vim.keymap.set('n', '<leader>fw', builtin.grep_string, {})
--       vim.keymap.set('n', '<leader>fd', builtin.lsp_definitions, {})
--       vim.keymap.set('n', '<leader>fI', builtin.lsp_implementations, {})
--
--       -- Utilidades de Navegación
--       vim.keymap.set('n', '<leader>lq', builtin.quickfix, {})
--       vim.keymap.set('n', '<leader>fgf', builtin.git_files, {})
--       vim.keymap.set('n', '<leader>lm', builtin.marks, {})
--       vim.keymap.set('n', '<leader>lp', builtin.builtin, {})
--       vim.keymap.set('n', '<leader>lqh', builtin.quickfixhistory, {})
--       vim.keymap.set('n', '<leader>reg', builtin.registers, {})
--       vim.keymap.set('n', '<leader>lj', builtin.jumplist, {})
--
--       -- File Browser
--       vim.keymap.set("n", "<leader><space>", ":Telescope file_browser<CR>", { noremap = true })
--
--       -- Búsqueda avanzada de comentarios/marcas en el buffer actual
--       local search_pattern = 'mark:|{/* mark:|// todo:|{/* todo|// done:|{/* done| note:|fix:|warn:|now:|<!-- todo:|<!-- done:|<!-- note:|<!-- fix:|<!-- warn:|<!-- now:|<!-- mark:|/* todo:'
--       vim.keymap.set('n', '<leader>lt', function()
--         builtin.grep_string {
--           search_dirs = { vim.fn.expand("%:p") },
--           shorten_path = true,
--           word_match = "-w",
--           only_sort_text = true,
--           search = search_pattern,
--           prompt_title = "Find Comments/Marks in Current Buffer",
--         }
--       end, { desc = "[F]ind [C]omments/Marks in Current Buffer" })
--
--     end,
--   },
-- }


-- NEW CONFIG FOR NEOVIM 0.12
return {
  {
    "nvim-telescope/telescope.nvim",
    cmd = "Telescope",
    keys = {
      -- Búsquedas Básicas
      { "<leader>ff",      function() require("telescope.builtin").find_files() end,                desc = "Find Files" },
      { "<leader>fg",      function() require("telescope.builtin").live_grep() end,                 desc = "Live Grep" },
      { "<leader>fb",      function() require("telescope.builtin").buffers() end,                   desc = "Buffers" },
      { "<leader>fht",     function() require("telescope.builtin").help_tags() end,                 desc = "Help Tags" },
      { "<leader>fi",      function() require("telescope.builtin").current_buffer_fuzzy_find() end, desc = "Fuzzy Find Current Buffer" },
      { ":",               "<cmd>Telescope cmdline<CR>",                                            desc = "Cmdline" },

      -- Treesitter e Inteligencia LSP
      { "<leader>ts",      function() require("telescope.builtin").treesitter() end,                desc = "Treesitter Symbols" },
      { "<leader>fs",      function() require("telescope.builtin").lsp_document_symbols() end,      desc = "LSP Document Symbols" },
      { "<leader>fr",      function() require("telescope.builtin").lsp_references() end,            desc = "LSP References" },
      { "<leader>fw",      function() require("telescope.builtin").grep_string() end,               desc = "Grep Word Under Cursor" },
      { "<leader>fd",      function() require("telescope.builtin").lsp_definitions() end,           desc = "LSP Definitions" },
      { "<leader>fI",      function() require("telescope.builtin").lsp_implementations() end,       desc = "LSP Implementations" },

      -- Utilidades de Navegación
      { "<leader>lq",      function() require("telescope.builtin").quickfix() end,                  desc = "Quickfix List" },
      { "<leader>fgf",     function() require("telescope.builtin").git_files() end,                 desc = "Git Files" },
      { "<leader>lm",      function() require("telescope.builtin").marks() end,                     desc = "Marks" },
      { "<leader>lp",      function() require("telescope.builtin").builtin() end,                   desc = "Telescope Builtins" },
      { "<leader>lqh",     function() require("telescope.builtin").quickfixhistory() end,           desc = "Quickfix History" },
      { "<leader>reg",     function() require("telescope.builtin").registers() end,                 desc = "Registers" },
      { "<leader>lj",      function() require("telescope.builtin").jumplist() end,                  desc = "Jumplist" },

      -- Explorador de archivos (File Browser)
      { "<leader><space>", "<cmd>Telescope file_browser<CR>",                                       desc = "File Browser",             noremap = true },

      -- Gestión de Git Worktrees
      { "<leader>wt",      "<cmd>Telescope telescope_worktree git_worktrees<CR>",                   desc = "Git Worktrees" },

      -- Búsqueda Avanzada de Comentarios/Marcas (Sintaxis Corregida)
      {
        "<leader>lt",
        function()
          local search_pattern =
          'mark:|{/* mark:|// todo:|{/* todo|// done:|{/* done| note:|fix:|warn:|now:|<!-- todo:|<!-- done:|<!-- note:|<!-- fix:|<!-- warn:|<!-- now:|<!-- mark:|/* todo:'
          require("telescope.builtin").grep_string({
            search_dirs = { vim.fn.expand("%:p") },
            shorten_path = true,
            word_match = "-w",
            only_sort_text = true,
            search = search_pattern,
            prompt_title = "Find Comments/Marks in Current Buffer",
          })
        end,
        desc = "Find Comments/Marks in Current Buffer",
      },
    },
    dependencies = {
      "nvim-lua/plenary.nvim",
      "jonarrien/telescope-cmdline.nvim",
      "katkodeorg/telescope_worktree.nvim",
      "nvim-telescope/telescope-ui-select.nvim",
      "nvim-telescope/telescope-file-browser.nvim",
    },
    config = function()
      local telescope = require("telescope")

      telescope.setup({
        defaults = {
          layout_config = { prompt_position = "top" },
          sorting_strategy = "ascending",
          path_display = { "truncate" },
          file_ignore_patterns = { "node_modules/*" },
          preview = {
            treesitter = true,
          },
        },
        extensions = {
          ["ui-select"] = {
            require("telescope.themes").get_dropdown({}),
          },
          ["file_browser"] = {
            theme = "ivy",
            hijack_netrw = true,
          },
          ["telescope_worktree"] = {
            clear_jumps = true,
          },
        },
      })

      telescope.load_extension("ui-select")
      telescope.load_extension("cmdline")
      telescope.load_extension("file_browser")
      telescope.load_extension("telescope_worktree")
    end,
  },
}
