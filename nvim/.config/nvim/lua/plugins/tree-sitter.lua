-- NEW CONFIG FOR neovim 0.12
return {
  "nvim-treesitter/nvim-treesitter",
  build = ":TSUpdate",
  lazy = false,
  config = function()
    local ensure_installed = {
      "go", "rust", "typescript", "javascript", "tsx",
      "html", "css", "json", "bash",
      "http", "dockerfile", "lua", "markdown", "markdown_inline",
      "python",
      "yaml",
      "graphql",
      "astro",
      "toml",
      "vim",
      "regex",
      "jsdoc",
    }

    require("nvim-treesitter").install(ensure_installed)

    vim.api.nvim_create_autocmd("FileType", {
      pattern = ensure_installed,
      callback = function(args)
        local lang = vim.treesitter.language.get_lang(vim.bo[args.buf].filetype)
        if lang then
          pcall(vim.treesitter.language.add, lang)
          pcall(vim.treesitter.start, args.buf, lang)
        end
      end,
    })
  end,
}

-- return {
--   "nvim-treesitter/nvim-treesitter",
--   build = ":TSUpdate",
--   lazy = false,
--   config = function()
--     -- NEW CONFIG FOR neovim 0.12
--     local treesitter = require("nvim-treesitter")
--
--     local ensure_installed = {
--       "go", "rust", "typescript", "javascript", "tsx",
--       "html", "css", "json", "bash",
--       "http", "dockerfile", "lua"
--     }
--
--     treesitter.install(ensure_installed)
--
--     vim.api.nvim_create_autocmd("FileType", {
--       pattern = ensure_installed,
--       callback = function(args)
--         local buf = args.buf
--         local ft = vim.bo[buf].filetype
--
--         local lang = vim.treesitter.language.get_lang(ft)
--         if not lang then
--           return
--         end
--
--         local ok_add = pcall(vim.treesitter.language.add, lang)
--         if not ok_add then
--           return
--         end
--
--         pcall(vim.treesitter.start, buf, lang)
--       end,
--     })
--   end,
-- }
