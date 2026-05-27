return {
  "goolord/alpha-nvim",
  dependencies = { "echasnovski/mini.icons", 'nvim-lua/plenary.nvim', 'nvim-tree/nvim-web-devicons' },
  config = function()
    local alpha = require("alpha")
    local startify = require("alpha.themes.theta")

    -- Creamos el componente dinámico para los archivos recientes (MRU)
    -- Esto usa la lógica interna de startify para listar lo último que editaste
    local mru_component = {
      type = "group",
      val = function()
        return { startify.mru(0, vim.fn.getcwd()) }
      end,
    }

    startify.file_icons.provider = "devicons"
    -- Estructuramos el layout combinando tu texto y los archivos recientes
    startify.config.layout = {
      { type = "padding", val = 9 },

      -- 1. Tu bloque de citas personalizado
      {
        type = "text",
        val = {
          [[                                                                     ]],
          [[       ████ ██████           █████      ██                     ]],
          [[      ███████████             █████                             ]],
          [[      █████████ ███████████████████ ███   ███████████   ]],
          [[     █████████  ███    █████████████ █████ ██████████████   ]],
          [[    █████████ ██████████ █████████ █████ █████ ████ █████   ]],
          [[  ███████████ ███    ███ █████████ █████ █████ ████ █████  ]],
          [[ ██████  █████████████████████ ████ █████ █████ ████ ██████ ]],
          [[]],

          -- "",
          -- "",
          -- "  \"PIENSA EN FRÍO, ESCRIBE EN CALIENTE. UN PASO LÓGICO A LA VEZ DESARMA LA COMPLEJIDAD MÁS GRANDE.\" 󱆨 ",
          -- "  \"Y ESTA MISMA SE ATRIBUYE SU PROPIO TIEMPO\" 󱆨 ",
          -- "",
          -- "",
          -- "   Elvis Villegas",
          -- "",
          -- "  \"UN PROGRAMA ARMONIOSO SURGE CUANDO CADA MÓDULO CONOCE SU RESPONSABILIDAD Y RESPETA LA JERARQUÍA DEL SISTEMA.\"",
          -- "",
          -- "",
          -- [[ Elvis Villegas                                                        ]],
        },
        opts = {
          hl = "Normal",
          position = "center",
        },
      },

      { type = "padding", val = 1 },

      -- 2. Título decorativo para la sección de recientes
      {
        type = "text",
        val = "─ Archivos Recientes ──────────────────────────────────",
        -- opts = { hl = "SpecialComment", position = "center" },
        opts = { hl = "Comment", position = "center" },
      },

      { type = "padding", val = 1 },

      -- 3. Inyección de la lista dinámica de archivos
      mru_component,

      { type = "padding", val = 1 },
    }

    -- Inicialización con el layout combinado
    alpha.setup(startify.config)
  end,
}

--       -- [[                                                                       ]],
--       -- [[                                                                       ]],
--       -- [[                                                                       ]],
--       -- [[                                                                       ]],
--       -- [[                                                                     ]],
--       -- [[       ████ ██████           █████      ██                     ]],
--       -- [[      ███████████             █████                             ]],
--       -- [[      █████████ ███████████████████ ███   ███████████   ]],
--       -- [[     █████████  ███    █████████████ █████ ██████████████   ]],
--       -- [[    █████████ ██████████ █████████ █████ █████ ████ █████   ]],
--       -- [[  ███████████ ███    ███ █████████ █████ █████ ████ █████  ]],
--       -- [[ ██████  █████████████████████ ████ █████ █████ ████ ██████ ]],
--       [[]],
--       [[]],
--       [["PIENSA EN FRÍO, ESCRIBE EN CALIENTE. UN PASO LÓGICO A LA VEZ DESARMA LA COMPLEJIDAD MÁS GRANDE." 󱆨 ]],
--       [["Y ESTA MISMA SE ATRIBUYE SU PROPIO TIEMPO" 󱆨 ]],
--
--       [[ Elvis Villegas                                                        ]],
--
--
--       [["UN PROGRAMA ARMONIOSO SURGE CUANDO CADA MÓDULO CONOCE SU RESPONSABILIDAD Y RESPETA LA JERARQUÍA DEL SISTEMA."]],
--       [[]],
--       [[]],
--       [[]],
--       -- [[ 󱆨 ]],
--       -- [[]],
--       -- [["UN PROGRAMA ARMONIOSO SURGE CUANDO CADA MÓDULO CONOCE SU RESPONSABILIDAD Y RESPETA LA JERARQUÍA DEL SISTEMA."]],
--       -- [[]],
--       -- [["BUSCA LA ELEGANCIA ANTES QUE LA COMPLEJIDAD. EL CÓDIGO LIMPIO ES CÓDIGO PACÍFICO."]],
--       -- [[]],
--       -- [["LA RESPONSABILIDAD IDEAL ES ATÓMICA, AUTOCONTENIDA Y EXPLICABLE EN UNA FRASE SIMPLE."]],
