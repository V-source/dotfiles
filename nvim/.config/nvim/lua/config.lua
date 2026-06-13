--
--
--
--
-- esto no toma efecto debido a que la terminal es la que determina el tipo de futen y el tamaño
--
-- vim.opt.guifont = {"FiraCode Nerd Font", ":h18"}
-- cursor vertical
vim.cmd [[
 let &t_SI = "\e[5 q"
 let &t_EI = "\e[2 q"
]]
-- vim.api.nvim_command('set commentstring=//%s')
-- vim.bo.commentstring = '// %s'
---------------------------------------------
vim.o.sessionoptions = "blank,buffers,curdir,folds,help,tabpages,winsize,winpos,terminal,localoptions"
-- vim.opt.wrap = false
vim.opt.incsearch = true
vim.opt.clipboard = 'unnamedplus'
vim.opt.smartcase = true
vim.opt.smartindent = true
vim.opt.signcolumn = 'yes'
-- vim.opt.updatetime = 100
vim.opt.showcmd = false
vim.opt.splitbelow = true
vim.opt.splitright = true
vim.cmd("set expandtab")
vim.cmd("set shiftwidth=2")
vim.cmd("set tabstop=2")
vim.cmd("set softtabstop=2")
vim.cmd("set cursorline")
vim.cmd("set cursorcolumn")
vim.cmd("set number relativenumber")
vim.cmd("set encoding=utf-8")
vim.cmd("set autoindent")
vim.cmd("syntax on")
vim.cmd("set wildmenu")
vim.cmd("set wildmode=list:longest")
vim.cmd("set guioptions-=m")
vim.cmd("let &t_ut=''")
vim.cmd("set nobackup")
vim.cmd("set nowritebackup")
vim.cmd("set noswapfile")
vim.g.codeium_disable_bindings = 1
-- vim.cmd("set nofoldenable")
-- vim.opt.foldmethod = "expr"
-- vim.opt.foldexpr = "v:lua.vim.treesitter.foldexpr()"
-- vim.opt.foldcolumn = "0"

-- vim.cmd("set lazyredraw")
vim.cmd("set ttyfast")
--
vim.o.winblend = 0 -- works perfect for noice and notify
vim.o.pumblend = 0 -- works perfect for autocompletion width noice and notify
vim.g.mapleader = " "
vim.opt.termguicolors = true
-- nuevo 06-06=2025
vim.opt.fillchars = {
  vert = '│',
  stlnc = '─',
}
vim.opt.foldclose = "all"
vim.opt.foldmethod = "indent"
vim.cmd("set foldlevel=99")
vim.opt.foldtext = ""
----------------------------------------------
vim.opt.termguicolors = true
----------------------------------------------
local keymap = vim.keymap
local opts = { noremap = true, silent = true }

-- select all
keymap.set("n", "<C-a>", "gg<S-v>G", opts)
keymap.set("n", "<leader>aa", "gg<S-v>G", opts)

-- new tab
keymap.set("n", "te", ":tabedit ", opts)
-- keymap.set("n", "<C><Tab>", ":tabnext<Return>", opts)
-- keymap.set("n", "<C><S-Tab>", ":tabprev<Return>", opts)

-- split window
keymap.set("n", "<leader>sh", ":split<Return>", opts)
keymap.set("n", "<leader>sv", ":vspli<Return>", opts)
keymap.set("n", "<leader>sx", "<cmd>close<CR>", opts)

-- select window
keymap.set("n", "<C-h>", "<C-w>h")
keymap.set("n", "<C-l>", "<C-w>l")
keymap.set("n", "<C-j>", "<C-w>j")
keymap.set("n", "<C-k>", "<C-w>k")
keymap.set("n", "<C-w>H", "<C-w> H")

-- resize window
keymap.set("n", "<S-h>", "<C-w><")
keymap.set("n", "<S-l>", "<C-w>>")
keymap.set("n", "<S-j>", "<C-w>-")
keymap.set("n", "<S-k>", "<C-w>+")

-- arrastrar un caracter hacia la derecha
-- keymap.set("i", "<C-t>", "<Esc>xpa", opts)
keymap.set("i", "<C-l>", "<Esc>xpa", opts)
keymap.set("i", "<C-h>", "<Esc>xhhpa", opts)
-- abcdefghijklmnop

-- nueva line en modo edicion
keymap.set("i", "<C-K>", "<Esc>O", opts) -- hacia arribaA
keymap.set("i", "<C-J>", "<Esc>o", opts) -- hacia abajo

