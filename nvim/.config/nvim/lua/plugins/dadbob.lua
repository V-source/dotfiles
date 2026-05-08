return {
  -- DB MANAGER
  {
    'tpope/vim-dadbod',
    opt = true,
    requires = {
      'kristijanhusak/vim-dadbod-ui',
      'kristijanhusak/vim-dadbod-completion',
    },
  },
  -- UI
  {
    'kristijanhusak/vim-dadbod-ui',
    run = function()
      -- Tu configuración de DBUI aquí
      vim.g.db_ui_use_nerd_fonts =  1
    end,
    ft = {'sql', 'mysql', 'plsql', 'db', 'mongo'},
    cmd = {
      'DBUI',
      'DBUIToggle',
      'DBUIAddConnection',
      'DBUIFindBuffer',
    },
  },
  -- AUTOCOMPLETIONS
  'kristijanhusak/vim-dadbod-completion',

  vim.keymap.set('n', '<leader>db', '<cmd>DBUIToggle<CR>', {})
}
