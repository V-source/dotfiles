return {
  'smjonas/inc-rename.nvim',
  cmd_name = 'IncRename',
  config = true,

  vim.keymap.set('n', '<leader>re', ':IncRename ')
}
