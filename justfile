set dotenv-load := false
set shell := ["bash", "-euo", "pipefail", "-c"]

# List available targets.
default:
  @just --list

# Bootstrap the repo for day-to-day development.
bootstrap: deps

# Install/update the project workspace dependencies when needed.
deps:
  @if [ ! -d node_modules ] || [ pnpm-lock.yaml -nt node_modules ]; then \
    echo "Installing pnpm dependencies..."; \
    pnpm install --frozen-lockfile; \
  else \
    echo "pnpm dependencies already present"; \
  fi

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
