-- -- catpuccin (tema)
-- return {
--   "catppuccin/nvim",
--   lazy = false,
--   name = "catppuccin",
--   priority = 1000,
--   config = function()
--     require("catppuccin").setup({
--       flavour = 'mocha',
--       transparent_background = true,
--       term_colors = true,
--       show_end_of_buffer = false,
--       dim_inactive = {
--         enabled = false,
--         shade = 'dark',
--         percentage = 0.15,
--       },
--       highlight_overrides = {
--         mocha = function(mocha)
--           return {
--             LineNr = { fg = "#ababab", bg = mocha.latte }
--
--           }
--         end
--       },
--       lsp_styles = { -- Handles the style of specific lsp hl groups (see `:h lsp-highlight`).
--         virtual_text = {
--           errors = { "italic" },
--           hints = { "italic" },
--           warnings = { "italic" },
--           information = { "italic" },
--           ok = { "italic" },
--         },
--         underlines = {
--           errors = { "underline" },
--           hints = { "underline" },
--           warnings = { "underline" },
--           information = { "underline" },
--           ok = { "underline" },
--         },
--         inlay_hints = {
--           background = true,
--         },
--       },
--
--
--     })
--     --    vim.g.catppuccin_flavour = "mocha"
--     vim.cmd('colorscheme catppuccin')
--   end
-- }


-- catpuccin (Matrix Smooth Contrast Mod)
return {
  "catppuccin/nvim",
  lazy = false,
  name = "catppuccin",
  priority = 1000,
  config = function()
    require("catppuccin").setup({
      flavour = 'mocha',
      transparent_background = true, -- Falso para mantener el fondo suave unificado
      term_colors = true,
      show_end_of_buffer = false,
      dim_inactive = {
        enabled = true,
        shade = 'dark',
        percentage = 0.15,
      },
      -- 1. Paleta de colores suavizada estilo The-Matrix.nvim
      color_overrides = {
        mocha = {
          base = "#0D1117",   -- Fondo suavizado (Grafito oscuro con tinte Matrix)
          mantle = "#090D12", -- Fondo de paneles secundarios
          crust = "#05080C",  -- Bordes e interfaces de fondo
          text = "#22DA6E",   -- Texto normal (Verde digital suave, muy legible)
          subtext1 = "#4AE28A",
          subtext0 = "#6BECA4",
          overlay2 = "#1A8A47",
          overlay1 = "#156E39",
          overlay0 = "#6B7080", -- Comentarios (Gris neutro)
          surface2 = "#0E3A1A",
          surface1 = "#0A2912",
          surface0 = "#071D0D",

          -- Rangos y acentos de sintaxis controlados (Sin brillos neón molestos)
          green = "#00FF66", -- Funciones y elementos clave (Verde eléctrico controlado)
          teal = "#33CC77",
          blue = "#1DB954",
          sapphire = "#1AA34A",
          sky = "#55FF99",
          lavender = "#99FFBB",

          -- Alertas integradas a la paleta pero distinguibles
          red = "#D64545",
          maroon = "#A63232",
          peach = "#E6A122",
          yellow = "#C2D625",
          mauve = "#22DA88",
          pink = "#1AD161",
        },
      },
      -- 2. Ajustes específicos de opacidad e interfaz gráfica
      highlight_overrides = {
        mocha = function(mocha)
          return {
            -- Números de línea integrados al fondo suave
            LineNr = { fg = "#1A6E39", bg = "#0D1117" },
            CursorLineNr = { fg = "#00FF66", bg = "#0E2416", bold = true },

            -- Resaltados de línea y selección sutiles
            CursorLine = { bg = "#0E2416" },
            Visual = { bg = "#0E4D24", fg = "#55FF99" },

            -- Comentarios en gris con itálica
            Comment = { fg = "#6B7080", italic = true },

            -- Menús flotantes (LSP / Autocompletado) y divisiones estéticas
            FloatBorder = { fg = "#1A8A47", bg = "#0D1117" },
            VertSplit = { fg = "#0A2912" },
            WinSeparator = { fg = "#0A2912" },
          }
        end
      },
      lsp_styles = {
        virtual_text = {
          errors = { "italic" },
          hints = { "italic" },
          warnings = { "italic" },
          information = { "italic" },
          ok = { "italic" },
        },
        underlines = {
          errors = { "underline" },
          hints = { "underline" },
          warnings = { "underline" },
          information = { "underline" },
          ok = { "underline" },
        },
        inlay_hints = {
          background = true,
        },
      },
    })
    vim.cmd('colorscheme catppuccin')
  end
}


-- catppuccin (Matrix Ambient · Zero Fatigue)
-- return {
--   "catppuccin/nvim",
--   lazy = false,
--   name = "catppuccin",
--   priority = 1000,
--   config = function()
--     require("catppuccin").setup({
--       flavour = 'mocha',
--       transparent_background = true,
--       term_colors = true,
--       show_end_of_buffer = false,
--       dim_inactive = {
--         enabled = true,
--         shade = 'dark',
--         percentage = 0.15,
--       },
--       color_overrides = {
--         mocha = {
--           base = "#0D1117",
--           mantle = "#090C12",
--           crust = "#05080C",
--
--           text = "#C9DCC9",
--           subtext1 = "#A7C2A7",
--           subtext0 = "#85A885",
--
--           overlay2 = "#4E8059",
--           overlay1 = "#3D6947",
--           overlay0 = "#2A5230",
--
--           surface2 = "#213C27",
--           surface1 = "#1A2F1F",
--           surface0 = "#132117",
--
--           green = "#00FF6A",
--           teal = "#34D37A",
--           blue = "#5B9BD5",
--           sapphire = "#4A8FC7",
--           sky = "#7FDBAA",
--           lavender = "#A8E6CF",
--
--           red = "#D47C7C",
--           maroon = "#B85555",
--           peach = "#D4A55A",
--           yellow = "#B8BD5E",
--           mauve = "#6BBF8A",
--           pink = "#5FD9A0",
--         },
--       },
--       highlight_overrides = {
--         mocha = function(mocha)
--           return {
--             LineNr = { fg = "#2A5A2A", bg = "#0D1117" },
--             CursorLineNr = { fg = "#00FF6A", bg = "#102610", bold = true },
--             CursorLine = { bg = "#102610" },
--             Visual = { bg = "#1A4422", fg = "#C9DCC9" },
--             Comment = { fg = "#4A7A4A", italic = true },
--             FloatBorder = { fg = "#3D6947", bg = "#0D1117" },
--             VertSplit = { fg = "#1A2F1F" },
--             WinSeparator = { fg = "#1A2F1F" },
--           }
--         end
--       },
--       lsp_styles = {
--         virtual_text = {
--           errors = { "italic" },
--           hints = { "italic" },
--           warnings = { "italic" },
--           information = { "italic" },
--           ok = { "italic" },
--         },
--         underlines = {
--           errors = { "underline" },
--           hints = { "underline" },
--           warnings = { "underline" },
--           information = { "underline" },
--           ok = { "underline" },
--         },
--         inlay_hints = {
--           background = true,
--         },
--       },
--     })
--     vim.cmd('colorscheme catppuccin')
--   end
-- }
