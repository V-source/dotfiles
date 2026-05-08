return {
  "nvim-treesitter/nvim-treesitter",
  build = ":TSUpdate",
  lazy = false,
  config = function()
    local config = require("nvim-treesitter.configs")
    config.setup({
      auto_install = true,
      highlight = { enable = true },
      indent = { enable = true },
    })
  end,

  vim.filetype.add({
    extension = {
      astro = "astro"
    }
  }),
vim.treesitter.language.register("markdown", "mdx")
}
