return {
  'folke/twilight.nvim',
  opts = {
    dimming = {
      -- alpha = 0.55,
      alpha = 0.35,
      color = {"normal", "#ffffff"},
      term_bg = "#000000",
      inactive = true,

    },
    context = 0,
    treesitter = true,
    expand = {
      "function",
      "method",
      "table",
      "if_statement",
    },
    exclude = {}
  },
  vim.keymap.set('n', 'Z', '<cmd>Twilight<CR>',{silent = true})
}
