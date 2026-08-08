return {
  "MeanderingProgrammer/render-markdown.nvim",
  version = "v5.0.0",
  name = "render-markdown",
  dependencies = { "nvim-treesitter/nvim-treesitter", "nvim-tree/nvim-web-devicons" },
  opts = {},
  config = function()
    require("render-markdown").setup({
      heading = {
        icons = {
          "🢖 ",
          "🢖🢖 ",
          "🢖🢖🢖 ",
          "🢖🢖🢖🢖 ",
          " ",
          " ",
        },
        signs = { "🢖 " },
        border_prefix = true,
        left_pad = 1,
        right_pad = 2,
        width = "block",
      },
      dash = { icon = "▰" },
      quote = { icon = "▋" },
      indent = {
        per_level = 2,
        skip_level = 1,
        skip_heading = true,
      },
      callout = {
        -- GFM standard
        -- note = { raw = "[!NOTE]", rendered = "󰋽 Note", highlight = "RenderMarkdownInfo" },
        tip = { raw = "[!TIP]", rendered = "󰌶 Tip", highlight = "RenderMarkdownSuccess" },
        important = { raw = "[!IMPORTANT]", rendered = "󰅾 Important", highlight = "RenderMarkdownHint" },
        warning = { raw = "[!WARNING]", rendered = "󰀪 Warning", highlight = "RenderMarkdownWarn" },
        caution = { raw = "[!CAUTION]", rendered = "󰳦 Caution", highlight = "RenderMarkdownError" },
        -- GFM extended
        abstract = { raw = "[!ABSTRACT]", rendered = "󰨸 Abstract", highlight = "RenderMarkdownInfo" },
        summary = { raw = "[!SUMMARY]", rendered = "󰨸 Summary", highlight = "RenderMarkdownInfo" },
        tldr = { raw = "[!TLDR]", rendered = "󰨸 Tldr", highlight = "RenderMarkdownInfo" },
        hint = { raw = "[!HINT]", rendered = "󰌶 Hint", highlight = "RenderMarkdownSuccess" },
        success = { raw = "[!SUCCESS]", rendered = "󰄬 Success", highlight = "RenderMarkdownSuccess" },
        question = { raw = "[!QUESTION]", rendered = "󰘥 Question", highlight = "RenderMarkdownWarn" },
        help = { raw = "[!HELP]", rendered = "󰘥 Help", highlight = "RenderMarkdownWarn" },
        faq = { raw = "[!FAQ]", rendered = "󰘥 Faq", highlight = "RenderMarkdownWarn" },
        attention = { raw = "[!ATTENTION]", rendered = "󰀪 Attention", highlight = "RenderMarkdownWarn" },
        failure = { raw = "[!FAILURE]", rendered = "󰅖 Failure", highlight = "RenderMarkdownError" },
        missing = { raw = "[!MISSING]", rendered = "󰅖 Missing", highlight = "RenderMarkdownError" },
        danger = { raw = "[!DANGER]", rendered = "󱐌 Danger", highlight = "RenderMarkdownError" },
        error = { raw = "[!ERROR]", rendered = "󱐌 Error", highlight = "RenderMarkdownError" },
        example = { raw = "[!EXAMPLE]", rendered = "󰉹 Example", highlight = "RenderMarkdownHint" },
        quote = { raw = "[!QUOTE]", rendered = "󱆨 Quote", highlight = "RenderMarkdownQuote" },
        cite = { raw = "[!CITE]", rendered = "󱆨 Cite", highlight = "RenderMarkdownQuote" },
        -- Task status
        todo = { raw = "[todo]", rendered = "꧁༺Tareas༻꧂ ", highlight = "RenderMarkdownInfo" },
        check = { raw = "[x]", rendered = "✓ ", highlight = "RenderMarkdownInfo" },
        done = { raw = "[done]", rendered = "😎_Logrado ", highlight = "RenderMarkdownSuccess" },
        completed = { raw = "[complete]", rendered = "🗹_Completado ", highlight = "RenderMarkdownInfo" },
        onwork = { raw = "[onw]", rendered = "╱_En_Progreso ", highlight = "RenderMarkdownInfo" },
        pending = { raw = "[pending]", rendered = "⏲_Pending ", highlight = "RenderMarkdownWarn" },
        paused = { raw = "[!PAUSED]", rendered = "🕓 Paused", highlight = "RenderMarkdownWarn" },
        suspended = { raw = "[!SUSPENDED]", rendered = "🕓 Suspended", highlight = "RenderMarkdownWarn" },
        cancelled = { raw = "[!CANCEL]", rendered = "🫥 Cancelled", highlight = "RenderMarkdownError" },
        -- Notes & metadata
        date = { raw = "[date]", rendered = "🗓Fecha", highlight = "RenderMarkdownHint" },
        info = { raw = "[info]", rendered = "🛈_Info", highlight = "RenderMarkdownInfo" },
        note = { raw = "[note]", rendered = "🖉_Note ", highlight = "RenderMarkdownSuccess" },
        description = { raw = "[desc]", rendered = "👀_Description ", highlight = "RenderMarkdownSuccess" },
        code = { raw = "[!CODE]", rendered = "<Code />", highlight = "RenderMarkdownInfo" },
        snippet = { raw = "[!snippet]", rendered = "<>Snippet</> ", highlight = "RenderMarkdownInfo" },
        test = { raw = "[TEST]", rendered = "🧪 Test", highlight = "RenderMarkdownHint" },
        -- Issues & alerts
        fix = { raw = "[fix]", rendered = "🛠_Fix ", highlight = "RenderMarkdownError" },
        bug = { raw = "[bug]", rendered = "󰨰 Bug", highlight = "RenderMarkdownError" },
        warn = { raw = "[warn]", rendered = "⚠️", highlight = "RenderMarkdownWarn" },
        idea = { raw = "[idea]", rendered = "🗲 ", highlight = "RenderMarkdownWarn" },
        goal = { raw = "[goal]", rendered = "🎯 ", highlight = "RenderMarkdownInfo" },
        goals = { raw = "[goals]", rendered = "꧁༺OBJETIVOS༻꧂ ", highlight = "RenderMarkdownInfo" },
        git = { raw = "[git]", rendered = "꧁༺Github༻꧂ ", highlight = "RenderMarkdownError" },
        tasks = { raw = "[tasks]", rendered = "⛬ ", highlight = "RenderMarkdownInfo" },
        lumpia = { raw = "[!LUMPIA]", rendered = "🤪 Lumpia", highlight = "RenderMarkdownSuccess" },
        -- Priorities
        level1 = { raw = "[!LEVEL 1]", rendered = "🠔 priority 1", highlight = "RenderMarkdownWarn" },
        level2 = { raw = "[!LEVEL 2]", rendered = "🠔 priority 2", highlight = "RenderMarkdownWarn" },
        level3 = { raw = "[!LEVEL 3]", rendered = "🠔 priority 3", highlight = "RenderMarkdownWarn" },
        level4 = { raw = "[!LEVEL 4]", rendered = "🠔 priority 4", highlight = "RenderMarkdownWarn" },
        level5 = { raw = "[!LEVEL 5]", rendered = "🠔 priority 5", highlight = "RenderMarkdownWarn" },
        -- Backlog
        postponded = { raw = "[pos]", rendered = "➤_Pospuesto ", highlight = "RenderMarkdownWarn" },
      },
    })
    vim.keymap.set("n", "<leader>md", ":RenderMarkdown toggle<CR>", { silent = true })
    -- RESALTADO PARA ETIQUETAS INLINE
    -- vim.api.nvim_create_autocmd("FileType", {
    --   pattern = "markdown",
    --   callback = function()
    --     -- vim.cmd("highlight mdTag guifg=#f0c060 guibg=NONE gui=bold")
    --     vim.cmd("highlight mdTag guifg=#fab387 guibg=NONE gui=bold")
    --     vim.fn.matchadd("mdTag", "@\\w\\+")
    --   end,
    -- })
  end,
}
