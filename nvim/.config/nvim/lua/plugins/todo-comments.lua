return {
  "folke/todo-comments.nvim",
  enabled = true,
  dependencies = "nvim-lua/plenary.nvim",
  cmd = { "TodoTrouble", "TodoTelescope", "TodoQuickFix", "TodoLocList" },
  event = { "BufReadPost", "BufNewFile" },
  config = function()
    require("todo-comments").setup({
      keywords = {
        FIX   = { icon = "󰨰 ", color = "error", alt = { "fix", "FIXME", "bug", "issue", "fixit", "BUG", "FIXIT", "ISSUE" } },
        TODO  = { icon = "● ", color = "info", alt = { "TASK", "todo" } },
        BREAK = { icon = " ", color = "warning", alt = { "break" } },
        WARN  = { icon = "⚠", color = "warning", alt = { "WARNING", "warn" } },
        PERF  = { icon = " ", alt = { "OPTIM", "PERFORMANCE", "optimize", "improve" } },
        NOTE  = { icon = "📝", color = "hint", alt = { "INFO", "note" } },
        TEST  = { icon = "⏲ ", color = "test", alt = { "TESTING", "testing", "test", "PASSED", "passed", "FAILED" } },
        DONE  = { icon = "✓ ", color = "#A7BFE3", alt = { "completed", "done" } },
        comm  = { icon = "❱ ", color = "#AAAAAA", alt = { "comment" } },
        NOW   = { icon = "∕", color = "#b15065", alt = { "now", "working", "onw" } },
        MARK  = { icon = "🔖", color = "#7f849c", alt = { "mark" } },
        IDEA  = { icon = "🗲 ", color = "#fab387", alt = { "tip", "TIP", "idea", "IDEA" } },
        comp  = { icon = "✮ ", color = "#5C9AFF", alt = { "cmp", "comp" } },
      },
      gui_style = { fg = "BOLD" },
      merge_keywords = true,
      highlight = {
        multiline_pattern = "^.",
        multiline = true,
        multiline_context = 10,
        before = "",
        keyword = "fg", -- usaw "wide" para aplicar fondo
        after = "fg",
        pattern = [[.*<(KEYWORDS)\s*:]],
        comments_only = true,
        max_line_len = 400,
        exclude = {},
      },
      colors = {
        error   = { "DiagnosticError", "ErrorMsg", "#DC2626" },
        warning = { "DiagnosticWarn", "WarningMsg", "#FBBF24" },
        info    = { "DiagnosticInfo", "#2563EB" },
        hint    = { "DiagnosticHint", "#10B981" },
        default = { "Identifier", "#7C3AED" },
        test    = { "Identifier", "#FF00FF" },
        done    = { "Done", "#FFFFFF" },
      },
    })

    vim.keymap.set("n", "<leader>tc", function()
      require("telescope.builtin").live_grep({
        search_dirs = { vim.fn.expand("%:p") },
        default_text = "TODO|FIX|HACK|WARN|NOTE|DONE|IDEA|BUG:",
        additional_args = { "--ignore-case" },
        prompt_title = "Todo Buffer",
      })
    end, { desc = "Todo buffer" })
    vim.keymap.set("n", "<leader>tC", ":TodoTelescope<CR>", { silent = true })
    vim.keymap.set("n", "<leader>tr", ":TodoQuickFix<CR>", { silent = true })
    vim.keymap.set("n", "]t", function()
      require("todo-comments").jump_next()
    end, { desc = "Next todo comment" })
    vim.keymap.set("n", "[t", function()
      require("todo-comments").jump_prev()
    end, { desc = "Previous todo comment" })
  end,
}
