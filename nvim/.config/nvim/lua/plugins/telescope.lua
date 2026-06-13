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
      { "<leader>ff",      function() require("telescope.builtin").find_files() end,                    desc = "Find Files" },
      { "<leader>fg",      function() require("telescope.builtin").live_grep() end,                     desc = "Live Grep" },
      { "<leader>fb",      function() require("telescope.builtin").buffers() end,                       desc = "Buffers" },
      { "<leader>fht",     function() require("telescope.builtin").help_tags() end,                     desc = "Help Tags" },
      { "<leader>fi",      function() require("telescope.builtin").current_buffer_fuzzy_find() end,     desc = "Fuzzy Find Current Buffer" },
      { ":",               "<cmd>Telescope cmdline<CR>",                                                desc = "Cmdline" },

      -- Treesitter e Inteligencia LSP
      { "<leader>ts",      function() require("telescope.builtin").treesitter() end,                    desc = "Treesitter Symbols" },
      { "<leader>fs",      function() require("telescope.builtin").lsp_document_symbols() end,          desc = "LSP Document Symbols" },
      { "<leader>fr",      function() require("telescope.builtin").lsp_references() end,                desc = "LSP References" },
      { "<leader>fw",      function() require("telescope.builtin").grep_string() end,                   desc = "Grep Word Under Cursor" },
      { "<leader>fd",      function() require("telescope.builtin").lsp_definitions() end,               desc = "LSP Definitions" },
      { "<leader>fI",      function() require("telescope.builtin").lsp_implementations() end,           desc = "LSP Implementations" },
      -- Nuevos super-atajos de navegación
      { "<leader>fS",      function() require("telescope.builtin").lsp_workspace_symbols() end,         desc = "LSP Workspace Symbols" },
      { "<leader>fy",      function() require("telescope.builtin").lsp_dynamic_workspace_symbols() end, desc = "LSP Dynamic Symbols" },
      { "<leader>ft",      function() require("telescope.builtin").lsp_type_definitions() end,          desc = "LSP Type Definitions" },
      { "<leader>fD",      function() require("telescope.builtin").diagnostics({ bufnr = 0 }) end,      desc = "LSP Buffer Diagnostics" },

      -- Utilidades de Navegación
      { "<leader>lq",      function() require("telescope.builtin").quickfix() end,                      desc = "Quickfix List" },
      { "<leader>fgf",     function() require("telescope.builtin").git_files() end,                     desc = "Git Files" },
      { "<leader>lm",      function() require("telescope.builtin").marks() end,                         desc = "Marks" },
      { "<leader>lp",      function() require("telescope.builtin").builtin() end,                       desc = "Telescope Builtins" },
      { "<leader>lqh",     function() require("telescope.builtin").quickfixhistory() end,               desc = "Quickfix History" },
      -- { "<leader>reg",     function() require("telescope.builtin").registers() end,                     desc = "Registers" },
      { "<leader>lj",      function() require("telescope.builtin").jumplist() end,                      desc = "Jumplist" },

      -- Explorador de archivos (File Browser)
      { "<leader><space>", "<cmd>Telescope file_browser<CR>",                                           desc = "File Browser",             noremap = true },

      -- Gestión de Git Worktrees
      { "<leader>wt",      "<cmd>Telescope telescope_worktree git_worktrees<CR>",                       desc = "Git Worktrees" },

      {
        "<leader>sv",
        function()
          local icons = require("unicode_icons")
          require("telescope.pickers").new({}, {
            prompt_title = "Unicode Icons",
            finder = require("telescope.finders").new_table({
              results = icons,
              entry_maker = function(entry)
                return {
                  value = entry.icon,
                  display = entry.icon .. "  " .. entry.name,
                  ordinal = entry.name,
                }
              end,
            }),
            sorter = require("telescope.sorters").get_fzy_sorter(),
            attach_mappings = function(prompt_bufnr, map)
              local actions = require("telescope.actions")
              local action_state = require("telescope.actions.state")
              actions.select_default:replace(function()
                actions.close(prompt_bufnr)
                local selection = action_state.get_selected_entry()
                if selection then
                  vim.schedule(function()
                    vim.api.nvim_put({ selection.value }, "c", false, true)
                  end)
                end
              end)
              return true
            end,
          }):find()
        end,
        desc = "Unicode Icons"
      },
      {
        "<leader>f#",
        function()
          local results = {}
          local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)

          for line_idx, line_content in ipairs(lines) do
            local start_pos = 1
            -- Buscamos de forma iterativa avanzando la posición inicial para capturar columnas exactas
            while true do
              local start_match, end_match = line_content:find("#_[%w_]+", start_pos)
              if not start_match then break end

              local match_text = line_content:sub(start_match, end_match)

              table.insert(results, {
                text = match_text,
                line = line_idx,
                col = start_match, -- Columna exacta basada en bytes (1-indexed)
              })

              -- Avanzamos el puntero para el siguiente hashtag en la misma línea
              start_pos = end_match + 1
            end
          end

          local pickers = require("telescope.pickers")
          local finders = require("telescope.finders")
          local sorters = require("telescope.sorters")
          local conf = require("telescope.config").values

          pickers.new({}, {
            prompt_title = "#hashtags",
            finder = finders.new_table({
              results = results,
              entry_maker = function(entry)
                return {
                  value = entry,
                  display = string.format("%-12s │ %s", entry.text, vim.trim(lines[entry.line])),
                  ordinal = entry.text .. " " .. lines[entry.line],
                  filename = vim.api.nvim_buf_get_name(0),
                  lnum = entry.line,
                  col = entry.col,
                }
              end,
            }),
            sorter = sorters.get_fzy_sorter(),
            previewer = conf.qflist_previewer({}), -- Habilita ventana de vista previa
            attach_mappings = function(prompt_bufnr, map)
              local actions = require("telescope.actions")
              local action_state = require("telescope.actions.state")

              actions.select_default:replace(function()
                local selection = action_state.get_selected_entry()
                actions.close(prompt_bufnr) -- Cerramos Telescope antes de mover el cursor

                if selection then
                  -- Línea basada en 1, Columna basada en 0 para nvim_win_set_cursor
                  vim.api.nvim_win_set_cursor(0, { selection.lnum, selection.col - 1 })
                  vim.cmd("normal! zz")
                end
              end)
              return true
            end,
          }):find()
        end,
        desc = "Find #hashtags"
      },

      {
        "<leader>f@",
        function()
          local results = {}
          local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)

          for line_idx, line_content in ipairs(lines) do
            local start_pos = 1
            -- Buscamos de forma iterativa avanzando la posición inicial para no repetir tags
            while true do
              local start_match, end_match = line_content:find("@[%w_]+", start_pos)
              if not start_match then break end

              local match_text = line_content:sub(start_match, end_match)

              table.insert(results, {
                text = match_text,
                line = line_idx,
                col = start_match, -- Columna exacta basada en bytes (1-indexed para Neovim)
              })

              -- Avanzamos el puntero para la siguiente búsqueda en la misma línea
              start_pos = end_match + 1
            end
          end

          local pickers = require("telescope.pickers")
          local finders = require("telescope.finders")
          local sorters = require("telescope.sorters")
          local conf = require("telescope.config").values

          pickers.new({}, {
            prompt_title = "@tags",
            finder = finders.new_table({
              results = results,
              entry_maker = function(entry)
                return {
                  value = entry,
                  -- Muestra el tag destacado y el contenido limpio de la línea
                  display = string.format("%-12s │ %s", entry.text, vim.trim(lines[entry.line])),
                  ordinal = entry.text .. " " .. lines[entry.line],
                  filename = vim.api.nvim_buf_get_name(0),
                  lnum = entry.line,
                  col = entry.col,
                }
              end,
            }),
            sorter = sorters.get_fzy_sorter(),
            -- Agregado: Muestra la vista previa del archivo centrado en el tag
            previewer = conf.qflist_previewer({}),
            attach_mappings = function(prompt_bufnr, map)
              local actions = require("telescope.actions")
              local action_state = require("telescope.actions.state")

              actions.select_default:replace(function()
                local selection = action_state.get_selected_entry()
                actions.close(prompt_bufnr)

                if selection then
                  -- El API de Neovim nvim_win_set_cursor requiere:
                  -- Línea: basada en 1 (entry.line lo es)
                  -- Columna: basada en 0 (por eso restamos 1 a entry.col)
                  vim.api.nvim_win_set_cursor(0, { selection.lnum, selection.col - 1 })
                  vim.cmd("normal! zz")
                end
              end)
              return true
            end,
          }):find()
        end,
        desc = "Find @tags"
      },
      {
        "<leader>emo",
        function()
          require("telescope").extensions.emoji.emoji({
            action = function(emoji)
              vim.schedule(function()
                vim.api.nvim_put({ emoji.value }, "l", false, true)
              end)
            end,
          })
        end,
        desc = "Emojis"
      },
    },
    dependencies = {
      "nvim-lua/plenary.nvim",
      "jonarrien/telescope-cmdline.nvim",
      "katkodeorg/telescope_worktree.nvim",
      "nvim-telescope/telescope-ui-select.nvim",
      "nvim-telescope/telescope-file-browser.nvim",
      "nvim-telescope/telescope-frecency.nvim", -- agregado 2026-06-11
      "xiyaowong/telescope-emoji.nvim",         -- agregado 2026-06-11


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
          ["frecency"] = { -- agregado 2026-06-11
            show_scores = false,
            workspaces = {
              -- ["nvim"] = vim.fn.stdpath("~./config"),
              ["dev"] = "/home/villegas/git",
            },
          },
        },
      })

      telescope.load_extension("ui-select")
      telescope.load_extension("cmdline")
      telescope.load_extension("file_browser")
      telescope.load_extension("telescope_worktree")
      telescope.load_extension("frecency") -- agregado 2026-06-11
      telescope.load_extension("emoji")    -- agregado 2026-06-11
    end,
  },
}
