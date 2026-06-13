-- return {
-- "https://codeberg.org/ravnheim/project_notes",
-- name = "project_notes",
-- config = function()
--   require("project_notes").setup({
--     notes_path= ".notes",
--     -- notes_path = ".notes",
--     autosave = true,
--     extension = ".md",
--     sign = "󱞁 Note",
--     confirmation = true, -- confirm before deleting notes
--     highlight = {
--       -- fg = '#cdd6f4',
--       fg = '#fab387',
--       -- bg = "#BB1B47",
--       bg = '#1e1e2e',
--     },
--     keymaps = {
--       main = "<leader>nm",
--       toggle = "<leader>nt",
--       list = "<leader>nl",
--       delete = "<leader>nd",
--       delete_empty = "<leader>ne",
--       merged = "<leader>nmerge",
--     },
--   })
-- end
-- }

return {
  {
    "ravnheim/project_notes",
    -- Usamos la url directa de Codeberg ya que no está en GitHub por defecto
    url = "https://codeberg.org/ravnheim/project_notes",
    name = "project_notes",
    -- El plugin solo se cargará cuando presiones cualquiera de estas combinaciones
    keys = {
      { "<leader>nm", desc = "Project Notes: Main" },
      { "<leader>nt", desc = "Project Notes: Toggle" },
      { "<leader>nl", desc = "Project Notes: List All" },
      { "<leader>nd", desc = "Project Notes: Delete Current" },
    },
    opts = {
      notes_path = ".notes",
      autosave = true,     -- Guarda la nota automáticamente al cerrar la ventana flotante
      extension = ".md",   -- Formato Markdown (puedes usar sintaxis estándar)
      sign = "󱞁 Note",
      confirmation = true, -- Pide confirmación en la línea de comandos antes de borrar

      -- Colores adaptados para integrarse con Catppuccin Mocha
      highlight = {
        bg = "#BB1B47", -- Color Durazno para el texto/bordes de la nota
        -- bg = "#1e1e2e", -- Fondo oscuro idéntico a tu terminal
        fg = "#fefefe", -- Fondo oscuro idéntico a tu terminal
      },

      -- Mapeos internos del plugin
      keymaps = {
        main = "<leader>nm",   -- Abre el panel principal de notas del proyecto
        toggle = "<leader>nt", -- Abre/Cierra una nota flotante vinculada al archivo actual
        list = "<leader>nl",   -- Lista todas las notas creadas en este proyecto
        delete = "<leader>nd", -- Elimina la nota actual
        delete_empty = "<leader>ne",
        merged = "<leader>nmerge",
      },
    },
    config = function(_, opts)
      require("project_notes").setup(opts)
    end,
  },
}
