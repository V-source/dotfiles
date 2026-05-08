return {
  'rcarriga/nvim-notify',
  config = function()
    require('notify').setup({
      background_colour = '#000000',
      max_width = 60,
      timeout = 3000,

      render = "wrapped-compact",
      opacity = { body = 30 },
      -- stages = "fade",
      top_down = false
    })
  end,
}
