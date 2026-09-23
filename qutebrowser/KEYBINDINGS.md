# qutebrowser — keybindings por defecto (v3.7.0)

> Atajos **default** de qutebrowser · Fuente: `bindings.default` (configdata, versión 3.7.0).

> Los atajos personales de este equipo están definidos en `config.py` (ver sección final).
>
> Generado a partir de `configdata.yml` de la instalación local.


## Pages & navigation

| Tecla | Comando |
|---|---|
| `<back>` | `:back` |
| `H` | `:back` |
| `th` | `:back -t` |
| `wh` | `:back -w` |
| `<Escape>` | `:clear-keychain ;; search ;; fullscreen --leave` |
| `<forward>` | `:forward` |
| `L` | `:forward` |
| `tl` | `:forward -t` |
| `wl` | `:forward -w` |
| `<F11>` | `:fullscreen` |
| `<Ctrl-A>` | `:navigate increment` |
| `<Ctrl-X>` | `:navigate decrement` |
| `[[` | `:navigate prev` |
| `]]` | `:navigate next` |
| `gU` | `:navigate up -t` |
| `gu` | `:navigate up` |
| `{{` | `:navigate prev -t` |
| `}}` | `:navigate next -t` |
| `<Ctrl-N>` | `:open -w` |
| `<Ctrl-Shift-N>` | `:open -p` |
| `<Ctrl-T>` | `:open -t` |
| `O` | `:open -t` |
| `PP` | `:open -t -- {primary}` |
| `Pp` | `:open -t -- {clipboard}` |
| `gO` | `:open -t -r {url:pretty}` |
| `ga` | `:open -t` |
| `go` | `:open {url:pretty}` |
| `o` | `:open` |
| `pP` | `:open -- {primary}` |
| `pp` | `:open -- {clipboard}` |
| `wO` | `:open -w {url:pretty}` |
| `wP` | `:open -w -- {primary}` |
| `wo` | `:open -w` |
| `wp` | `:open -w -- {clipboard}` |
| `xO` | `:open -b -r {url:pretty}` |
| `xo` | `:open -b` |
| `<Ctrl-F5>` | `:reload -f` |
| `<F5>` | `:reload` |
| `R` | `:reload -f` |
| `r` | `:reload` |
| `h` | `:scroll left` |
| `j` | `:scroll down` |
| `k` | `:scroll up` |
| `l` | `:scroll right` |
| `<Alt-1>` | `:tab-focus 1` |
| `<Alt-2>` | `:tab-focus 2` |
| `<Alt-3>` | `:tab-focus 3` |
| `<Alt-4>` | `:tab-focus 4` |
| `<Alt-5>` | `:tab-focus 5` |
| `<Alt-6>` | `:tab-focus 6` |
| `<Alt-7>` | `:tab-focus 7` |
| `<Alt-8>` | `:tab-focus 8` |
| `<Alt-9>` | `:tab-focus -1` |
| `<Ctrl-Tab>` | `:tab-focus last` |
| `<Ctrl-^>` | `:tab-focus last` |
| `g$` | `:tab-focus -1` |
| `g0` | `:tab-focus 1` |
| `g^` | `:tab-focus 1` |
| `=` | `:zoom` |

## Tabs & windows

| Tecla | Comando |
|---|---|
| `<Ctrl-Shift-W>` | `:close` |
| `gC` | `:tab-clone` |
| `<Ctrl-W>` | `:tab-close` |
| `D` | `:tab-close -o` |
| `d` | `:tab-close` |
| `gD` | `:tab-give` |
| `gJ` | `:tab-move +` |
| `gK` | `:tab-move -` |
| `gm` | `:tab-move` |
| `<Alt-m>` | `:tab-mute` |
| `<Ctrl-PgDown>` | `:tab-next` |
| `J` | `:tab-next` |
| `co` | `:tab-only` |
| `<Ctrl-p>` | `:tab-pin` |
| `<Ctrl-PgUp>` | `:tab-prev` |
| `K` | `:tab-prev` |
| `gt` | `:tab-select` |
| `<Ctrl-Shift-T>` | `:undo` |
| `U` | `:undo -w` |
| `u` | `:undo` |

## History & bookmarks

| Tecla | Comando |
|---|---|
| `Sh` | `:history` |

## Links, hints & download

