-- return {
--   -- DB MANAGER
--   {
--     'tpope/vim-dadbod',
--     opt = true,
--     requires = {
--       'kristijanhusak/vim-dadbod-ui',
--       'kristijanhusak/vim-dadbod-completion',
--     },
--   },
--   -- UI
--   {
--     'kristijanhusak/vim-dadbod-ui',
--     run = function()
--       -- Tu configuración de DBUI aquí
--       vim.g.db_ui_use_nerd_fonts =  1
--     end,
--     ft = {'sql', 'mysql', 'plsql', 'db', 'mongo'},
--     cmd = {
--       'DBUI',
--       'DBUIToggle',
--       'DBUIAddConnection',
--       'DBUIFindBuffer',
--     },
--   },
--   -- AUTOCOMPLETIONS
--   'kristijanhusak/vim-dadbod-completion',
--
--   vim.keymap.set('n', '<leader>db', '<cmd>DBUIToggle<CR>', {})
-- }

return {
  {
    "tpope/vim-dadbod",
    cmd = { "DB", "DBUI" },
    lazy = true,
  },
  {
    "kristijanhusak/vim-dadbod-ui",
    cmd = { "DBUI", "DBUIToggle", "DBUIAddConnection", "DBUIFindBuffer" },
    dependencies = {
      "tpope/vim-dadbod",
      { "kristijanhusak/vim-dadbod-completion", ft = { "sql", "mysql", "plsql" } },
    },
    keys = {
      { "<leader>db", "<cmd>DBUIToggle<CR>", desc = "Database UI Toggle" },
    },
    init = function()
      -- Las variables globales (vim.g) de Dadbod deben cargarse en init, ANTES de que el plugin levante
      vim.g.db_ui_use_nerd_fonts = 1
      vim.g.db_ui_show_database_navigation = 1
      vim.g.db_ui_save_location = vim.fn.stdpath("data") .. "/db_ui"
    end,
  },
}
