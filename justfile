set dotenv-load := false
set shell := ["bash", "-euo", "pipefail", "-c"]

pi_web_version := env_var_or_default("PI_WEB_VERSION", "1.202607.3")

# List available targets.
default:
  @just --list

# Bootstrap the repo for day-to-day development and Pi/PI WEB usage.
bootstrap: deps pi-bootstrap pi-web-bootstrap

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

# Install the pinned PI WEB browser UI into the repo-local Pi prefix.
pi-web-bootstrap:
  @mkdir -p .pi/nix-global
  @if [ ! -x "$PWD/.pi/nix-global/bin/pi-web" ]; then \
    echo "Installing PI WEB {{pi_web_version}}..."; \
    npm install -g --prefix "$PWD/.pi/nix-global" --allow-scripts=node-pty "@jmfederico/pi-web@{{pi_web_version}}"; \
  else \
    echo "repo-local PI WEB available: $("$PWD/.pi/nix-global/bin/pi-web" --version 2>/dev/null || echo unknown)"; \
  fi
  @spawn_helpers="$PWD/.pi/nix-global/lib/node_modules/@jmfederico/pi-web/node_modules/node-pty/prebuilds"; \
  if [ -d "$spawn_helpers" ]; then find "$spawn_helpers" -type f -name spawn-helper -exec chmod +x {} +; fi

# Force-refresh the repo-local pi.dev installation.
pi-update:
  npm install -g --prefix "$PWD/.pi/nix-global" --ignore-scripts @earendil-works/pi-coding-agent@latest

# Force-refresh the pinned PI WEB installation.
pi-web-update:
  npm install -g --prefix "$PWD/.pi/nix-global" --allow-scripts=node-pty "@jmfederico/pi-web@{{pi_web_version}}"
  @spawn_helpers="$PWD/.pi/nix-global/lib/node_modules/@jmfederico/pi-web/node_modules/node-pty/prebuilds"; \
  if [ -d "$spawn_helpers" ]; then find "$spawn_helpers" -type f -name spawn-helper -exec chmod +x {} +; fi

pi-web-doctor:
  pi-web doctor

pi-web-install:
  pi-web install

pi-web-status:
  pi-web status

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
