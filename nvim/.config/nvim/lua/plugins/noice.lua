return {
  'folke/noice.nvim',
  dependencies = {
    'rcarriga/nvim-notify',
    -- 'MunifTanjim/nui.nvim'
  },

  config = function ()
    require('noice').setup({
      lsp = {
        override ={
          ["vim.lsp.util.convert_input_to_markdown_lines"] = true,
          ["vim.lsp.util.stylize_markdown"] = true,
          ["cmp.entry.get_documentation"] = true,
        },
        signature = {
          enabled= false,
        },
      },
      presets = {
       -- bottom_serach = true,
        command_palette = true,
        long_message_to_split = true,
        lsp_doc_border = true,
        inc_rename = true,
      },

      filter = {
        event = "notify",
        find = "No information available"
      },
      opts = { skip = true}
    })
    vim.keymap.set('n', '<leader>ll', '<cmd>NoiceDismiss<CR>', {desc = 'Dismiss Noice Message'})
  end
}
