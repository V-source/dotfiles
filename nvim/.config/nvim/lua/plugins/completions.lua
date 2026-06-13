-- return {
--   {
--     "hrsh7th/cmp-nvim-lsp"
--   },
--
--   {
--     "L3MON4D3/LuaSnip",
--     dependencies = {
--       "saadparwaiz1/cmp_luasnip",
--       "rafamadriz/friendly-snippets"
--     },
--   },
--
--   {
--     "hrsh7th/nvim-cmp",
--
--     config = function()
--       local cmp = require("cmp")
--       local luasnip = require('luasnip')
--       require('user.snippets')
--
--       require("luasnip.loaders.from_vscode").lazy_load() -- edited
--       -- require("luasnip.loaders.from_snipmate").lazy_load()
--
--       cmp.setup({
--         experimental = {
--           ghost_text = false,
--         },
--         snippet = {
--           -- REQUIRED - you must specify a snippet engine
--           expand = function(args)
--             -- vim.fn["vsnip#anonymous"](args.body)     -- For `vsnip` users.
--             require("luasnip").lsp_expand(args.body) -- For `luasnip` users. --edited
--           end,
--         },
--         window = {
--           completion = cmp.config.window.bordered(),    --edited
--           documentation = cmp.config.window.bordered(), --edited
--         },
--         mapping = cmp.mapping.preset.insert({
--           ["<C-d>"] = cmp.mapping.scroll_docs(-4),
--           ["<C-u>"] = cmp.mapping.scroll_docs(4),
--           -- ["<CR>"] = cmp.mapping.confirm({ select = true }),
--           ["<C-\\>"] = cmp.mapping.complete(),
--           ["<C-e>"] = cmp.mapping.abort(),
--           ['<C-o>'] = cmp.mapping.confirm({ select = true }),
--           -- ['<C-l>'] = cmp.mapping.confirm({ select = true }),
--           -- los siguientes mappings los encontré en:
--           -- https://vonheikemen.github.io/devlog/es/tools/setup-nvim-lspconfig-plus-nvim-cmp/
--           ['<Tab>'] = cmp.mapping(function(fallback)
--             if luasnip.jumpable(1) then
--               luasnip.jump(1)
--             else
--               fallback()
--             end
--           end, { 'i', 's' }),
--
--           ['<S-Tab>'] = cmp.mapping(function(fallback)
--             if luasnip.jumpable(-1) then
--               luasnip.jump(-1)
--             else
--               fallback()
--             end
--           end, { 'i', 's' }),
--         }),
--         sources = cmp.config.sources({
--           { name = "nvim_lsp" }, --edited
--           { name = "luasnip" },  -- For luasnip users.
--           -- { name = "vsnip" },  -- For luasnip users.
--           { name = "buffer" },   --edited
--           { name = "path" },     --edited
--         }),
--       })
--     end,
--   }
-- }