| Tecla | Comando |
|---|---|
| `gd` | `:download` |
| `;I` | `:hint images tab` |
| `;O` | `:hint links fill :open -t -r {hint-url}` |
| `;R` | `:hint --rapid links window` |
| `;Y` | `:hint links yank-primary` |
| `;b` | `:hint all tab-bg` |
| `;d` | `:hint links download` |
| `;f` | `:hint all tab-fg` |
| `;h` | `:hint all hover` |
| `;i` | `:hint images` |
| `;o` | `:hint links fill :open {hint-url}` |
| `;r` | `:hint --rapid links tab-bg` |
| `;t` | `:hint inputs` |
| `;y` | `:hint links yank` |
| `F` | `:hint all tab` |
| `f` | `:hint` |
| `gi` | `:hint inputs --first` |
| `wf` | `:hint all window` |

## Search & selection

| Tecla | Comando |
|---|---|
| `yD` | `:yank domain -s` |
| `yM` | `:yank inline [{title}]({url:yank}) -s` |
| `yP` | `:yank pretty-url -s` |
| `yT` | `:yank title -s` |
| `yY` | `:yank -s` |
| `yd` | `:yank domain` |
| `ym` | `:yank inline [{title}]({url:yank})` |
| `yp` | `:yank pretty-url` |
| `yt` | `:yank title` |
| `yy` | `:yank` |

## Other / general

