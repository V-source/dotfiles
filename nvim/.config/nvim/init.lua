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
if not vim.tbl_islist then
  vim.tbl_islist = vim.islist
end



-- local opts = {}
require("config")
require("lazy").setup("plugins")
-- require("lspconfig").astro.setup({})


--     local rocks_config = {
--         rocks_path = vim.env.HOME .. "/.local/share/nvim/rocks",
--     }
--
--     vim.g.rocks_nvim = rocks_config
--
--     local luarocks_path = {
--         vim.fs.joinpath(rocks_config.rocks_path, "share", "lua", "5.1", "?.lua"),
--         vim.fs.joinpath(rocks_config.rocks_path, "share", "lua", "5.1", "?", "init.lua"),
--     }
--     package.path = package.path .. ";" .. table.concat(luarocks_path, ";")
--
--     local luarocks_cpath = {
--         vim.fs.joinpath(rocks_config.rocks_path, "lib", "lua", "5.1", "?.so"),
--         vim.fs.joinpath(rocks_config.rocks_path, "lib64", "lua", "5.1", "?.so"),
--         -- Remove the dylib and dll paths if you do not need macos or windows support
--         vim.fs.joinpath(rocks_config.rocks_path, "lib", "lua", "5.1", "?.dylib"),
--         vim.fs.joinpath(rocks_config.rocks_path, "lib64", "lua", "5.1", "?.dylib"),
--         vim.fs.joinpath(rocks_config.rocks_path, "lib", "lua", "5.1", "?.dll"),
--         vim.fs.joinpath(rocks_config.rocks_path, "lib64", "lua", "5.1", "?.dll"),
--     }
--     package.cpath = package.cpath .. ";" .. table.concat(luarocks_cpath, ";")
--
--     vim.opt.runtimepath:append(vim.fs.joinpath(rocks_config.rocks_path, "lib", "luarocks", "rocks-5.1", "rocks.nvim", "*"))
-- <
