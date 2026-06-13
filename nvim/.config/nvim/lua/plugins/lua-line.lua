return {
  'nvim-lualine/lualine.nvim',
  dependencies = { 'nvim-tree/nvim-web-devicons' },
  config = function()
    local lualine_custom_message = ""

    --  ──────────────────────────────────────────────────────────────────────
    --  ══ ESTO PARA LAS TAREAS ════════════════════════════════════════
    local directory = function()
      return vim.fn.getcwd()
    end
    -- local TODO_FILE = vim.fn.expand("/home/villegas/git/.notes/global.md")
    local TODO_FILE = directory() .. "/todo.md"
    local function get_current_task()
      local file = io.open(TODO_FILE, "r")
      if not file then return "" end

      local file_dir = vim.fn.fnamemodify(TODO_FILE, ":h")

      local content = file:read("*a")
      file:close()
      local lines = vim.split(content, "\n", { trimempty = true })

      for _, line in ipairs(lines) do
        if line:match("^- %[ %] ") then
          -- lualine_custom_message = "Tarea: " .. line:sub(6)
          return "󱝽 Task: " .. line:sub(6)
          -- return line:sub(6)
        end
      end
      return ""
    end
    --  ──────────────────────────────────────────────────────────────────────
    local function get_custom_message()
      return lualine_custom_message
    end
    vim.api.nvim_create_user_command("AddTask", function()
      -- Pide al usuario que introduzca un mensaje
      local msg = vim.fn.input("Tarea: ", lualine_custom_message)

      -- Guarda el mensaje en el archivo todo.md
      local file = io.open(TODO_FILE, "a")
      file:write("- [ ] " .. msg .. "\n")
      file:close()

      -- Si el usuario ingresa un mensaje, actualiza la variable global
      if msg ~= "" then
        lualine_custom_message = msg
      else
        lualine_custom_message = ""
      end
    end, {})

    vim.api.nvim_create_user_command("DeleteTask", function()
      lualine_custom_message = ""
    end, {})

    vim.keymap.set('n', '<leader>at', ':AddTask<CR>', { desc = 'Set Lualine Message' })
    -- vim.keymap.set('n', '<leader>td', ':DeleteTask<CR>', { desc = 'Set Lualine Message' })
    vim.keymap.set('n', '<leader>pt', function()
      local todo_file = vim.fn.getcwd() .. "/todo.md"
      local width = 50
      -- 1. Buscar si el buffer de todo.md ya está abierto en una ventana
      local todo_win = nil
      for _, winid in ipairs(vim.api.nvim_list_wins()) do
        if vim.api.nvim_win_get_buf(winid) == vim.fn.bufnr(todo_file) then
          todo_win = winid
          break
        end
      end

      if todo_win then
        -- 2. Si está abierto, cerrarlo
        vim.api.nvim_win_close(todo_win, true)
      else
        -- 3. Si no está abierto, crearlo
        -- Asegura que el archivo exista antes de abrir
        if vim.fn.filereadable(todo_file) == 0 then
          vim.fn.writefile({ "# Tareas del Proyecto" }, todo_file)
        end

        -- Abrir en un vsplit a la derecha
        vim.cmd("vsplit")
        vim.cmd("wincmd L") -- Mover a la derecha extrema
        vim.cmd("vertical resize " .. width)
        vim.cmd("edit " .. todo_file)
        -- Solo mantenemos la opción para fijar el ancho
        vim.cmd("setlocal winfixwidth") -- Fija el ancho
      end
    end, { desc = 'Open todo.md' })
    --
    --  ══ HASTA AQUI LLEGA LO QUE ERA PARA LAS TAREAS ═════════════════════
    --

    local msg = function()
      return "Keep It Simple, Don't Repeat Yourself"
    end
    local tag = function()
      return "Tarea:"
    end
    require('lualine').setup({
      options = {
        theme = pcall(require, "catppuccin.lualine") and "catppuccin" or "auto",
        -- theme = "catppuccin",
        icons_enabled = true,
        component_separators = { left = '|', right = '|' },
        section_separators = { left = '', right = '' },
        -- section_separators = { left = '', right = '' },
        globalstatus = true,
      },
      sections = {
        lualine_a = { 'mode' },
        lualine_b = { 'branch', 'diff', 'diagnostics' },
        lualine_c = {
          {
            'filename',
            file_status = true,
            path = 1,
          },
          { require('project_notes').statusline_component },
          {
            get_current_task,
            color = {
              fg = '#f38ba8',
              -- bg = '#89b4fa',
              gui = 'bold',
            }
          },
        },
        -- lualine_x = { {
        --   get_current_task,
        --   color = {
        --     fg = '#ffffff',
        --     bg = '#BB1B47',
        --     gui = 'bold',
        --   }
        -- },
        --   'fileformat',
        --   'filetype' },
        lualine_y = { 'progress' },
        lualine_z = { 'location' }
      },
      inactive_sections = {
        lualine_a = {},
        lualine_b = {},
        lualine_c = { 'filename' },
        lualine_x = { 'location' },
        lualine_y = {},
        lualine_z = {}
      },
      -- CUSTOM
      -- sections = {
      --   lualine_a = { 'mode' },
      --   lualine_b = {
      --     { 'filename',                                   file_status = true, path = 0 },
      --     { require('project_notes').statusline_component },
      --
      --   },
      --   lualine_c = { 'branch', 'diff', 'diagnostics' },
      --   lualine_x = {
      --     'encoding', 'fileformat', 'filetype' },
      --   lualine_y = { 'progress' },
      --   lualine_z = { 'location',
      --   },
      -- },
      -- inactive_sections = {
      --   lualine_a = {
      --     { 'mode', color = { fg = '#9399b2', bg = '#313244' } },
      --   },
      --   lualine_b = {
      --     { 'filename',                                   file_status = true, path = 1, color = { fg = '#9399b2', bg = '#313244', } },
      --     { require('project_notes').statusline_component },
      --   },
      --   lualine_c = { 'branch', 'diff', 'diagnostics' },
      -- },
      -- lualine_x = {
      --   'encoding', 'fileformat', 'filetype' },
      -- lualine_y = { 'progress' },
      -- lualine_z = { 'location',
      -- },
      tabline = {},
      winbar = {
        lualine_z = {},
        lualine_y = {},
        -- lualine_c = { {
        --   function()
        --     return ""
        --   end,
        --   color = { fg = '#ffffff', bg = '#11111b', gui = 'bold' }
        -- } },
        lualine_x = {},
        lualine_b = {},
        -- lualine_a = { {
        --   get_current_task,
        --   color = {
        --     fg = '#ffffff',
        --     bg = '#BB1B47',
        --     gui = 'bold',
        --   }
        -- } }
        -- lualine_z = { { msg, color = { bg = '#cba6f7', fg = '#11111b', gui = 'bold' } } },
      },
    })
  end
}
