#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$repo_root"

python3 <<'PY'
import subprocess
import sys


def run_with_timeout(args, timeout_seconds=5):
    try:
        result = subprocess.run(
            args,
            cwd='.',
            text=True,
            capture_output=True,
            timeout=timeout_seconds,
            check=False,
        )
        return result.returncode, result.stdout, result.stderr, False
    except subprocess.TimeoutExpired as exc:
        stdout = exc.stdout.decode() if isinstance(exc.stdout, bytes) else (exc.stdout or '')
        stderr = exc.stderr.decode() if isinstance(exc.stderr, bytes) else (exc.stderr or '')
        return None, stdout, stderr, True


def ensure(condition, message):
    if not condition:
        print(message, file=sys.stderr)
        sys.exit(1)

help_code, help_stdout, help_stderr, help_timed_out = run_with_timeout(['./run.sh', 'help', '--light'], 5)
ensure(not help_timed_out, 'help --light should not time out')
ensure(help_code == 0, f'help --light exited with {help_code}')
ensure('[run] Warning:' not in help_stderr, 'help --light should not warn')
ensure('full, build, typecheck, test, hello-smoke' in help_stdout, 'help output should list the current light-supported targets')

_, _, lint_stderr, _ = run_with_timeout(['./run.sh', 'lint', '--light'], 3)
ensure("[run] Warning: --light is ignored by target 'lint'" in lint_stderr, 'lint --light should warn that --light is ignored')

_, _, build_stderr, _ = run_with_timeout(['./run.sh', 'build', '--light'], 3)
ensure("[run] Warning: --light is ignored by target 'build'" not in build_stderr, 'build --light should not warn')

_, _, targets_stderr, _ = run_with_timeout(['./run.sh', 'targets', '--light'], 5)
ensure('[run] Warning:' not in targets_stderr, 'targets --light should not warn')
PY
