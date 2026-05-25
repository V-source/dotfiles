-- return {
--   {
--     "williamboman/mason.nvim",
--     lazy = false,
--     config = function()
--       require("mason").setup()
--     end,
--   },
--   {
--     "neovim/nvim-lspconfig",
--     lazy = false,
--     config = function()
--       -- 1. Configuración de capacidades optimizadas
--       local capabilities = vim.tbl_deep_extend(
--         "force",
--         vim.lsp.protocol.make_client_capabilities(),
--         require("cmp_nvim_lsp").default_capabilities()
--       )
--       capabilities.workspace.didChangeWatchedFiles.dynamicRegistration = false
--
--       -- 2. FUNCIÓN AUXILIAR PARA HABILITAR SERVIDORES (Sintaxis Estricta 0.12)
--       -- En v0.12 se usa vim.lsp.enable para activar y extender los configs nativos en lsp/
--       local function setup_server(name, opts)
--         opts = opts or {}
--         opts.capabilities = vim.tbl_deep_extend("force", capabilities, opts.capabilities or {})
--
--         -- Habilita el servidor usando la base de datos de lsp/ que provee nvim-lspconfig
--         vim.lsp.enable(name, opts)
--       end
--
--       -- 3. DECLARACIÓN DE SERVIDORES
--
--       -- LUA
--       setup_server("lua_ls")
--
--       -- JAVASCRIPT / TYPESCRIPT
--       setup_server("ts_ls", {
--         cmd = { "typescript-language-server", "--stdio" },
--         filetypes = { "astro", "javascript", "javascriptreact", "typescript", "typescriptreact" },
--         root_markers = { "tsconfig.json", "jsconfig.json", ".git" },
--         init_options = {
--           preferences = { disableSuggestions = false },
--         },
--       })
--
--       -- ASTRO
--       setup_server("astro", {
--         cmd = { 'astro-ls', '--stdio' },
--         filetypes = { 'astro' },
--         root_markers = { 'package.json', 'tsconfig.json', 'jsconfig.json', '.git' },
--         init_options = { typescript = {} },
--         before_init = function(_, config)
--           if config.init_options and config.init_options.typescript and not config.init_options.typescript.tsdk then
--             local root_dir = config.root_dir or vim.fn.getcwd()
--             local tsdk_path = vim.fs.joinpath(root_dir, "node_modules", "typescript", "lib")
--             if vim.fn.isdirectory(tsdk_path) == 0 then
--               tsdk_path = "/usr/lib/node_modules/typescript/lib"
--             end
--             config.init_options.typescript.tsdk = tsdk_path
--           end
--         end,
--       })
--
--       -- HTML
--       local html_capabilities = vim.deepcopy(capabilities)
--       html_capabilities.textDocument.completion.completionItem.snippetSupport = true
--       setup_server("html", {
--         capabilities = html_capabilities,
--         init_options = {
--           configurationSection = { "html", "jsx", "javascriptreact", "tsx", 'typescriptreact', "astro" },
--           embeddedLanguages = { css = true, javascript = true },
--           provideFormatter = true
--         },
--       })
--
--       -- EMMET
--       setup_server("emmet_ls", {
--         cmd = { 'emmet-ls', '--stdio' },
--         filetypes = {
--           'astro', 'css', 'eruby', 'html', 'htmlangular', 'htmldjango',
--           'javascriptreact', 'less', 'pug', 'sass', 'scss', 'svelte',
--           'templ', 'typescriptreact', 'vue',
--         },
--         root_markers = { '.git' },
--       })
--
--       -- MARKDOWN
--       setup_server("marksman", {
--         filetypes = { "markdown" },
--         root_markers = { ".git", "README.md" },
--       })
--
--       -- DOCKER
--       setup_server("dockerls", {
--         cmd = { 'docker-language-server', 'start', '--stdio' },
--         filetypes = { 'dockerfile' },
--         root_markers = { 'Dockerfile', '.git' },
--       })
--
--       setup_server("docker_compose", {
--         cmd = { 'docker-compose-langserver', '--stdio' },
--         filetypes = { 'yaml.docker-compose' },
--         root_markers = { 'docker-compose.yaml', 'docker-compose.yml', 'compose.yaml', 'compose.yml' },
--       })
--
--       -- CSS
--       setup_server("cssls", {
--         cmd = { 'vscode-css-language-server', '--stdio' },
--         filetypes = { "css", "scss", "less" },
--         init_options = { provideFormatter = true },
--         root_markers = { 'package.json', '.git' },
--         settings = {
--           css = { validate = true },
--           scss = { validate = true },
--           less = { validate = true },
--         },
--       })
--
--       -- BASH
--       setup_server("bashls", {
--         cmd = { 'bash-language-server', 'start' },
--         filetypes = { 'bash', 'sh', 'curl' },
--         root_markers = { '.git' },
--         settings = {
--           bashIde = {
--             globPattern = vim.env.GLOB_PATTERN or '*@(.sh|.inc|.bash|.command)',
--           },
--         },
--       })
--
--       -- 4. KEYMAPS NATIVOS
--       vim.keymap.set("n", "<leader>k", vim.lsp.buf.hover, {})
--       vim.keymap.set("n", "<leader>gd", vim.lsp.buf.definition, {})
--       vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, {})
--     end,
--   },
-- }


