return {
  {
    'akinsho/toggleterm.nvim',
    version = "*",

    config = function()
      require('toggleterm').setup({
        -- size = 20,
        size = function(term)
          if term.direction == "horizontal" then
            return 15
          elseif term.direction == "vertical" then
            return vim.o.columns * 0.4
          end
        end,
        open_mapping = [[<c-\>]],
        hide_numbers = true,
        shade_filetypes = {},
        shade_terminals = true,
        shading_factor = 2,
        start_in_insert = true,
        insert_mappings = true,
        persist_size = false,
        -- direction = "vertical",
        close_on_exit = true,
        shell = vim.o.shell,
        auto_scroll = true,
        float_opts = {
          border = "curved",
          title_pos = 'center',
          winblend = 0,
          highlights = {
            border = "Normal",
            background = "Normal",
          },
        },
      })
      function _G.set_terminal_keymaps()
        local opts = { buffer = 0 }
        vim.keymap.set('t', '<esc>', [[<C-\><C-n>]], opts)
        vim.keymap.set('t', '<C-h>', [[<Cmd>wincmd h<CR>]], opts)
        vim.keymap.set('t', '<C-j>', [[<Cmd>wincmd j<CR>]], opts)
        vim.keymap.set('t', '<C-k>', [[<Cmd>wincmd k<CR>]], opts)
        vim.keymap.set('t', '<C-l>', [[<Cmd>wincmd l<CR>]], opts)
        vim.keymap.set('t', '<C-w>', [[<C-\><C-n><C-w>]], opts)
      end

      function Lazygit_toggle()
        local Terminal = require('toggleterm.terminal').Terminal
        local yazi = Terminal:new({ cmd = "yazi", hidden = true })

        yazi:toggle()
      end

      function NewTerm()
        local Terminal = require('toggleterm.terminal').Terminal
        local ej = Terminal:new()

        ej:toggle()
      end
    end,

    -- Definición de la función Lazygit_toggle
    -- Configuración de mapeos de teclas
    -- vim.keymap.set('n', '<leader>ht', '<cmd>ToggleTerm direction=horizontal <cr>', {}),
    vim.keymap.set('n', '<leader>tl', '<cmd>ToggleTerm direction=vertical <cr>', {}),
    vim.keymap.set('n', '<leader>tf', '<cmd>ToggleTerm direction=float <cr>', {}),
    vim.keymap.set('n', '<leader>tt', '<cmd>ToggleTerm direction=tab <cr>', {}),
    vim.keymap.set('n', '<leader>tj', '<cmd>ToggleTerm direction=horizontal <cr>', {}),
    vim.keymap.set('t', '<esc>', [[<C-\><C-n>]], { desc = "Close terminal" }),
    vim.api.nvim_set_keymap("t", "<C-t>", "<cmd>lua NewTerm()<CR>", { noremap = true, silent = true }),
    vim.api.nvim_set_keymap("n", "<leader>tn", "<cmd>lua NewTerm()<CR>", { noremap = true, silent = true }),

    vim.cmd('autocmd! TermOpen term://* lua set_terminal_keymaps()')
  } }
