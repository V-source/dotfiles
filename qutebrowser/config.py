c = c  # noqa: F821
config = config  # noqa: F821

config.load_autoconfig()

# Catppuccin Mocha palette (disabled - replaced by Matrix Smooth Contrast)
# catppuccin = {
#     "rosewater": "#f5e0dc",
#     "flamingo": "#f2cdcd",
#     "pink": "#f5c2e7",
#     "mauve": "#cba6f7",
#     "red": "#f38ba8",
#     "maroon": "#eba0ac",
#     "peach": "#fab387",
#     "yellow": "#f9e2af",
#     "green": "#a6e3a1",
#     "teal": "#94e2d5",
#     "sky": "#89dceb",
#     "sapphire": "#74c7ec",
#     "blue": "#89b4fa",
#     "lavender": "#b4befe",
#     "text": "#cdd6f4",
#     "subtext1": "#bac2de",
#     "subtext0": "#a6adc8",
#     "overlay2": "#9399b2",
#     "overlay1": "#7f849c",
#     "overlay0": "#6c7086",
#     "surface2": "#585b70",
#     "surface1": "#45475a",
#     "surface0": "#313244",
#     # "base": "#1e1e2e",
#     "base": "#0E1111",
#     "mantle": "#181825",
#     "crust": "#11111b",
# }

# === Matrix Smooth Contrast palette (based on The-Matrix.nvim) ===
matrix = {
    # Colores fundamentales (coinciden con Neovim)
    "background": "#0D1117",
    "foreground": "#22DA6E",
    "selection_background": "#0E4D24",
    "selection_foreground": "#55FF99",
    "url_color": "#00FF66",
    "cursor": "#00FF66",
    "cursor_text_color": "#0D1117",

    # Bordes de ventanas
    "active_border_color": "#1A8A47",
    "inactive_border_color": "#0A2912",

    # Barra de pestañas (Tabs)
    "active_tab_background": "#00FF66",
    "active_tab_foreground": "#0D1117",
    "inactive_tab_background": "#090D12",
    "inactive_tab_foreground": "#1A6E39",
    "tab_bar_background": "#05080C",

    # 16 colores de la terminal
    "color0": "#0D1117",
    "color8": "#1A6E39",
    "color1": "#D64545",
    "color9": "#A63232",
    "color2": "#22DA6E",
    "color10": "#00FF66",
    "color3": "#C2D625",
    "color11": "#E6A122",
    "color4": "#1DB954",
    "color12": "#1AA34A",
    "color5": "#22DA88",
    "color13": "#1AD161",
    "color6": "#33CC77",
    "color14": "#55FF99",
    "color7": "#6BECA4",
    "color15": "#99FFBB",
}

# Excepción de modo oscuro para WhatsApp Web usando la ruta correcta de colores
# Desactiva por completo el modo oscuro forzado solo para WhatsApp Web
with config.pattern('https://web.whatsapp.com/*') as p:
    p.colors.webpage.darkmode.enabled = False


# === Search engine ===
c.url.searchengines = {
    'DEFAULT': 'https://www.google.com/search?q={}',
    '!aw': 'https://wiki.archlinux.org/?search={}',
    '!gh': 'https://github.com/search?o=desc&q={}&s=stars',
    '!yt': 'https://www.youtube.com/results?search_query={}',
}


# Set Google as the start page
c.url.start_pages = ['https://www.google.com']

# Set Google as the default page for new tabs
c.url.default_page = 'about:blank'

# === Tabs ===
c.tabs.show = "multiple"
c.tabs.position = "bottom"
c.tabs.padding = {'top': 5, 'bottom': 5, 'left': 9, 'right': 9}
# c.tabs.padding = {'top': 9, 'bottom': 9, 'left': 5, 'right': 5}
c.tabs.indicator.width = 0
c.tabs.width = '12%'
# c.tabs.width = '7%'
c.tabs.title.format = "{audio}{current_title}"

c.colors.tabs.bar.bg = matrix["tab_bar_background"]

c.colors.tabs.even.bg = matrix["inactive_tab_background"]
c.colors.tabs.odd.bg = matrix["inactive_tab_background"]
c.colors.tabs.even.fg = matrix["inactive_tab_foreground"]
c.colors.tabs.odd.fg = matrix["inactive_tab_foreground"]

c.colors.tabs.selected.even.bg = matrix["active_tab_background"]
c.colors.tabs.selected.odd.bg = matrix["active_tab_background"]
c.colors.tabs.selected.even.fg = matrix["active_tab_foreground"]
c.colors.tabs.selected.odd.fg = matrix["active_tab_foreground"]

