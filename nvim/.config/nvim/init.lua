-- lazy package manager`

-- require("vim._core.ui2").enable({})




local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)


-- Parche de compatibilidad para plugins desactualizados en Neovim 0.12
-- if not vim.tbl_islist then
--   vim.tbl_islist = vim.islist
-- end



-- local opts = {}
require("config")
require("lazy").setup("plugins")
