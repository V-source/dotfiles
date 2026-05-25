return {
  -- 1. HERRAMIENTAS DE INSTALACIÓN (MASON)
  {
    "williamboman/mason.nvim",
    opts = function(_, opts)
      opts.ensure_installed = opts.ensure_installed or {}
      -- Añadimos tanto los formatters como los linters a la lista de auto-instalación
      vim.list_extend(opts.ensure_installed, { 
        "prettier", 
        "stylua",
        "eslint_d",     -- Linter para JS/TS/Astro
        "markdownlint"  -- Linter para Markdown
      })
    end,
  },

  -- 2. EL ESTÁNDAR DE FORMATEO ASÍNCRONO (CONFORM)
  {
    "stevearc/conform.nvim",
    lazy = false,
    config = function()
      local conform = require("conform")

      conform.setup({
        formatters_by_ft = {
          lua = { "stylua" },
          javascript = { "prettier" },
          typescript = { "prettier" },
          javascriptreact = { "prettier" },
          typescriptreact = { "prettier" },
          astro = { "prettier" },
          html = { "prettier" },
          css = { "prettier" },
        },
        format_on_save = {
          lsp_fallback = true,
          timeout_ms = 500,
        },
      })

      vim.keymap.set("n", "<leader>fm", function()
        conform.format({ builtin_lsp = true, async = true })
      end, {})
    end,
  },

  -- 3. EL NUEVO ESTÁNDAR DE LINTING ASÍNCRONO (NVIM-LINT)
  {
    "mfussenegger/nvim-lint",
    event = { "BufReadPre", "BufNewFile" }, -- Carga perezosa al abrir un archivo
    config = function()
      local lint = require("lint")

      -- Asignación de linters por tipo de archivo
      lint.linters_by_ft = {
        javascript = { "eslint_d" },
        typescript = { "eslint_d" },
        javascriptreact = { "eslint_d" },
        typescriptreact = { "eslint_d" },
        astro = { "eslint_d" },
        markdown = { "markdownlint" },
      }

      -- Autocomando nativo para ejecutar el linter automáticamente al escribir o guardar
      local lint_augroup = vim.api.nvim_create_augroup("NvimLintConfig", { clear = true })
      vim.api.nvim_create_autocmd({ "BufEnter", "BufWritePost", "InsertLeave" }, {
        group = lint_augroup,
        callback = function()
          -- Ejecuta el linter solo si el buffer actual es válido
          if vim.bo.buftype == "" then
            lint.try_lint()
          end
        end,
      })
    end,
  },
}
