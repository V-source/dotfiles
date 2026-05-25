-- return {
--   "neph-iap/easycolor.nvim",
--   dependencies = { "stevearc/dressing.nvim" }, -- Optional, but provides better UI for editing the formatting template
--   opts = {},
--   keys = { { "<leader>cp", "<cmd>EasyColor<cr>", desc = "Color Picker" } }
-- }


return {
  {
    "uga-rosa/ccc.nvim",
    cmd = { "CccPick", "CccConvert", "CccHighlighterToggle" },
    keys = {
      -- <leader>cp abre el panel interactivo sobre el color actual
      { "<leader>cp", "<cmd>CccPick<cr>", desc = "Color Picker (Shades & Gradients)" },
      -- <leader>cc convierte el color bajo el cursor a otro formato (HEX -> HSL -> RGB)
      { "<leader>cc", "<cmd>CccConvert<cr>", desc = "Convert Color Format" },
    },
    opts = function()
      local ccc = require("ccc")
      
      return {
        -- Formato de salida por defecto al guardar
        default_output = ccc.output.hex,
        
        -- Muestra de forma simultánea múltiples espacios de color para máxima flexibilidad
        pickers = {
          ccc.picker.hex,     -- Permite leer y escribir #RRGGBB
          ccc.picker.css_rgb, -- Permite leer y escribir rgb()
          ccc.picker.css_hsl, -- Permite leer y escribir hsl()
        },
        
        -- Define qué barras dinámicas de tonos quieres ver en la ventana flotante
        -- HSL es superior para buscar tonos (Ajustas Tono, Saturación y Brillo fácilmente)
        inputs = {
          ccc.input.hsl,
          ccc.input.rgb,
        },
        
        -- Habilitar el resaltado de colores directamente en el buffer (Alternativa ultra rápida a colorizer)
        highlighter = {
          auto_enable = true,
          lsp = true, -- Si tu LSP de CSS o Astro detecta colores, ccc los pinta en el editor
        },
      }
    end,
    config = function(_, opts)
      require("ccc").setup(opts)
    end,
  },
}
