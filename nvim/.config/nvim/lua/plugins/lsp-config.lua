-- return {}
return {
  {
    "williamboman/mason.nvim",

    lazy = false,
    config = function()
      require("mason").setup()
    end,
  },
  {
    "williamboman/mason-lspconfig.nvim",
    lazy = false,
    otps = {
      auto_install = true,
    },
  },
  {
    "neovim/nvim-lspconfig",
    lazy = false,
    config = function()
      -- optimizacion del plugin
      -- esto evita que se cuelgue la pc
      local capabilities = vim.tbl_deep_extend("force",
        vim.lsp.protocol.make_client_capabilities(),
        -- esto por si solo causa que se cuelgue la pc
        require("cmp_nvim_lsp").default_capabilities()
      )
      capabilities.workspace.didChangeWatchedFiles.dynamicRegistration = false -- esto evita que se cuelgue
      local lspconfig = require("lspconfig")

      lspconfig.lua_ls.setup({
        capabilities = capabilities,
      })

      -- lspconfig.vtsls.setup({
      --   capabilities = capabilities,
      --
      --   init_options = {
      --     filetypes = { 'javascriptreact', 'javascript' },
      --     preferences = {
      --       disableSuggestions = true,
      --     }
      --   }
      -- })

      local status = pcall(require, "lspconfig")
      if (not status) then return end


      lspconfig.ts_ls.setup({
        --  ── old ─────────────────────────────────────────────────────────────
        capabilities = capabilities,
        -- recuerda que borraste el package.json de la lista por errores de nvim que molestan la visual al abrir un archivo .json
        root_pattern = { "tsconfig.json", "jsconfig.json", ".git" },
        init_options = {
          cmd = { "typescript-language-server", "--stdio" },

          filetypes = { "astro", "javascript", "javascriptreact", "typescript", "typescriptreact", },
          preferences = {
            disableSuggestions = false,

          },
        },

      })

      -- Configuración de eslint
      -- lspconfig.eslint.setup({
      --   capabilities = capabilities,
      -- })



      -- lspconfig.mdx_ls.setup({
      --   capabilities = capabilities,
      --   init_options = {
      --     filetypes = { 'astro' },
      --     preferences = {
      --       disableSuggestions = false,
      --     }
      --   }
      -- })
      --
      --
      -- ASTRO
      local util = require("lspconfig.util")
      lspconfig.astro_ls.setup(
        {
          capabilities = capabilities,
          cmd = { 'astro-ls', '--stdio' },
          filetypes = { 'astro' },
          root_markers = { 'package.json', 'tsconfig.json', 'jsconfig.json', '.git' },
          init_options = {
            typescript = {},
          },
          before_init = function(_, config)
            if config.init_options and config.init_options.typescript and not config.init_options.typescript.tsdk then
              config.init_options.typescript.tsdk = util.get_typescript_server_path(config.root_dir)
            end
          end,
        })

      capabilities.textDocument.completion.completionItem.snippetSupport = true

      lspconfig.html.setup({
        capabilities = capabilities,
        init_options =
        {
          configurationSection = { "html", "jsx", "javascriptreact", "tsx", 'typescriptreact', "astro" },
          embeddedLanguages = {
            css = true,
            javascript = true
          },
          provideFormatter = true
        },

        -- provideFormatter = true,
        -- filetypes = { "html", "jsx", "javascriptreact", "tsx", 'typescriptreact', "astro" },
      })

      lspconfig.emmet_ls.setup({
        capabilities = capabilities,

        cmd = { 'emmet-ls', '--stdio' },
        filetypes = {
          'astro',
          'css',
          'eruby',
          'html',
          'htmlangular',
          'htmldjango',
          'javascriptreact',
          'less',
          'pug',
          'sass',
          'scss',
          'svelte',
          'templ',
          'typescriptreact',
          'vue',
        },
        root_markers = { '.git' },
      })

      -- lspconfig.sqlls.setup({
      --   capabilities = capabilities,
      --   filetypes = { 'sql', 'mysql' },
      -- })

      -- Configuración de markdown con marksman
      lspconfig.marksman.setup({
        capabilities = capabilities,
        filetypes = { "markdown" },
        root_dir = lspconfig.util.root_pattern(".git", "README.md"),
      })


      -- docker
      -- vim.lsp.enable('docker_compose_language_service')
      lspconfig.docker_compose_language_service.setup({
        capabilities = capabilities,
        cmd = { 'docker-language-server', 'start', '--stdio' },
        filetypes = { 'dockerfile', 'yaml.docker-compose' },
        root_markers = {
          'Dockerfile',
          'docker-compose.yaml',
          'docker-compose.yml',
          'compose.yaml',
          'compose.yml',
          'docker-bake.json',
          'docker-bake.hcl',
          'docker-bake.override.json',
          'docker-bake.override.hcl',
        },
      })

      lspconfig.docker_language_server.setup({
        capabilities = capabilities,
        cmd = { 'docker-compose-langserver', '--stdio' },
        filetypes = { 'yaml.docker-compose' },
        root_markers = { 'docker-compose.yaml', 'docker-compose.yml', 'compose.yaml', 'compose.yml' },
      })

      lspconfig.cssls.setup({

        capabilities = capabilities,
        cmd = { 'vscode-css-language-server', '--stdio' },
        filetypes = { "css", "scss", "less" },
        init_options = { provideFormatter = true }, -- needed to enable formatting capabilities
        root_markers = { 'package.json', '.git' },
        settings = {
          css = { validate = true },
          scss = { validate = true },
          less = { validate = true },
        },
      })

      lspconfig.bashls.setup(
        {
          cmd = { 'bash-language-server', 'start' },
          settings = {
            bashIde = {
              -- Glob pattern for finding and parsing shell script files in the workspace.
              -- Used by the background analysis features across files.

              -- Prevent recursive scanning which will cause issues when opening a file
              -- directly in the home directory (e.g. ~/foo.sh).
              --
              -- Default upstream pattern is "**/*@(.sh|.inc|.bash|.command)".
              globPattern = vim.env.GLOB_PATTERN or '*@(.sh|.inc|.bash|.command)',
            },
          },
          filetypes = { 'bash', 'sh', 'curl' },
          root_markers = { '.git' },
        }
      )
      -- vim.diagnostic.config({ virtual_text = false })     -- Only if needed in your configuration, if you already have native LSP diagnostics
      --   ──────────────────────────────────────────────────────────────────────
      vim.keymap.set("n", "<leader>k", vim.lsp.buf.hover, {})
      vim.keymap.set("n", "<leader>gd", vim.lsp.buf.definition, {})
      vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, {})
    end,
  },
}
