return {
  "shellRaining/hlchunk.nvim",
  event = { "BufReadPre", "BufNewFile" },
  config = function()
    require("hlchunk").setup({
      chunk = {
        enable = true,
        priority = 15,
        style = {
          -- { fg = "#806d9c" },
          { fg = "#a6e3a1" },
          { fg = "#f38ba8" },
        },
        use_treesitter = true,
        chars = {
          horizontal_line = "─",
          vertical_line = "│",
          left_top = "╭",
          left_bottom = "╰",
          right_arrow = ">",
        },
        textobject = "",
        max_file_size = 1024 * 1024,
        error_sign = true,
        -- animation related
        duration = 50,
        delay = 50,
      },

      line_num = {
        enable = true,
        style = "#a6e3a1",
      },
    })
  end
}
