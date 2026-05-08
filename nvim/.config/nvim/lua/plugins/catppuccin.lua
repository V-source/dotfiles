-- catpuccin (tema)
return {
  "catppuccin/nvim",
  lazy = false,
  name = "catppuccin",
  priority = 1000,
  config = function()
    require("catppuccin").setup({
      flavour = 'mocha',
      transparent_background = true,
      term_colors = true,
      show_end_of_buffer = false,
      dim_inactive = {
        enabled = false,
        shade = 'dark',
        percentage = 0.15,
      },
      highlight_overrides = {
        mocha = function(mocha)
          return {
            LineNr = { fg = "#ababab", bg = mocha.latte }

          }
        end
      }


    })
    --    vim.g.catppuccin_flavour = "mocha"
    vim.cmd('colorscheme catppuccin')
  end
}
