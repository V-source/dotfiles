# Enable the subsequent settings only in interactive sessions
case $- in
  *i*) ;;
    *) return;;
esac

# Path to your oh-my-bash installation.
export OSH='/home/villegas/.oh-my-bash'

# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-bash is loaded.
# OSH_THEME="powerbash10k"
OSH_THEME="iterate"

# If you set OSH_THEME to "random", you can ignore themes you don't like.
# OMB_THEME_RANDOM_IGNORED=("powerbash10k" "wanelo")

# Uncomment the following line to use case-sensitive completion.
# OMB_CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion. Case
# sensitive completion must be off. _ and - will be interchangeable.
# OMB_HYPHEN_SENSITIVE="false"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_OSH_DAYS=13

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you don't want the repository to be considered dirty
# if there are untracked files.
# SCM_GIT_DISABLE_UNTRACKED_DIRTY="true"

# Uncomment the following line if you want to completely ignore the presence
# of untracked files in the repository.
# SCM_GIT_IGNORE_UNTRACKED="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.  One of the following values can
# be used to specify the timestamp format.
# * 'mm/dd/yyyy'     # mm/dd/yyyy + time
# * 'dd.mm.yyyy'     # dd.mm.yyyy + time
# * 'yyyy-mm-dd'     # yyyy-mm-dd + time
# * '[mm/dd/yyyy]'   # [mm/dd/yyyy] + [time] with colors
# * '[dd.mm.yyyy]'   # [dd.mm.yyyy] + [time] with colors
# * '[yyyy-mm-dd]'   # [yyyy-mm-dd] + [time] with colors
# If not set, the default value is 'yyyy-mm-dd'.
# HIST_STAMPS='yyyy-mm-dd'

# Uncomment the following line if you do not want OMB to overwrite the existing
# aliases by the default OMB aliases defined in lib/*.sh
# OMB_DEFAULT_ALIASES="check"

# Would you like to use another custom folder than $OSH/custom?
# OSH_CUSTOM=/path/to/new-custom-folder

# To disable the uses of "sudo" by oh-my-bash, please set "false" to
# this variable.  The default behavior for the empty value is "true".
OMB_USE_SUDO=true

# To enable/disable display of Python virtualenv and condaenv
# OMB_PROMPT_SHOW_PYTHON_VENV=true  # enable
# OMB_PROMPT_SHOW_PYTHON_VENV=false # disable

# Which completions would you like to load? (completions can be found in ~/.oh-my-bash/completions/*)
# Custom completions may be added to ~/.oh-my-bash/custom/completions/
# Example format: completions=(ssh git bundler gem pip pip3)
# Add wisely, as too many completions slow down shell startup.
completions=(
  git
  composer
  ssh
)