-- NEW CONFIG FOR neovim 0.12
return {
  -- Motor de Snippets
  {
    "L3MON4D3/LuaSnip",
    lazy = true,
    dependencies = {
      "saadparwaiz1/cmp_luasnip",
      "rafamadriz/friendly-snippets",
    },
    config = function()
      require("luasnip.loaders.from_vscode").lazy_load()
      pcall(require, "user.snippets")
    end,
  },

  -- Motor de Completado Principal
  {
    "hrsh7th/nvim-cmp",
    event = "InsertEnter",
    dependencies = {
      "hrsh7th/cmp-nvim-lsp",
      "hrsh7th/cmp-buffer",
      "hrsh7th/cmp-path",
      "L3MON4D3/LuaSnip",
      "catppuccin", -- FORZAMOS que catppuccin sea una dependencia para que sus colores existan antes
    },
    config = function()
      local cmp = require("cmp")
      local luasnip = require("luasnip")

      -- Importa la lista desde el archivo externo
      local unicodes_list = require("unicode_icons")

      cmp.register_source("unicode", {
        complete = function(self, request, callback)
          local cursor_before_line = request.context.cursor_before_line
          local start_idx, end_idx, name_match = cursor_before_line:find("u:(%w*)$")

          if not start_idx then
            callback()
            return
          end

          local items = {}
          local search_lower = name_match:lower()
          local line = request.context.cursor.line
          local col = request.context.cursor.col

          -- Iteramos sobre la lista importada externamente
          for _, item in ipairs(unicodes_list) do
            local name_lower = item.name:lower()

            if search_lower == "" or name_lower:find(search_lower, 1, true) == 1 then
              table.insert(items, {
                label = "u:" .. item.name .. " " .. item.icon,
                kind = 11,
                textEdit = {
                  newText = item.icon,
                  range = {
                    start = { line = line, character = start_idx - 1 },
                    ["end"] = { line = line, character = col - 1 },
                  },
                },
              })
            end
          end

          callback({ items = items })
        end,
      })


      cmp.register_source("md_tags", {
        complete = function(self, request, callback)
          -- if vim.bo.filetype ~= "markdown" then
          --   callback()
          --   return
          -- end
          local before = request.context.cursor_before_line:match("@([%w_]*)$")
          if not before then
            callback()
            return
          end
          local tags = { "todo", "fix", "bug", "idea", "goal", "note", "warn",
            "info", "done", "onw", "desc", "test", "pending",
            "git", "tasks", "code", "snippet", "risk", "improve" }
          local items = {}
          for _, tag in ipairs(tags) do
            if tag:find(before, 1, true) == 1 then
              table.insert(items, { label = "@" .. tag, kind = 14 })
            end
          end
          callback({ items = items })
        end,
      })
      -- SOLUCIÓN DIRECTA: Forzar los colores Mocha para las ventanas flotantes de nvim-cmp
      -- Esto repara la pérdida de fondo en Neovim 0.12
      vim.api.nvim_set_hl(0, "CmpNormal", { link = "NormalFloat" })
      vim.api.nvim_set_hl(0, "CmpDocNormal", { link = "NormalFloat" })
      vim.api.nvim_set_hl(0, "CmpBorder", { link = "FloatBorder" })
      vim.api.nvim_set_hl(0, "CmpDocBorder", { link = "FloatBorder" })
      vim.api.nvim_set_hl(0, "CmpPmenu", { link = "Pmenu" })


      cmp.setup({
        snippet = {
          expand = function(args)
            luasnip.lsp_expand(args.body)
          end,
        },
        -- Configuración de ventanas con bordes y grupos de color explícitos
        window = {
          completion = cmp.config.window.bordered({
            winhighlight = "Normal:CmpNormal,CursorLine:PmenuSel,Search:None,FloatBorder:CmpBorder",
          }),
          documentation = cmp.config.window.bordered({
            winhighlight = "Normal:CmpDocNormal,FloatBorder:CmpDocBorder",
          }),
        },
        mapping = cmp.mapping.preset.insert({
          ["<C-d>"] = cmp.mapping.scroll_docs(-4),
          ["<C-u>"] = cmp.mapping.scroll_docs(4),
          ["<C-\\>"] = cmp.mapping.complete(),
          ["<C-e>"] = cmp.mapping.abort(),
          ["<C-o>"] = cmp.mapping.confirm({ select = true }),

          ["<Tab>"] = cmp.mapping(function(fallback)
            if luasnip.jumpable(1) then
              luasnip.jump(1)
            else
              fallback()
            end
          end, { "i", "s" }),

          ["<S-Tab>"] = cmp.mapping(function(fallback)
            if luasnip.jumpable(-1) then
              luasnip.jump(-1)
            else
              fallback()
            end
          end, { "i", "s" }),
        }),
        sources = cmp.config.sources({
          { name = "md_tags", trigger_characters = { "@" } },
          { name = "unicode", trigger_characters = { "u" } },
          { name = "nvim_lsp" },
          { name = "luasnip" },
          { name = "path" },
        }, {
          { name = "buffer" },
        }),
      })
    end,
  },
}