# === Status bar ===
c.statusbar.show = "always"
c.colors.statusbar.normal.bg = matrix["inactive_tab_background"]
c.colors.statusbar.normal.fg = matrix["foreground"]
c.colors.statusbar.command.bg = matrix["background"]
c.colors.statusbar.command.fg = matrix["foreground"]
c.colors.statusbar.passthrough.fg = matrix["selection_foreground"]
c.colors.statusbar.url.fg = matrix["url_color"]
c.colors.statusbar.url.success.https.fg = matrix["selection_foreground"]
c.colors.statusbar.url.hover.fg = matrix["color13"]

# === Completion / Hints ===
c.colors.hints.bg = matrix["tab_bar_background"]
c.colors.hints.fg = matrix["url_color"]
c.hints.border = matrix["inactive_border_color"]

c.colors.completion.odd.bg = matrix["background"]
c.colors.completion.even.bg = matrix["background"]
c.colors.completion.fg = matrix["foreground"]
c.colors.completion.category.bg = matrix["inactive_tab_background"]
c.colors.completion.category.fg = matrix["color10"]
c.colors.completion.item.selected.bg = matrix["selection_background"]
c.colors.completion.item.selected.fg = matrix["selection_foreground"]
c.colors.completion.item.selected.match.fg = matrix["url_color"]
c.colors.completion.match.fg = matrix["color10"]

c.completion.open_categories = [
    'searchengines', 'quickmarks', 'bookmarks', 'history', 'filesystem']

# === Messages ===
c.colors.messages.info.bg = matrix["background"]
c.colors.messages.info.fg = matrix["foreground"]
c.colors.messages.error.bg = matrix["background"]
c.colors.messages.error.fg = matrix["color1"]

# === Downloads ===
c.colors.downloads.bar.bg = matrix["background"]
c.colors.downloads.error.bg = matrix["background"]
c.colors.downloads.error.fg = matrix["color1"]
c.colors.downloads.start.bg = matrix["url_color"]
c.colors.downloads.start.fg = matrix["cursor_text_color"]
c.colors.downloads.stop.bg = matrix["color8"]
c.colors.downloads.stop.fg = matrix["foreground"]

# === Tooltip ===
c.colors.tooltip.bg = matrix["inactive_tab_background"]
c.colors.tooltip.fg = matrix["foreground"]

# === Webpage ===
c.colors.webpage.bg = matrix["background"]

# === Fonts ===
c.fonts.default_family = []
c.fonts.default_size = '11pt'
c.fonts.web.family.fixed = 'monospace'
c.fonts.web.family.sans_serif = 'monospace'
c.fonts.web.family.serif = 'monospace'
c.fonts.web.size.default = 20

# === Dark mode ===
c.colors.webpage.darkmode.enabled = True
c.colors.webpage.darkmode.algorithm = 'lightness-cielab'
c.colors.webpage.darkmode.policy.images = 'never'
config.set('colors.webpage.darkmode.enabled', False, 'file://*')

# === Privacy ===
config.set("content.webgl", True, "*")
config.set("content.canvas_reading", False)
config.set("content.geolocation", False)
config.set("content.webrtc_ip_handling_policy",
           "default-public-interface-only")
config.set("content.cookies.accept", "all")
config.set("content.cookies.store", True)

# === Adblocking ===
c.content.blocking.enabled = True

# === Session ===
c.auto_save.session = True

# === Keybindings ===
config.bind('=', 'cmd-set-text -s :open')
config.bind('<ctrl-h>', 'history')
config.bind('cc', 'hint images spawn sh -c "cliphist link {hint-url}"')
config.bind('cs', 'cmd-set-text -s :config-source')
config.bind('tH', 'config-cycle tabs.show multiple never')
config.bind('sH', 'config-cycle statusbar.show always never')
config.bind('T', 'hint links tab')
config.bind('pP', 'open -- {primary}')
config.bind('pp', 'open -- {clipboard}')
config.bind('pt', 'open -t -- {clipboard}')
# config.bind('qm', 'macro-record')
config.bind('<ctrl-y>', 'spawn --userscript ytdl.sh')
config.bind('tT', 'config-cycle tabs.position top left bottom right')
config.bind('gJ', 'tab-move +')
config.bind('gK', 'tab-move -')
config.bind('gm', 'cmd-set-text -s :tab-move')
config.bind('tf', 'cmd-set-text -s :tab-focus')
