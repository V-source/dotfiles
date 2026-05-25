return {
  {
    "folke/trouble.nvim",
    -- Reemplazamos la dependencia antigua por mini.icons para mantener la coherencia de tu entorno
    dependencies = { "echasnovski/mini.icons" },
    cmd = "Trouble",
    keys = {
      {
        "<leader>xX",
        "<cmd>Trouble diagnostics toggle focus=true<cr>",
        desc = "Diagnostics (Trouble)",
      },
      {
        "<leader>xx",
        "<cmd>Trouble diagnostics toggle filter.buf=0<cr>",
        desc = "Buffer Diagnostics (Trouble)",
      },
      {
        "<leader>xL",
        "<cmd>Trouble qflist toggle focus=true<cr>",
        desc = "Quickfix List (Trouble)",
      },
      {
        "<leader>cl",
        "<cmd>Trouble lsp_document_symbols toggle focus=true win.position=right<cr>",
        desc = "LSP Document Symbols (Trouble)",
      },
      {
        "<leader>cI",
        "<cmd>Trouble lsp_implementations toggle focus=true<cr>",
        desc = "LSP Implementations (Trouble)",
      },
      {
        "<leader>cs",
        "<cmd>Trouble symbols toggle focus=true win.position=right<cr>",
        desc = "Symbols Structure (Trouble)",
      },
      {
        "gR",
        "<cmd>Trouble lsp_references toggle focus=true<cr>",
        desc = "LSP References (Trouble)",
      },
    },
    opts = {
      -- Configuraciones de UI por defecto estables
      auto_close = false, -- No cierra el panel automáticamente si solucionas el último error
      auto_preview = true, -- Muestra una vista previa del código al moverte por la lista de errores
      restore = true, -- Restaura la ventana de la lista si vuelves a abrir el editor
    },
  },
}