return {
  {
    "williamboman/mason.nvim",
    lazy = false,
    config = function()
      require("mason").setup()
    end,
  },
  -- ADICIÓN: Plugin puente para automatizar la instalación
  {
    "williamboman/mason-lspconfig.nvim",
    lazy = false,
    config = function()
      require("mason-lspconfig").setup({
        -- Aquí declaras qué módulos quieres que se instalen solos
        ensure_installed = {
          "lua_ls",
          "ts_ls",
          "astro",
          "html",
          "emmet_ls",
          "marksman",
          "dockerls",
          "docker_compose_language_service",
          "cssls",
          "bashls"
        },
      })
    end,
  },
  {
    "neovim/nvim-lspconfig",
    lazy = false,
    -- Forzamos a que espere a que mason-lspconfig verifique e instale todo
    dependencies = { "williamboman/mason-lspconfig.nvim" },
    config = function()
      -- 1. Configuración de capacidades optimizadas
      local capabilities = vim.tbl_deep_extend(
        "force",
        vim.lsp.protocol.make_client_capabilities(),
        require("cmp_nvim_lsp").default_capabilities()
      )
      capabilities.workspace.didChangeWatchedFiles.dynamicRegistration = false

      -- 2. FUNCIÓN AUXILIAR PARA HABILITAR SERVIDORES (Sintaxis Estricta 0.12)
      local function setup_server(name, opts)
        opts = opts or {}
        opts.capabilities = vim.tbl_deep_extend("force", capabilities, opts.capabilities or {})

        -- Habilita el servidor usando la base de datos de lsp/ que provee nvim-lspconfig
        vim.lsp.enable(name, opts)
      end

      -- 3. DECLARACIÓN DE SERVIDORES

      -- LUA
      setup_server("lua_ls")

      -- JAVASCRIPT / TYPESCRIPT
      setup_server("ts_ls", {
        cmd = { "typescript-language-server", "--stdio" },
        filetypes = { "astro", "javascript", "javascriptreact", "typescript", "typescriptreact" },
        root_markers = { "tsconfig.json", "jsconfig.json", ".git" },
        init_options = {
          preferences = { disableSuggestions = false },
        },
      })

      -- ASTRO
      setup_server("astro", {
        cmd = { 'astro-ls', '--stdio' },
        filetypes = { 'astro' },
        root_markers = { 'package.json', 'tsconfig.json', 'jsconfig.json', '.git' },
        init_options = { typescript = {} },
        before_init = function(_, config)
          if config.init_options and config.init_options.typescript and not config.init_options.typescript.tsdk then
            local root_dir = config.root_dir or vim.fn.getcwd()
            local tsdk_path = vim.fs.joinpath(root_dir, "node_modules", "typescript", "lib")
            if vim.fn.isdirectory(tsdk_path) == 0 then
              tsdk_path = "/usr/lib/node_modules/typescript/lib"
            end
            config.init_options.typescript.tsdk = tsdk_path
          end
        end,
      })

      -- HTML
      local html_capabilities = vim.deepcopy(capabilities)
      html_capabilities.textDocument.completion.completionItem.snippetSupport = true
      setup_server("html", {
        capabilities = html_capabilities,
        init_options = {
          configurationSection = { "html", "jsx", "javascriptreact", "tsx", 'typescriptreact', "astro" },
          embeddedLanguages = { css = true, javascript = true },
          provideFormatter = true
        },
      })

      -- EMMET
      setup_server("emmet_ls", {
        cmd = { 'emmet-ls', '--stdio' },
        filetypes = {
          'astro', 'css', 'eruby', 'html', 'htmlangular', 'htmldjango',
          'javascriptreact', 'less', 'pug', 'sass', 'scss', 'svelte',
          'templ', 'typescriptreact', 'vue',
        },
        root_markers = { '.git' },
      })

      -- MARKDOWN
      setup_server("marksman", {
        filetypes = { "markdown" },
        root_markers = { ".git", "README.md" },
      })

      -- DOCKER
      setup_server("dockerls", {
        cmd = { 'docker-language-server', 'start', '--stdio' },
        filetypes = { 'dockerfile' },
        root_markers = { 'Dockerfile', '.git' },
      })

      setup_server("docker_compose", {
        cmd = { 'docker-compose-langserver', '--stdio' },
        filetypes = { 'yaml.docker-compose' },
        root_markers = { 'docker-compose.yaml', 'docker-compose.yml', 'compose.yaml', 'compose.yml' },
      })

      -- CSS
      setup_server("cssls", {
        cmd = { 'vscode-css-language-server', '--stdio' },
        filetypes = { "css", "scss", "less" },
        init_options = { provideFormatter = true },
        root_markers = { 'package.json', '.git' },
        settings = {
          css = { validate = true },
          scss = { validate = true },
          less = { validate = true },
        },
      })

      -- BASH
      setup_server("bashls", {
        cmd = { 'bash-language-server', 'start' },
        filetypes = { 'bash', 'sh', 'curl' },
        root_markers = { '.git' },
        settings = {
          bashIde = {
            globPattern = vim.env.GLOB_PATTERN or '*@(.sh|.inc|.bash|.command)',
          },
        },
      })

      -- 4. KEYMAPS NATIVOS
      vim.keymap.set("n", "<leader>k", vim.lsp.buf.hover, {})
      vim.keymap.set("n", "<leader>gd", vim.lsp.buf.definition, {})
      vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, {})
    end,
  },
}
