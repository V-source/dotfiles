return {
  "MeanderingProgrammer/render-markdown.nvim",
  name = "render-markdown", -- Only needed if you have another plugin named markdown.nvim
  -- dependencies = { 'nvim-treesitter/nvim-treesitter', 'echasnovski/mini.nvim' },
  dependencies = { "nvim-treesitter/nvim-treesitter", "nvim-tree/nvim-web-devicons" },
  opts = {},
  config = function()
    require("render-markdown").setup({

      heading = {
        enabled = true,
        icons = {
          "🢖 ",
          "🢖🢖 ",
          "🢖🢖🢖 ",
          "🢖🢖🢖🢖 ",
          " ",
          " ",
        },
        signs = { "🢖 " },
        border = false,
        border_prefix = true,
        -- above = "─",
        -- below = "─",
        left_pad = 1,
        right_pad = 2,
        width = "block",
      },
      dash = {
        -- icon = "▰"
        icon = "◯"

      },
      quote = {
        icon = '▋',
        -- icon = '▎'
        -- icon = '⸠ '
      },
      indent = {
        -- Turn on / off org-indent-mode
        enabled = true,
        -- Amount of additional padding added for each heading level
        per_level = 2,
        -- Heading levels <= this value will not be indented
        -- Use 0 to begin indenting from the very first level
        skip_level = 1,
        -- Do not indent heading titles, only the body
        skip_heading = true,
      },
      callout = {
        date = { raw = "[date]", rendered = "🗓Fecha", highlight = "RenderMarkdownHint" },
        -- date = { raw = "[!DATE]", rendered = "󰅂 Date", highlight = "RenderMarkdownHint" },
        -- note = { raw = "[!NOTE]", rendered = "󰋽 Note", highlight = "RenderMarkdownInfo" },
        -- tip = { raw = "[!TIP]", rendered = "󰌶 Tip", highlight = "RenderMarkdownSuccess" },
        -- important = { raw = "[!IMPORTANT]", rendered = "󰅾 Important", highlight = "RenderMarkdownHint" },
        warning = { raw = "[!WARNING]", rendered = "󰀪 Warning", highlight = "RenderMarkdownWarn" },
        caution = { raw = "[!CAUTION]", rendered = "󰳦 Caution", highlight = "RenderMarkdownError" },
        -- fix = { raw = "[!FIX]", rendered = "󰀪 Fix", highlight = "RenderMarkdownError" },
        -- Obsidian: https://help.obsidian.md/Editing+and+formatting/Callouts
        abstract = { raw = "[!ABSTRACT]", rendered = "󰨸 Abstract", highlight = "RenderMarkdownInfo" },
        summary = { raw = "[!SUMMARY]", rendered = "󰨸 Summary", highlight = "RenderMarkdownInfo" },
        tldr = { raw = "[!TLDR]", rendered = "󰨸 Tldr", highlight = "RenderMarkdownInfo" },
        -- info = { raw = "[!INFO]", rendered = "󰋽 Info", highlight = "RenderMarkdownInfo" },
        hint = { raw = "[!HINT]", rendered = "󰌶 Hint", highlight = "RenderMarkdownSuccess" },
        success = { raw = "[!SUCCESS]", rendered = "󰄬 Success", highlight = "RenderMarkdownSuccess" },
        -- check = { raw = "[!CHECK]", rendered = "󰄬 Check", highlight = "RenderMarkdownSuccess" },
        -- done = { raw = "[!DONE]", rendered = "󰄬 Done", highlight = "RenderMarkdownSuccess" },
        question = { raw = "[!QUESTION]", rendered = "󰘥 Question", highlight = "RenderMarkdownWarn" },
        help = { raw = "[!HELP]", rendered = "󰘥 Help", highlight = "RenderMarkdownWarn" },
        faq = { raw = "[!FAQ]", rendered = "󰘥 Faq", highlight = "RenderMarkdownWarn" },
        attention = { raw = "[!ATTENTION]", rendered = "󰀪 Attention", highlight = "RenderMarkdownWarn" },
        failure = { raw = "[!FAILURE]", rendered = "󰅖 Failure", highlight = "RenderMarkdownError" },
        fail = { raw = "[!FAIL]", rendered = "󰅖 Fail", highlight = "RenderMarkdownError" },
        missing = { raw = "[!MISSING]", rendered = "󰅖 Missing", highlight = "RenderMarkdownError" },
        danger = { raw = "[!DANGER]", rendered = "󱐌 Danger", highlight = "RenderMarkdownError" },
        error = { raw = "[!ERROR]", rendered = "󱐌 Error", highlight = "RenderMarkdownError" },
        -- bug = { raw = "[!BUG]", rendered = "󰨰 Bug", highlight = "RenderMarkdownError", signs = '󰨰 ' },
        example = { raw = "[!EXAMPLE]", rendered = "󰉹 Example", highlight = "RenderMarkdownHint" },
        quote = { raw = "[!QUOTE]", rendered = "󱆨 Quote", highlight = "RenderMarkdownQuote" },
        cite = { raw = "[!CITE]", rendered = "󱆨 Cite", highlight = "RenderMarkdownQuote" },
        -- personalizados
        -- todo = { raw = "[!TODO]", rendered = "⏺ Todo", highlight = "RenderMarkdownInfo" },
        -- goal={ raw = "[!goal]", rendered = "🎯 Goal", highlight = "RenderMarkdownInfo" },
        tip = { raw = "[!TIP]", rendered = "💡 Tips", highlight = "RenderMarkdownSuccess" },
        cancel = { raw = "[!CANCEL]", rendered = "🫥 Fail", highlight = "RenderMarkdownError" },
        test = { raw = "[TEST]", rendered = "🧪 Test", highlight = "RenderMarkdownHint" },
        -- x = { raw = "[x]", rendered = "󰄬 X", highlight = "RenderMarkdownHint" },
        lumpia = { raw = "[!LUMPIA]", rendered = "🤪 Lumpia", highlight = "RenderMarkdownSuccess" },
        supended = { raw = "[!SUSPENDED]", rendered = "🕓 Suspended", highlight = "" },
        paused = { raw = "[!PAUSED]", rendered = "🕓 Paused", highlight = "" },
        code = { raw = "[!CODE]", rendered = "<Code />", highlight = "" },
        snippet = { raw = "[!snippet]", rendered = "<>Snippet</> ", highlight = "" },
        important = { raw = "[!IMPORTANT]", rendered = "⦿ Important", highlight = "RenderMarkdownerror" },
        --- nuevos
        fix = { raw = "[fix]", rendered = "🛠_Fix ", highlight = "RenderMarkdownError" },
        bug = { raw = "[bug]", rendered = "󰨰 Bug", highlight = "RenderMarkdownError", signs = '󰨰 ' },
        check = { raw = "[x]", rendered = "✓ ", highlight = "RenderMarkdownInfo" },
        todo = { raw = "[todo]", rendered = "꧁༺Tareas༻꧂ ", highlight = "RenderMarkdownInfo" },
        done = { raw = "[done]", rendered = "😎_Logrado ", highlight = "RenderMarkdownSuccess", signs = '✓ ' },
        completed = { raw = "[complete]", rendered = "🗹_Completado ", highlight = "RenderMarkdownInfo", signs = '✓ ' },
        onwork = { raw = "[onw]", rendered = "╱_En_Progreso ", highlight = "RenderMarkdownInfo" },
        idea = { raw = "[idea]", rendered = "🗲  ", highlight = "RenderMarkdownWarn", signs = '🗱 ' },
        goal = { raw = "[goal]", rendered = "🎯  ", highlight = "RenderMarkdownInfo" },
        goals = { raw = "[goals]", rendered = "꧁༺OBJETIVOS༻꧂ ", highlight = "RenderMarkdownInfo", signs = '🖸 ' },
        note = { raw = "[note]", rendered = "🖉_Note ", highlight = "RenderMarkdownSuccess" },
        description = { raw = "[desc]", rendered = "👀_Description ", highlight = "RenderMarkdownSuccess" },
        postponded = { raw = "[pos]", rendered = "➤_Pospuesto ", highlight = "RenderMarkdownWarn" },
        git = { raw = "[git]", rendered = "꧁༺Github༻꧂ ", highlight = "RenderMarkdownError" },
        warn = { raw = "[warn]", rendered = "⚠️", highlight = "RenderMarkdownWarn" },
        pending = { raw = "[pending]", rendered = "⏲ _Pending ", highlight = "RenderMarkdownWarn" },
        info = { raw = "[info]", rendered = "🛈_Info", highlight = "RenderMarkdownInfo" },
        tasks = { raw = "[tasks]", rendered = "⛬ ", highlight = "RenderMarkdownInfo" },
        ---
        level1 = { raw = "[!LEVEL 1]", rendered = "🠔 priority 1", highlight = "RenderMarkdownWarn" },
        level2 = { raw = "[!LEVEL 2]", rendered = "🠔 priority 2", highlight = "RenderMarkdownWarn" },
        level3 = { raw = "[!LEVEL 3]", rendered = "🠔 priority 3", highlight = "RenderMarkdownWarn" },
        level4 = { raw = "[!LEVEL 4]", rendered = "🠔 priority 4", highlight = "RenderMarkdownWarn" },
        level5 = { raw = "[!LEVEL 5]", rendered = "🠔 priority 5", highlight = "RenderMarkdownWarn" },
      },
    })
    vim.keymap.set("n", "<leader>md", ":RenderMarkdown toggle<CR>", { silent = true })
  end,
}

-- ꧁༺ Github ༻꧂
-- ▁▂▃▅▆█ FIX █▆▅▃▂▁
-- ⧗ 🛈
-- ꧁༺ Tareas ༻꧂
-- ꧁༺OBJETIVO༻꧂
-- ▁▂▃▅▆█ COMPONENT █▆▅▃▂▁
-- ꧁༺ [̲̅C][̲̅O][̲̅M][̲̅P][̲̅O][̲̅N][̲̅E][̲̅N][̲̅T] ༻꧂
-- ✮ COMPONENT ✮
-- ☆ 【O】【b】【j】【e】【t】【i】【v】【o】 ☆
