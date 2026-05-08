return {
  "goolord/alpha-nvim",
  dependencies = {
    "nvim-tree/nvim-web-devicons",
  },

  config = function()
    local alpha = require("alpha")
    local dashboard = require("alpha.themes.startify")

    dashboard.section.header.val = {
      -- [[                                                                       ]],
      -- [[                                                                       ]],
      -- [[                                                                       ]],
      -- [[                                                                       ]],
      -- [[                                                                     ]],
      -- [[       ████ ██████           █████      ██                     ]],
      -- [[      ███████████             █████                             ]],
      -- [[      █████████ ███████████████████ ███   ███████████   ]],
      -- [[     █████████  ███    █████████████ █████ ██████████████   ]],
      -- [[    █████████ ██████████ █████████ █████ █████ ████ █████   ]],
      -- [[  ███████████ ███    ███ █████████ █████ █████ ████ █████  ]],
      -- [[ ██████  █████████████████████ ████ █████ █████ ████ ██████ ]],
      [[]],

      -- [[     ___ _____   ]],
      -- [[    |_  /  ___|  ]],
      -- [[      | \ `--.   ]],
      -- [[      | |`--. \  ]],
      -- [[  /\__/ /\__/ /  ]],
      -- [[  \____/\____/ DEV.  ]],
      [[]],
      [["PIENSA EN FRÍO, ESCRIBE EN CALIENTE. UN PASO LÓGICO A LA VEZ DESARMA LA COMPLEJIDAD MÁS GRANDE." 󱆨 ]],
      [["Y ESTA MISMA SE ATRIBUYE SU PROPIO TIEMPO" 󱆨 ]],

      [[ Elvis Villegas                                                        ]],
      [[]],
      [[]],
      [[]],
      [[]],
      [[]],
      [[]],
      -- [[ 󱆨 ]],
      -- [[]],
      -- [["UN PROGRAMA ARMONIOSO SURGE CUANDO CADA MÓDULO CONOCE SU RESPONSABILIDAD Y RESPETA LA JERARQUÍA DEL SISTEMA."]],
      -- [[]],
      -- [["BUSCA LA ELEGANCIA ANTES QUE LA COMPLEJIDAD. EL CÓDIGO LIMPIO ES CÓDIGO PACÍFICO."]],
      -- [[]],
      -- [["LA RESPONSABILIDAD IDEAL ES ATÓMICA, AUTOCONTENIDA Y EXPLICABLE EN UNA FRASE SIMPLE."]],

    }
    alpha.setup(dashboard.opts)
  end,
}
