#!/usr/bin/env bash

# Portable Bun installer for Elest.io/VM pipelines.
# - Installs bash/curl if missing (apt, apk, yum, dnf supported)
# - Installs Bun non-interactively to $HOME/.bun
# - Ensures Bun is available in PATH for current session
# - Optional flags:
#     NO_SUDO=1 -> never use sudo (useful when already root or sudo unavailable)

set -euo pipefail

log() { printf "[init-bun] %s\n" "$*"; }
warn() { printf "[init-bun][WARN] %s\n" "$*" >&2; }
err() { printf "[init-bun][ERROR] %s\n" "$*" >&2; }

maybe_sudo() {
  if [ "${NO_SUDO:-0}" = "1" ] || [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    warn "sudo not available; attempting without sudo: $*"
    "$@"
  fi
}

# Re-exec with bash if the script was invoked with sh
if [ -z "${BASH_VERSION:-}" ]; then
  if command -v bash >/dev/null 2>&1; then
    exec bash "$0" "$@"
  else
    # Try to install bash if we have a package manager
    if command -v apt-get >/dev/null 2>&1; then
      log "Installing bash via apt-get..."
      maybe_sudo apt-get update -y || apt-get update -y || true
      maybe_sudo apt-get install -y bash || apt-get install -y bash
    elif command -v apk >/dev/null 2>&1; then
      log "Installing bash via apk..."
      maybe_sudo apk add --no-cache bash || apk add --no-cache bash
    elif command -v yum >/dev/null 2>&1; then
      log "Installing bash via yum..."
      maybe_sudo yum install -y bash || yum install -y bash
    elif command -v dnf >/dev/null 2>&1; then
      log "Installing bash via dnf..."
      maybe_sudo dnf install -y bash || dnf install -y bash
    else
      err "bash not found and no supported package manager available. Aborting."
      exit 1
    fi
    exec bash "$0" "$@"
  fi
fi

ensure_tool() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    return 0
  fi
  if command -v apt-get >/dev/null 2>&1; then
    log "Installing $name via apt-get..."
    maybe_sudo apt-get update -y || apt-get update -y || true
    maybe_sudo apt-get install -y "$name" || apt-get install -y "$name"
  elif command -v apk >/dev/null 2>&1; then
    log "Installing $name via apk..."
    maybe_sudo apk add --no-cache "$name" || apk add --no-cache "$name"
  elif command -v yum >/dev/null 2>&1; then
    log "Installing $name via yum..."
    maybe_sudo yum install -y "$name" || yum install -y "$name"
  elif command -v dnf >/dev/null 2>&1; then
    log "Installing $name via dnf..."
    maybe_sudo dnf install -y "$name" || dnf install -y "$name"
  else
    err "Unable to install $name automatically. Please install it manually."
    return 1
  fi
}

add_path_current_session() {
  local dir="$1"
  case ":$PATH:" in
    *":$dir:"*) :;;
    *) export PATH="$dir:$PATH";;
  esac
}

persist_path_for_future_sessions() {
  local snippet='\n# Bun\nif [ -d "$HOME/.bun/bin" ]; then\n  export PATH="$HOME/.bun/bin:$PATH"\nfi\n'

  if [ -w /etc/profile.d ] 2>/dev/null || [ "$(id -u)" -eq 0 ] || [ "${NO_SUDO:-0}" != "1" ]; then
    if echo -e "$snippet" | maybe_sudo tee /etc/profile.d/bun.sh >/dev/null; then
      maybe_sudo chmod 644 /etc/profile.d/bun.sh 2>/dev/null || true
      log "Persisted PATH in /etc/profile.d/bun.sh"
    else
      warn "Could not write /etc/profile.d/bun.sh"
    fi
  fi
}

link_bun_globally_if_possible() {
  local bun_bin="$1"
  if [ -w /usr/local/bin ] 2>/dev/null || [ "$(id -u)" -eq 0 ] || [ "${NO_SUDO:-0}" != "1" ]; then
    if maybe_sudo ln -sf "$bun_bin" /usr/local/bin/bun 2>/dev/null; then
      log "Linked bun to /usr/local/bin/bun"
    else
      warn "Could not link bun to /usr/local/bin"
    fi
  fi
}

install_bun() {
  local bun_install_dir="${BUN_INSTALL:-$HOME/.bun}"
  export BUN_INSTALL="$bun_install_dir"

  if command -v bun >/dev/null 2>&1; then
    log "Bun already installed: $(bun --version)"
    return 0
  fi

  ensure_tool curl || ensure_tool wget || {
    err "curl/wget not available and could not be installed."
    exit 1
  }

  log "Installing Bun into $BUN_INSTALL ..."
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.21"
  else
    wget -qO- https://bun.sh/install | bash -s "bun-v1.2.21"
  fi

  local bun_bin="$BUN_INSTALL/bin/bun"
  if [ ! -x "$bun_bin" ]; then
    err "Bun binary not found at $bun_bin after install."
    exit 1
  fi

  add_path_current_session "$BUN_INSTALL/bin"
  persist_path_for_future_sessions
  link_bun_globally_if_possible "$bun_bin"

  log "Bun installed: $($BUN_INSTALL/bin/bun --version)"
}

main() {
  log "Installing Bun..."
  install_bun

  # Validate availability in this session
  if ! command -v bun >/dev/null 2>&1; then
    if [ -x "$HOME/.bun/bin/bun" ]; then
      add_path_current_session "$HOME/.bun/bin"
    fi
  fi

  if command -v bun >/dev/null 2>&1; then
    log "bun resolved at: $(command -v bun)"
    bun --version || true
  else
    err "bun is still not in PATH. Check PATH persistence and re-run your shell."
    exit 1
  fi

  # Set default PORT if not already set
  if [ -z "${PORT:-}" ]; then
    export PORT=3001
    log "PORT not set, defaulting to 3001"
  else
    log "PORT is set to $PORT"
  fi

  log "Bun setup complete."
}

main "$@"
