return {
  {
    'nvim-telescope/telescope.nvim',
    tag = '0.1.5',
    dependencies = {
      'nvim-lua/plenary.nvim',
      'jonarrien/telescope-cmdline.nvim',
      'katkodeorg/telescope_worktree.nvim',
      -- 'nvim-telescope/telescope-media-files.nvim',
      -- 'nvim-lua/popup.nvim'
    },
    config = function()

    -- then use it, you can also use the `:Telescope rest select_env` command
      require('telescope').setup({

        -- extensions = {
        --
        --   media_files = {
        --     -- filetypes whitelist
        --     -- defaults to {"png", "jpg", "mp4", "webm", "pdf"}
        --     filetypes = { "png", "webp", "jpg", "jpeg" },
        --     -- find command (defaults to `fd`)
        --     find_cmd = "rg"
        --   }
        -- },
        defaults = {
          -- layout_strategy = "horizontal",
          layout_config = { prompt_position = "top" },
          sorting_strategy = "ascending",
          path_display = { 'truncate' },
          file_ignore_patterns = { "node_modules/*" },
          preview = {
            treesitter = true,
          },
          -- layout_config = {
          --   preview_width = 0.5,
          --   horizontal = {
          --     size = {
          --       width = "90%",
          --       height = "90%",
          --     },
          --   },
          -- },
        },
        -- pickers = {
        --   find_files = {
        --     theme = "dropdown",
        --   }
        -- },
        --
        -- require('telescope').load_extension('media_files')
      })
      local builtin = require('telescope.builtin')

      -- ╭─────────────────────────────────────────────────────────╮
      -- │                      K E Y M A P S                      │
      -- ╰─────────────────────────────────────────────────────────╯

      vim.keymap.set('n', '<leader>fg', builtin.live_grep, {})


      vim.keymap.set('n', '<leader>fht', builtin.help_tags, {})
      -- ╭─────────────────────────────────────────────────────────╮
      -- │ LISTS FUNCTION NAMES, VARIABLES, FROM TREESITTER!       │
      -- ╰─────────────────────────────────────────────────────────╯
      -- ┌                                                         ┐
      -- para ver un listado de todos los nombres de variables
      -- y funciones desde treestter.
      -- util para buscar una funcion, constante, variables, parametros
      vim.keymap.set('n', '<leader>ts', builtin.treesitter, {})


      -- ╭─────────────────────────────────────────────────────────╮
      -- │ LISTS LSP DOCUMENT SYMBOLS IN THE CURRENT BUFFER        │
      -- ╰─────────────────────────────────────────────────────────╯
      -- super util.
      -- permite buscar todos lo simbolos de lsp en el documento actual
      -- por simbolo se entiede:
      -- funciones, variables, constantes, propiedades
      vim.keymap.set('n', '<leader>fs', builtin.lsp_document_symbols, {})


      -- ──────────────────────────────────────────────────────────────────────
      -- ╭─────────────────────────────────────────────────────────╮
      -- │ LISTS LSP REFERENCES FOR WORD UNDER THE CURSOR          │
      -- ╰─────────────────────────────────────────────────────────╯
      -- ┌                                                         ┐
      -- │ super util - otra busca donde se hace referencia a la   │
      -- │ palabra bajo el cursor en todos los documentos              │
      -- │ similar al comando gd (ir a definicion) solo que mejor  │
      -- └                                                         ┘
      vim.keymap.set('n', '<leader>fr', builtin.lsp_references, {})
      -- ──────────────────────────────────────────────────────────────────────

      -- ╭─────────────────────────────────────────────────────────╮
      -- │ SEARCHES FOR THE STRING UNDER YOUR CURSOR OR SELECTION  │
      -- │ IN YOUR CURRENT WORKING DIRECTORY                       │
      -- ╰─────────────────────────────────────────────────────────╯
      -- ┌                                                         ┐
      -- │ busca la palabra debajo del cursor globalmente          │
      -- └                                                         ┘
      vim.keymap.set('n', '<leader>fw', builtin.grep_string, {})
      -- ──────────────────────────────────────────────────────────────────────

      -- Atajo para Telescope quickfix
      vim.keymap.set('n', '<leader>lq', builtin.quickfix, {})
      -- Atajo para git status
      -- vim.keymap.set('n', '<leader>gs', builtin.git_status, {})
      -- vim.keymap.set('n', '<C-p>', builtin.find_files, {})
      vim.keymap.set('n', '<leader>ff', builtin.find_files, {})
      vim.keymap.set("n", "<leader>fi", builtin.current_buffer_fuzzy_find, {})
      vim.keymap.set('n', '<leader>fb', builtin.buffers, {})
      -- ::> find comments

      local search_pattern =
      'mark:|{/* mark:|// todo:|{/* todo|// done:|{/* done| note:|fix:|warn:|now:|<!-- todo:|<!-- done:|<!-- note:|<!-- fix:|<!-- warn:|<!-- now:|<!-- mark:|/* todo:'

      vim.keymap.set('n', '<leader>lt', function()
        require('telescope.builtin').grep_string {
          search_dirs = { vim.fn.expand("%:p") },
          shorten_path = true,
          word_match = "-w",
          only_sort_text = true,
          search = search_pattern,
          prompt_title = "Find Comments/Marks in Current Buffer",
        }
      end, { desc = "[F]ind [C]omments/Marks in Current Buffer" })


      vim.keymap.set('n', ':', ':Telescope cmdline <CR>', { desc = 'Cmdline' })
      -- vim.keymap.set('n', 'fp', ':Telescope bookmarks list <CR>', { desc = 'Cmdline' })

      vim.keymap.set('n', '<leader>fd', builtin.lsp_definitions, {})

      vim.keymap.set('n', '<leader>fI', builtin.lsp_implementations, {})
      -- vim.keymap.set('n', '<leader>fof', builtin.oldfiles, {})
      vim.keymap.set('n', '<leader>fgf', builtin.git_files, {})
      vim.keymap.set('n', '<leader>lm', builtin.marks, {})
      vim.keymap.set('n', '<leader>lp', builtin.builtin, {})
      vim.keymap.set('n', '<leader>lqh', builtin.quickfixhistory, {})
      vim.keymap.set('n', '<leader>reg', builtin.registers, {})
      vim.keymap.set('n', '<leader>lj', builtin.jumplist, {})
      -- vim.keymap.set('n', '<leader>lt', builtin.tags, {})

      vim.keymap.set(
        "n",
        "<leader><space>",
        ":Telescope file_browser<CR>",
        { noremap = true }
      )


      -- ╭─────────────────────────────────────────────────────────╮
      -- │                      GIT WORK TREE                      │
      -- ╰─────────────────────────────────────────────────────────╯
      -- vim.keymap.set("n", "<leader>gt", function ()
      --   require('telescope').extensions.telescope_worktree.create_worktree()
      -- end, {desc = "[W]ork tree [C]reate"})
    end,
    -- pcall(require('telescope').load_extension, 'telescope_worktree'),

  },
  {
    "nvim-telescope/telescope-ui-select.nvim",
    config = function()
      -- This is your opts table
      require("telescope").setup({
        extensions = {
          ["ui-select"] = {
            require("telescope.themes").get_dropdown {

            }
          }
        },
      })

      require("telescope").load_extension("ui-select")
      require("telescope").load_extension("cmdline")
      -- require('telescope').load_extension('bookmarks')
      -- require("telescope").load_extension "session-lens"

    end
  },
  {
    "nvim-telescope/telescope-file-browser.nvim",
  },

}
