HISTFILE=${PWD}/.shell/.zsh_history
HISTSIZE=1000
SAVEHIST=1000

bindkey "\e[H" beginning-of-line
bindkey "\e[F" end-of-line
bindkey "^[[1;3C" forward-word
bindkey "^[[1;3D" backward-word

autoload -Uz compinit promptinit
compinit
promptinit

alias pi="pnpm install"
alias test="pnpm --silent test"

source ${PWD}/.devbox/nix/profile/default/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source ${PWD}/.devbox/nix/profile/default/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

eval "$(starship init zsh)"

function gcap() {
  git add .
  git commit -m "$1"
  git push origin -u $(git rev-parse --abbrev-ref HEAD)
}