-- mover linea hacia arribay abajo
keymap.set({ "i" }, "<A-k>", '<Esc> :m-2 <CR>i', opts)
keymap.set({ "i" }, "<A-j>", '<Esc> :m+1 <CR>i', opts)
keymap.set({ 'n' }, "<A-k>", '<Esc> :m-2 <CR>', opts)
keymap.set({ 'n' }, "<A-j>", '<Esc> :m+1 <CR>', opts)

-- guardar cambios
-- keymap.set({ "i", "n" }, "<C-s>", "<Esc>:w<CR>", opts)  -- un archivo
keymap.set({ "i", "n", "v" }, "<A-CR>", "<Esc>:w<CR>", opts) -- un archivo
-- keymap.set("n", "<A-;>", "<Esc>:wa<CR>", opts) -- todos los archivos
keymap.set("n", "<S-s>", "<Esc>:wa<CR>", opts)               -- todos los archivos

-- salir del modo insert (por defecto)
-- <A-l/j/h/k/> \\ <A-l> es la mejor opcion
-- Borra el texto y lo descarta (no afecta el registro).
vim.keymap.set({ 'n', 'v' }, 'd', '"_d', { noremap = true })
vim.keymap.set({ 'n', 'v' }, 'D', '"_D', { noremap = true })
-- Borra el texto y lo descarta (no afecta el registro de pegado).
vim.keymap.set({ 'n', 'v' }, 'c', '"_c', { noremap = true })
vim.keymap.set({ 'n', 'v' }, 'C', '"_C', { noremap = true })


vim.keymap.set({ 'n', 'v' }, '<leader>fc', ":foldclose<CR>", opts)
vim.keymap.set({ 'n', 'v' }, '<leader>fo', ":foldopen<CR>", opts)

vim.keymap.set({ 'n' }, 'qq', ":q<CR>", opts)
vim.keymap.set({ 'n' }, 'QQ', ":qall<CR>", opts)
vim.keymap.set({ 'n' }, '<leader>wa', ":wa<CR>", opts)
vim.keymap.set({ 'n' }, '<leader>wqa', ":wqa<CR>", opts)
-- vim.keymap.set({ 'n' }, '<leader>xa', ":wqa<CR>", opts)

vim.keymap.set({ 'n' }, '<leader>nh', ":nohlsearch<CR>", opts)

