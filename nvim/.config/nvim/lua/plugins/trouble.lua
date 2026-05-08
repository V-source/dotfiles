return {
  "folke/trouble.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  opts = {
    use_diagnostic_signs = true,
    -- your configuration comes here
    -- or leave it empty to use the default settings
    -- refer to the configuration section below
    -- Lua
    -- vim.keymap.set("n", "<leader>xx", function() require("trouble").toggle() end),
    -- vim.keymap.set("n", "<leader>xw", function() require("trouble").toggle("workspace_diagnostics") end),
    -- vim.keymap.set("n", "<leader>xd", function() require("trouble").toggle("document_diagnostics") end),
    -- vim.keymap.set("n", "<leader>xq", function() require("trouble").toggle("quickfix") end),
    -- vim.keymap.set("n", "<leader>xl", function() require("trouble").toggle("loclist") end),
    vim.keymap.set("n", "gR", function() require("trouble").toggle("lsp_references") end)
  },
  keys = {
    r = "refresh",
    R = "toggle_refresh",
    {
      "<leader>xX",
      "<cmd>Trouble diagnostics toggle focus=true<cr>",
      desc = "Diagnostics (Trouble)",
    },
    {
      "<leader>xx",
      "<cmd>Trouble diagnostics toggle filter.buf=0<cr>",
      desc = "Buffer Diagnostics (Trouble)",
    },
    {
      "<leader>xL",
      -- "<cmd>Trouble qflist toggle focus=true win.relative=win win.position=right<cr>",
      "<cmd>Trouble qflist toggle focus=true<cr>",
      desc = "Quickfix List (Trouble)",
    },
    {
      "<leader>cl",
      "<cmd>Trouble lsp_document_symbols toggle focus=false win.position=right<cr>",
      desc = "LSP Definitions / references / ... (Trouble)",
    },
    {
      "<leader>cI",
      "<cmd>Trouble lsp_implementations<cr>",
      desc = "LSP Definitions / references / ... (Trouble)",
    },
    {
      "<leader>cS",
      "<cmd>Trouble symbols toggle focus=true<cr>",
      desc = "Symbols (Trouble)",
    },

    {
      "<leader>xQ",
      "<cmd>Trouble qflist toggle<cr>",
      desc = "Quickfix List (Trouble)",
    },


  }

}
