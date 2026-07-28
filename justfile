set dotenv-load := false
set shell := ["bash", "-euo", "pipefail", "-c"]

# List available targets.
default:
  @just --list

# Bootstrap the repo for day-to-day development and Pi usage.
bootstrap: deps pi-bootstrap

# Install/update the project workspace dependencies when needed.
deps:
  @if [ ! -d node_modules ] || [ pnpm-lock.yaml -nt node_modules ]; then \
    echo "Installing pnpm dependencies..."; \
    pnpm install --frozen-lockfile; \
  else \
    echo "pnpm dependencies already present"; \
  fi

# Install pi.dev into a repo-local prefix and expose it through nix develop's PATH.
pi-bootstrap:
  @mkdir -p .pi/nix-global
  @if [ ! -x "$PWD/.pi/nix-global/bin/pi" ]; then \
    echo "Installing pi.dev into .pi/nix-global..."; \
    npm install -g --prefix "$PWD/.pi/nix-global" --ignore-scripts @earendil-works/pi-coding-agent; \
  else \
    echo "repo-local pi available: $("$PWD/.pi/nix-global/bin/pi" --version 2>/dev/null || echo unknown)"; \
  fi
  @echo "Project Pi packages are pinned in .pi/settings.json. Start with: pi"

# Force-refresh the repo-local pi.dev installation.
pi-update:
  npm install -g --prefix "$PWD/.pi/nix-global" --ignore-scripts @earendil-works/pi-coding-agent@latest

# Show Pi and project package wiring without starting an interactive model turn.
pi-doctor:
  @echo "pi: $(command -v pi || true)"
  @pi --version
  @pi list
  @if [ -x .pi/npm/node_modules/dev-loops/cli/index.mjs ]; then \
    node .pi/npm/node_modules/dev-loops/cli/index.mjs doctor; \
  else \
    npx --yes dev-loops@0.9.0 doctor; \
  fi
  @echo "Note: dev-loops CLI doctor checks for a shell-level 'subagent' command; in Pi, subagents are provided as an extension/tool. Confirm package loading with 'pi list'."

# Common validation shortcuts.
check:
  ./run.sh --light

lint:
  ./run.sh lint

typecheck:
  ./run.sh typecheck --light

build:
  ./run.sh build --light

test:
  ./run.sh test --light

# Print the canonical repository target catalog.
targets:
  ./run.sh targets

clean-artifacts:
  ./run.sh clean-artifacts