vim.api.nvim_create_autocmd("FileType", {
  pattern = "*",
  callback = function()
    vim.cmd("highlight mdDone guifg=#a6e3a1 guibg=#11111b gui=bold")
    vim.cmd("highlight mdOnw guifg=#89b4fa guibg=#11111b gui=bold")
    vim.cmd("highlight mdTag guifg=#cba6f7 guibg=#11111b gui=bold")
    vim.cmd("highlight mdRisk guifg=#f0c060 guibg=#11111b gui=bold")
    vim.cmd("highlight mdHashtag guifg=#f5c2e7 guibg=#11111b gui=bold")
    vim.cmd("highlight mdFix guifg=#f38ba8 guibg=#11111b gui=bold ")

    -- 1. Definir el color para tus unicodes (ejemplo: color cian #89dceb)
    vim.cmd("highlight mdUnicode guifg=#eba0ac guibg=#11111b gui=bold")

    vim.fn.matchadd("mdDone", "@done", 10, -1, { buffer = 0 })
    vim.fn.matchadd("mdOnw", "@onw", 10, -1, { buffer = 0 })
    vim.fn.matchadd("mdFix", "@fix\\|@bug", 10, -1, { buffer = 0 })
    vim.fn.matchadd("mdRisk", "@warn\\|@risk", 10, -1, { buffer = 0 })
    vim.fn.matchadd("mdTag", "@\\w\\+", 5, -1, { buffer = 0 })
    vim.fn.matchadd("mdHashtag", "#_\\w\\+", 5, -1, { buffer = 0 })

    -- dates
    vim.cmd("highlight mdDate guifg=#a6adc8 guibg=#11111b gui=bold")
    vim.fn.matchadd("mdDate", "\\d\\{4\\}-\\d\\{2\\}-\\d\\{2\\}", 10, -1, { buffer = 0 })
    vim.fn.matchadd("mdDate", "\\d\\{2\\}/\\d\\{2\\}/\\d\\{4\\}", 10, -1, { buffer = 0 })

    -- 2. Cargar dinámicamente los unicodes del archivo externo y aplicar el highlight
    local ok, unicodes_list = pcall(require, "unicode_icons")
    if ok then
      local escaped_icons = {}
      for _, item in ipairs(unicodes_list) do
        -- Removemos espacios sobrantes alrededor del icono para evitar falsos positivos
        local clean_icon = item.icon:gsub("%s+", "")
        if #clean_icon > 0 then
          -- vim.fn.escape asegura que caracteres raros de regex no rompan el patrón
          table.insert(escaped_icons, vim.fn.escape(clean_icon, [[\^$.*~[]]))
        end
      end

      -- Une todos los iconos con '\|' para crear un patrón único (ej: "✓\|✗\|⦿")
      if #escaped_icons > 0 then
        local pattern = table.concat(escaped_icons, "\\|")
        vim.fn.matchadd("mdUnicode", pattern, 10, -1, { buffer = 0 })
      end
    end
  end,
})


-- DEFINIR UN NAMESPACE GLOBAL PARA LOS TAGS DE MARKDOWN (FUERA DEL AUTOCOMANDO)
-- local md_ns = vim.api.nvim_create_namespace("markdown_tags")
--
-- vim.api.nvim_create_autocmd("FileType", {
--   pattern = "markdown",
--   callback = function()
--     -- Configuración de colores (se mantienen igual)
--     vim.cmd("highlight mdDone guifg=#a6e3a1 guibg=#11111b gui=bold")
--     vim.cmd("highlight mdOnw guifg=#89b4fa guibg=#11111b gui=bold")
--     vim.cmd("highlight mdTag guifg=#cba6f7 guibg=#11111b gui=bold")
--     vim.cmd("highlight mdRisk guifg=#f0c060 guibg=#11111b gui=bold")
--     vim.cmd("highlight mdHashtag guifg=#f5c2e7 guibg=#11111b gui=bold")
--     vim.cmd("highlight mdFix guifg=#f38ba8 guibg=#11111b gui=bold")
--     vim.cmd("highlight mdUnicode guifg=#eba0ac guibg=#11111b gui=bold")
--     vim.cmd("highlight mdDate guifg=#a6adc8 guibg=#11111b gui=bold")
--
--     local bufnr = vim.api.nvim_get_current_buf()
--
--     -- Función local para aplicar extmarks basados en regex de Lua (por buffer)
--     local function apply_buffer_hl(pattern, hl_group)
--       local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
--       for line_idx, line_content in ipairs(lines) do
--         local start_pos = 1
--         while true do
--           local start_match, end_match = line_content:find(pattern, start_pos)
--           if not start_match then break end
--
--           -- nvim_buf_set_extmark usa posiciones 0-indexed para líneas y columnas
--           vim.api.nvim_buf_set_extmark(bufnr, md_ns, line_idx - 1, start_match - 1, {
--             end_col = end_match,
--             hl_group = hl_group,
--             strict = false,
--           })
--           start_pos = end_match + 1
--         end
--       end
--     end
--
--     -- Limpiar el namespace en este buffer antes de reaplicar (evita duplicados)
--     vim.api.nvim_buf_clear_namespace(bufnr, md_ns, 0, -1)
--
--     -- Aplicar reglas estándares
--     apply_buffer_hl("@done", "mdDone")
--     apply_buffer_hl("@onw", "mdOnw")
--     apply_buffer_hl("@fix", "mdFix")
--     apply_buffer_hl("@bug", "mdFix")
--     apply_buffer_hl("@warn", "mdRisk")
--     apply_buffer_hl("@risk", "mdRisk")
--     apply_buffer_hl("@[%w_]+", "mdTag")
--     apply_buffer_hl("#_[%w_]+", "mdHashtag")
--     apply_buffer_hl("%d%d%d%d-%d%d-%d%d", "mdDate")
--     apply_buffer_hl("%d%d/%d%d/%d%d%d%d", "mdDate")
--
--     -- Aplicar reglas dinámicas de Unicodes
--     local ok, unicodes_list = pcall(require, "unicode_icons")
--     if ok then
--       for _, item in ipairs(unicodes_list) do
--         local clean_icon = item.icon:gsub("%s+", "")
--         if #clean_icon > 0 then
--           -- En Lua patterns, escapamos caracteres especiales usando '%'
--           local escaped_lua_icon = clean_icon:gsub("([%^%$%%%.%*%+%-%?%[%]%(%)])", "%%%1")
--           apply_buffer_hl(escaped_lua_icon, "mdUnicode")
--         end
--       end
--     end
--   end,
-- })