| Tecla | Comando |
|---|---|
| `:` | `:cmd-set-text :` |
| `sk` | `:bind` |
| `M` | `:bookmark-add` |
| `Sb` | `:bookmark-list --jump` |
| `Sq` | `:bookmark-list` |
| `gB` | `:bookmark-load -t` |
| `gb` | `:bookmark-load` |
| `wB` | `:bookmark-load -w` |
| `.` | `:cmd-repeat-last` |
| `/` | `:cmd-set-text /` |
| `?` | `:cmd-set-text ?` |
| `T` | `:cmd-set-text -sr :tab-focus` |
| `tCH` | `:config-cycle -p -u *://*.{url:host}/* content.cookies.accept all no-3rdparty never ;; reload` |
| `tCh` | `:config-cycle -p -u *://{url:host}/* content.cookies.accept all no-3rdparty never ;; reload` |
| `tCu` | `:config-cycle -p -u {url} content.cookies.accept all no-3rdparty never ;; reload` |
| `tIH` | `:config-cycle -p -u *://*.{url:host}/* content.images ;; reload` |
| `tIh` | `:config-cycle -p -u *://{url:host}/* content.images ;; reload` |
| `tIu` | `:config-cycle -p -u {url} content.images ;; reload` |
| `tPH` | `:config-cycle -p -u *://*.{url:host}/* content.plugins ;; reload` |
| `tPh` | `:config-cycle -p -u *://{url:host}/* content.plugins ;; reload` |
| `tPu` | `:config-cycle -p -u {url} content.plugins ;; reload` |
| `tSH` | `:config-cycle -p -u *://*.{url:host}/* content.javascript.enabled ;; reload` |
| `tSh` | `:config-cycle -p -u *://{url:host}/* content.javascript.enabled ;; reload` |
| `tSu` | `:config-cycle -p -u {url} content.javascript.enabled ;; reload` |
| `tcH` | `:config-cycle -p -t -u *://*.{url:host}/* content.cookies.accept all no-3rdparty never ;; reload` |
| `tch` | `:config-cycle -p -t -u *://{url:host}/* content.cookies.accept all no-3rdparty never ;; reload` |
| `tcu` | `:config-cycle -p -t -u {url} content.cookies.accept all no-3rdparty never ;; reload` |
| `tiH` | `:config-cycle -p -t -u *://*.{url:host}/* content.images ;; reload` |
| `tih` | `:config-cycle -p -t -u *://{url:host}/* content.images ;; reload` |
| `tiu` | `:config-cycle -p -t -u {url} content.images ;; reload` |
| `tpH` | `:config-cycle -p -t -u *://*.{url:host}/* content.plugins ;; reload` |
| `tph` | `:config-cycle -p -t -u *://{url:host}/* content.plugins ;; reload` |
| `tpu` | `:config-cycle -p -t -u {url} content.plugins ;; reload` |
| `tsH` | `:config-cycle -p -t -u *://*.{url:host}/* content.javascript.enabled ;; reload` |
| `tsh` | `:config-cycle -p -t -u *://{url:host}/* content.javascript.enabled ;; reload` |
| `tsu` | `:config-cycle -p -t -u {url} content.javascript.enabled ;; reload` |
| `wIh` | `:devtools left` |
| `wIj` | `:devtools bottom` |
| `wIk` | `:devtools top` |
| `wIl` | `:devtools right` |
| `wIw` | `:devtools window` |
| `wi` | `:devtools` |
| `wIf` | `:devtools-focus` |
| `ad` | `:download-cancel` |
| `cd` | `:download-clear` |
| `<Ctrl-h>` | `:home` |
| `q` | `:macro-record` |
| `@` | `:macro-run` |
| `'` | `:mode-enter jump_mark` |
| `<Ctrl-V>` | `:mode-enter passthrough` |
| `V` | `:mode-enter caret ;; selection-toggle --line` |
| `` ` `` | `:mode-enter set_mark` |
| `i` | `:mode-enter insert` |
| `v` | `:mode-enter caret` |
| `<Ctrl-Shift-Tab>` | `:nop` |
| `<Ctrl-Alt-p>` | `:print` |
| `B` | `:quickmark-load -t` |
| `b` | `:quickmark-load` |
| `wb` | `:quickmark-load -w` |
| `m` | `:quickmark-save` |
| `<Ctrl-Q>` | `:quit` |
| `ZQ` | `:quit` |
| `ZZ` | `:quit --save` |
| `sf` | `:save` |
| `<Ctrl-B>` | `:scroll-page 0 -1` |
| `<Ctrl-D>` | `:scroll-page 0 0.5` |
| `<Ctrl-F>` | `:scroll-page 0 1` |
| `<Ctrl-U>` | `:scroll-page 0 -0.5` |
| `G` | `:scroll-to-perc` |
| `gg` | `:scroll-to-perc 0` |
| `n` | `:search-next` |
| `N` | `:search-prev` |
| `<Ctrl-Return>` | `:selection-follow -t` |
| `<Return>` | `:selection-follow` |
| `Ss` | `:set` |
| `sl` | `:set -t` |
| `ss` | `:set` |
| `<Ctrl-s>` | `:stop` |
| `gf` | `:view-source` |
| `+` | `:zoom-in` |
| `-` | `:zoom-out` |

---

## Otros modos (no normal)


### Modo insert

| Tecla | Comando |
|---|---|
| `<Ctrl-E>` | `:edit-text` |
| `<Escape>` | `:mode-leave` |
| `<Shift-Escape>` | `:fake-key <Escape>` |
| `<Shift-Ins>` | `:insert-text -- {primary}` |

### Modo hint

| Tecla | Comando |
|---|---|
| `<Ctrl-B>` | `:hint all tab-bg` |
| `<Ctrl-F>` | `:hint links` |
| `<Ctrl-R>` | `:hint --rapid links tab-bg` |
| `<Escape>` | `:mode-leave` |
| `<Return>` | `:hint-follow` |

### Modo passthrough

| Tecla | Comando |
|---|---|
| `<Shift-Escape>` | `:mode-leave` |

### Modo command

| Tecla | Comando |
|---|---|
| `<Alt-B>` | `:rl-backward-word` |
| `<Alt-Backspace>` | `:rl-backward-kill-word` |
| `<Alt-D>` | `:rl-kill-word` |
| `<Alt-F>` | `:rl-forward-word` |
| `<Ctrl-?>` | `:rl-delete-char` |
| `<Ctrl-A>` | `:rl-beginning-of-line` |
| `<Ctrl-B>` | `:rl-backward-char` |
| `<Ctrl-C>` | `:completion-item-yank` |
| `<Ctrl-D>` | `:completion-item-del` |
| `<Ctrl-E>` | `:rl-end-of-line` |
| `<Ctrl-F>` | `:rl-forward-char` |
| `<Ctrl-H>` | `:rl-backward-delete-char` |
| `<Ctrl-K>` | `:rl-kill-line` |
| `<Ctrl-N>` | `:command-history-next` |
| `<Ctrl-P>` | `:command-history-prev` |
| `<Ctrl-Return>` | `:command-accept --rapid` |
| `<Ctrl-Shift-C>` | `:completion-item-yank --sel` |
| `<Ctrl-Shift-Tab>` | `:completion-item-focus prev-category` |
| `<Ctrl-Shift-W>` | `:rl-filename-rubout` |
| `<Ctrl-Tab>` | `:completion-item-focus next-category` |
| `<Ctrl-U>` | `:rl-unix-line-discard` |
| `<Ctrl-W>` | `:rl-rubout " "` |
| `<Ctrl-Y>` | `:rl-yank` |
| `<Down>` | `:completion-item-focus --history next` |
| `<Escape>` | `:mode-leave` |
| `<PgDown>` | `:completion-item-focus next-page` |
| `<PgUp>` | `:completion-item-focus prev-page` |
| `<Return>` | `:command-accept` |
| `<Shift-Delete>` | `:completion-item-del` |
| `<Shift-Tab>` | `:completion-item-focus prev` |
| `<Tab>` | `:completion-item-focus next` |
| `<Up>` | `:completion-item-focus --history prev` |

### Modo prompt

| Tecla | Comando |
|---|---|
| `<Alt-B>` | `:rl-backward-word` |
| `<Alt-Backspace>` | `:rl-backward-kill-word` |
| `<Alt-D>` | `:rl-kill-word` |
| `<Alt-E>` | `:prompt-fileselect-external` |
| `<Alt-F>` | `:rl-forward-word` |
| `<Alt-Shift-Y>` | `:prompt-yank --sel` |
| `<Alt-Y>` | `:prompt-yank` |
| `<Ctrl-?>` | `:rl-delete-char` |
| `<Ctrl-A>` | `:rl-beginning-of-line` |
| `<Ctrl-B>` | `:rl-backward-char` |
| `<Ctrl-E>` | `:rl-end-of-line` |
| `<Ctrl-F>` | `:rl-forward-char` |
| `<Ctrl-H>` | `:rl-backward-delete-char` |
| `<Ctrl-K>` | `:rl-kill-line` |
| `<Ctrl-P>` | `:prompt-open-download --pdfjs` |
| `<Ctrl-Shift-W>` | `:rl-filename-rubout` |
| `<Ctrl-U>` | `:rl-unix-line-discard` |
| `<Ctrl-W>` | `:rl-rubout " "` |
| `<Ctrl-X>` | `:prompt-open-download` |
| `<Ctrl-Y>` | `:rl-yank` |
| `<Down>` | `:prompt-item-focus next` |
| `<Escape>` | `:mode-leave` |
| `<Return>` | `:prompt-accept` |
| `<Shift-Tab>` | `:prompt-item-focus prev` |
| `<Tab>` | `:prompt-item-focus next` |
| `<Up>` | `:prompt-item-focus prev` |

### Modo yesno

| Tecla | Comando |
|---|---|
| `<Alt-Shift-Y>` | `:prompt-yank --sel` |
| `<Alt-Y>` | `:prompt-yank` |
| `<Escape>` | `:mode-leave` |
| `<Return>` | `:prompt-accept` |
| `N` | `:prompt-accept --save no` |
| `Y` | `:prompt-accept --save yes` |
| `n` | `:prompt-accept no` |
| `y` | `:prompt-accept yes` |

### Modo caret

| Tecla | Comando |
|---|---|
| `$` | `:move-to-end-of-line` |
| `0` | `:move-to-start-of-line` |
| `<Ctrl-Space>` | `:selection-drop` |
| `<Escape>` | `:mode-leave` |
| `<Return>` | `:yank selection` |
| `<Space>` | `:selection-toggle` |
| `G` | `:move-to-end-of-document` |
| `H` | `:scroll left` |
| `J` | `:scroll down` |
| `K` | `:scroll up` |
| `L` | `:scroll right` |
| `V` | `:selection-toggle --line` |
| `Y` | `:yank selection -s` |
| `[` | `:move-to-start-of-prev-block` |
| `]` | `:move-to-start-of-next-block` |
| `b` | `:move-to-prev-word` |
| `c` | `:mode-enter normal` |
| `e` | `:move-to-end-of-word` |
| `gg` | `:move-to-start-of-document` |
| `h` | `:move-to-prev-char` |
| `j` | `:move-to-next-line` |
| `k` | `:move-to-prev-line` |
| `l` | `:move-to-next-char` |
| `o` | `:selection-reverse` |
| `v` | `:selection-toggle` |
| `w` | `:move-to-next-word` |
| `y` | `:yank selection` |
| `{` | `:move-to-end-of-prev-block` |
| `}` | `:move-to-end-of-next-block` |

### Modo register

| Tecla | Comando |
|---|---|
| `<Escape>` | `:mode-leave` |

---

## Atajos personales (definidos en config.py)

| Tecla | Comando |
|---|---|
| `=` | `cmd-set-text -s :open` |
| `h` | `history` |
| `cc` | `hint images spawn sh -c "cliphist link {hint-url}"` |
| `cs` | `cmd-set-text -s :config-source` |
| `tH` | `config-cycle tabs.show multiple never` |
| `sH` | `config-cycle statusbar.show always never` |
| `T` | `hint links tab` |
| `pP` | `open -- {primary}` |
| `pp` | `open -- {clipboard}` |
| `pt` | `open -t -- {clipboard}` |
| `<ctrl-y>` | `spawn --userscript ytdl.sh` |
| `tT` | `config-cycle tabs.position top left` |
| `gJ` | `tab-move +` |
| `gK` | `tab-move -` |
| `gm` | `cmd-set-text -s :tab-move` |
| `tf` | `cmd-set-text -s :tab-focus` |
