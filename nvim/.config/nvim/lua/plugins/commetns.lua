return {
  {
    'numToStr/Comment.nvim',
    dependencies = {
      'JoosepAlviste/nvim-ts-context-commentstring',
    },
    config = function()
      require('ts_context_commentstring').setup {
        enable_autocmd = false,
      }

      require('Comment').setup {
        pre_hook = require('ts_context_commentstring.integrations.comment_nvim').create_pre_hook(),
      }
    end,
  },
  {
    "LudoPinelli/comment-box.nvim",
    config = function()
      -- Corrección: Se elimina la llamada duplicada y se deja un único setup consolidado
      require('comment-box').setup({
        comment_style = "line",
        line_width = 60,
        lines = {
          line = ".",
          line_start = "",
          line_end = "",
          title_left = "",
          title_right = "",
        },
        borders = {},
        outer_blank_lines_above = false,
        outer_blank_lines_below = false,
        inner_blank_lines = false,
        line_blank_line_above = false,
        line_blank_line_below = false,
        box_width = 60,
      })

      local keymap = vim.keymap.set
      local opts = { noremap = true, silent = true }

      -- Mapeos de títulos
      -- keymap({ "n", "v" }, "<Leader>cb", "<Cmd>CBllbox 18<CR>", opts)
      -- keymap({ "n", "v" }, '<Leader>cbc', ':<C-U>execute "CBlcbox " . v:count<CR>', opts)
      -- keymap({ "n", "v" }, '<Leader>cbl', ':<C-U>execute "CBllbox " . v:count<CR>', opts)
      -- keymap({ 'n', 'v' }, '<Leader>cblc', ':<C-U>execute "CBllbox " . v:count<CR>', opts)
      -- keymap({ 'n', 'v' }, '<Leader>cbr', ':<C-U>execute "CBrrbox " . v:count<CR>', opts)

      -- Partes nombradas
      -- keymap({ "n", "v" }, "<Leader>ct", ':<C-U>execute "CBclline " . v:count<CR>', opts)
      -- keymap({ "n", "v" }, "<Leader>ctr", ':<C-U>execute "CBrrline " . v:count<CR>', opts)
      -- keymap({ "n", "v" }, "<Leader>ctc", ':<C-U>execute "CBccline " . v:count<CR>', opts)

      -- Línea simple
      keymap({ "i", "n" }, "<M-n>", "<Cmd>CBllline<CR>", opts)

      -- Comentarios marcados y borrado
      -- keymap({ "n", "v" }, "<Leader>cm", "<Cmd>CBllbox14<CR>", opts)
      -- keymap({ "n", "v" }, "<Leader>cd", "<Cmd>CBd<CR>", opts)
      keymap({ "n", "v", "i" }, "<M-m>", "<Cmd>CBd<CR>", opts)
    end
  },
}