# Which aliases would you like to load? (aliases can be found in ~/.oh-my-bash/aliases/*)
# Custom aliases may be added to ~/.oh-my-bash/custom/aliases/
# Example format: aliases=(vagrant composer git-avh)
# Add wisely, as too many aliases slow down shell startup.
aliases=(
  general
)

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-bash/plugins/*)
# Custom plugins may be added to ~/.oh-my-bash/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
  git
  bashmarks
)

# Which plugins would you like to conditionally load? (plugins can be found in ~/.oh-my-bash/plugins/*)
# Custom plugins may be added to ~/.oh-my-bash/custom/plugins/
# Example format:
#  if [ "$DISPLAY" ] || [ "$SSH" ]; then
#      plugins+=(tmux-autoattach)
#  fi

source "$OSH"/oh-my-bash.sh

# User configuration
# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
# export SSH_KEY_PATH="~/.ssh/rsa_id"

# Set personal aliases, overriding those provided by oh-my-bash libs,
# plugins, and themes. Aliases can be placed here, though oh-my-bash
# users are encouraged to define aliases within the OSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias bashconfig="mate ~/.bashrc"
# alias ohmybash="mate ~/.oh-my-bash"
#
# DOCKER CONTAINER - MONGO
export MONGODB_VERSION=7.0-ubi8

export EDITOR=nvim
export TERM=kitty

alias code="nvim"
alias src="source ~/.bashrc"
alias pclock="peaclock"
# alias yz="yazi"
alias lg="lazygit"
alias gt="cd ~/git && yazi"
alias zj="zellij"
alias bs="nvim ~/.bashrc"
alias matrix="unimatrix -f -b -s 93"
alias mongo="docker compose --file $HOME/git/mongodb/docker-compose.yml exec mongodb"
alias msh="docker exec -it mongodb_server mongosh --username resilientcode --password villejscodeforce9 --authenticationDatabase admin"
alias profit="sshfs sucrenet@10.8.0.134:/Users/Sucrenet/git/profit-server ~/profit-server/"
alias music="musikcube"

alias changelog='/home/villegas/git/__tareas/scripts/finalizar-dia.sh'

# NGROK recuerda que debes usar la vpn
alias ngrok_http="TERM=screen-256color ngrok http 5000"

function yz() {
	local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
	yazi "$@" --cwd-file="$tmp"
	IFS= read -r -d '' cwd < "$tmp"
	[ -n "$cwd" ] && [ "$cwd" != "$PWD" ] && builtin cd -- "$cwd"
	rm -f -- "$tmp"
}


spf() {
    os=$(uname -s)

    # Linux
    if [[ "$os" == "Linux" ]]; then
        export SPF_LAST_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/superfile/lastdir"
    fi

    command spf "$@"

    [ ! -f "$SPF_LAST_DIR" ] || {
        . "$SPF_LAST_DIR"
        rm -f -- "$SPF_LAST_DIR" > /dev/null
    }
}


alias hurl='docker run --rm --network host -v "$(pwd):/data" -w /data ghcr.io/orange-opensource/hurl:latest --verbose "$@"'

# alias hurl='docker run --rm -v "$(pwd):/data" -w /data ghcr.io/orange-opensource/hurl:latest --verbose "$@"'
winserver() {
  expect -c "
    spawn ssh sucrenet@10.8.0.134
    expect \"password:\"
    send \"********\r\"
    expect \"\\\$ \" ;# Espera el prompt del shell
    send \"cd ./git/profit-server\\r\" ;# Cambia al directorio deseado
    expect \"\\\$ \" ;# Espera el prompt después de cd
    interact
  "
}


# Zellij
z() {
  zellij 
}
zjl() {
# zellij layout
  zellij --layout $1
}


# para ejecutar nvim en las carpetas de configuracion especificada
# ejemplo: config i3
config() {
    cd ~/.config/"$1" && nvim
}

pj() {
    cd ~/git/"$1" && zellij
}

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

export ANDROID_HOME=/home/villegas/Android/Sdk
export PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools

# Added by LM Studio CLI (lms)
export PATH="$PATH:/home/villegas/.lmstudio/bin"

# FZF
fp() {
    # Si le pasas un argumento ($1), se mueve ahí; si no, usa el directorio actual (.)
    local search_path="${1:-.}"

    # Verificamos si ripgrep está instalado para listar archivos limpiamente
    if command -v rg > /dev/null; then
        export FZF_DEFAULT_COMMAND="rg --files --hidden --glob '!.git/*' $search_path"
    fi

    fzf --preview '[[ -d {} ]] && eza --tree --level=2 --color=always {} || bat --style=numbers --color=always --line-range :500 {}' \
        --preview-window='right:60%:wrap' \
        --bind 'alt-u:preview-up,alt-d:preview-down' \
        --bind 'ctrl-u:preview-page-up,ctrl-d:preview-page-down' \
        --bind 'ctrl-o:execute(nvim {})+abort' \
        --bind 'alt-space:toggle-preview' \
        --header "Buscando en: $search_path | Alt-U/D: Soft Scroll | Ctrl-U/D: Hard Scroll | ESC: Salir" \
        --layout=reverse --border

}
export PATH="$HOME/.local/bin:$PATH"

# front camera scrcpy
alias frontcam='scrcpy --no-audio --video-source=camera --camera-id=1 --camera-size=1920x1080 --window-title="front camera" --always-on-top;'
alias backcam='scrcpy --no-audio --video-source=camera --video-codec=h265 --window-title="back camera" --orientation=0 --camera-size=1920x1080 --camera-id=0;'
alias sc='scrcpy --stay-awake --keyboard=aoa --mouse=aoa --max-fps=60'
alias r-adb='adb kill-server; sleep 1; adb start-server'

# pnpm
export PNPM_HOME="/home/villegas/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end
export PNPM_HOME="/home/villegas/.local/share/pnpm"
export PATH="$PATH:$PNPM_HOME"
. "$HOME/.cargo/env"
export PATH=$PATH:$(go env GOPATH)/bin
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH

ks() {
    local sessions_dir="$HOME/kitty-sessions"
    
    # 1. Listar los archivos disponibles (solo el nombre, sin .conf)
    echo "Sesiones disponibles en $sessions_dir:"
    ls "$sessions_dir" | sed 's/\.conf//'
    
    # 2. Pedir al usuario que escriba el nombre
    echo -n -e "\nEscribe el nombre de la sesión: "
    read session_name
    
    # 3. Validar y ejecutar
    if [[ -f "$sessions_dir/$session_name.conf" ]]; then
        kitty --detach --session "$sessions_dir/$session_name.conf" &>/dev/null
        echo "Lanzando sesión: $session_name"
    else
        echo "Error: La sesión '$session_name' no existe."
    fi
}
