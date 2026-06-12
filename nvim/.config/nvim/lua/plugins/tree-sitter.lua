return {
  "nvim-treesitter/nvim-treesitter",
  build = ":TSUpdate",
  lazy = false,
  config = function()
    -- 1. Forzamos a Neovim a añadir los parsers al runtimepath manualmente 
    -- por si Lazy se marea con las rutas en la v0.12
    local ts_path = vim.fn.stdpath("data") .. "/lazy/nvim-treesitter"
    vim.opt.runtimepath:append(ts_path)

    -- 2. Configuración nativa de Neovim 0.12 para inyecciones y resaltado
    -- Ya no llamamos a nvim-treesitter.configs.setup()
    vim.g.markdown_fenced_languages = {
      "javascript",
      "js=javascript",
      "lua",
      "astro",
      "html",
      "css"
    }

    -- Activar el resaltado nativo de Treesitter por buffer al cargar un archivo
    vim.api.nvim_create_autocmd({ "FileType", "BufEnter" }, {
      callback = function()
        local buf = vim.api.nvim_get_current_buf()
        local ft = vim.bo[buf].filetype
        
        -- Intentamos activar Treesitter de forma nativa si el parser está disponible
        local lang = vim.treesitter.language.get_lang(ft) or ft
        local has_parser, _ = pcall(vim.treesitter.get_parser, buf, lang)
        
        if has_parser then
          pcall(vim.treesitter.start, buf, lang)
        end
      end,
    })

    -- ╭─────────────────────────────────────────────────────────╮
    -- │                 FILETYPES & REGISTERS                   │
    -- ╰─────────────────────────────────────────────────────────╯

    vim.filetype.add({
      extension = {
        astro = "astro",
        mdx = "markdown", -- Mapeo directo a nivel de archivo
      }
    })
    
    -- Compatibilidad nativa de lenguaje en v0.12
    pcall(function()
      vim.treesitter.language.register("markdown", "mdx")
    end)
  end,
}
