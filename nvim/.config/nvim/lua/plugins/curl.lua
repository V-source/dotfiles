return {
  "oysandvik94/curl.nvim",
  cmd = { "CurlOpen" },
  dependencies = {
    "nvim-lua/plenary.nvim",
  },
--   config = function()
--     -- require("curl").setup({})
--     local curl = require("curl")
--     curl.setup({})
--
-- --     vim.keymap.set("n", "<leader>cc", function()
-- --       curl.open_curl_tab()
-- --     end, { desc = "Open a curl tab scoped to the current working directory" })
-- -- vim.keymap.set("n", "<leader>fsc", function()
-- --       curl.pick_scoped_collection()
-- -- end, { desc = "Choose a scoped collection and open it" })
--     --
--   end,
  config= true,

    vim.keymap.set("n", "<leader>csc", function()
    local curl = require('curl')
      -- curl.open_global_collection()

    curl.create_scoped_collection()
    end, { desc = "Create or open a global collection with a name from user input" }),
  
vim.keymap.set("n", "<leader> pc", function()
    local curl = require('curl')
      curl.pick_scoped_collection()
end, { desc = "Choose a scoped collection and open it" }),


  vim.keymap.set('n', '<leader>hh', '<cmd>CurlOpen<CR>', {}),
  -- vim.keymap.set('n', '<leader>HH', '<cmd>CurlClose<CR>', {}),
  --   vim.keymap.set("n", "<leader>mm", curl.create_scoped_collection() { desc = "Create or open a global collection with a name from user input" })
}

