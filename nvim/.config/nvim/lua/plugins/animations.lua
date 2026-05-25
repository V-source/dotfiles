return {
  -- 1. SCROLL SUAVE (WHISK)
  {
    "josstei/whisk.nvim",
    event = "WinScrolled", -- Carga perezosa: solo se activa cuando empiezas a scrollear
    opts = {
      cursor = {
        duration = 350,
        easing = "ease-out",
        enabled = false, -- Desactivado para no colisionar con smear-cursor
      },
      scroll = {
        duration = 350,
        easing = "ease-out",
        enabled = true,
      },
      keymaps = {
        cursor = false,
        scroll = true,
      },
      performance = { enabled = true },
    },
    config = function(_, opts)
      require("whisk").setup(opts)
    end,
  },

  -- 2. ANIMACIÓN DEL CURSOR (SMEAR-CURSOR)
  {
    "sphamba/smear-cursor.nvim",
    event = "VeryLazy", -- Se carga en segundo plano tras el arranque inicial
    opts = {
      smear_between_buffers = true,
      smear_between_neighbor_lines = true,
      
      -- CRÍTICO: Mantiene la estela vinculada al texto del buffer mientras 
      -- Whisk realiza el desplazamiento animado de la pantalla
      scroll_buffer_space = true,
      
      legacy_computing_symbols_support = false,
      smear_insert_mode = true,
      smear_terminal_mode = true,
    },
  },
}
