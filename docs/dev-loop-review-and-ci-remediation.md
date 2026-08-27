# Dev-loop external review and CI remediation

`dev-loops` 0.9.0 runs `external-review` as a mandatory angle in both the draft
and pre-approval gates. The angle's configured reviewer must run the local,
read-only command `codex review --base origin/develop` against the current PR
head and return actionable findings (or `No findings`). PR lifecycle commands
must explicitly use `--base develop`; the installed dev-loops schema has no
repository-base setting.

`@input-output-hk/agent-review-pi@0.6.0` is supported by the pinned Pi 0.84.2
host as an optional user-scoped operator package. It is not a project
`.pi/settings.json` dependency, so it does not require every checkout to
authenticate to GitHub Packages. Bot-expedite and taskflow operation must
remain propose-only by default; do not enable `autonomy: auto` or merge through
these tools. `.devloops`'s `autonomy.humanMergeOnly` setting and branch
protection remain the authorization boundaries.

## Watched PR remediation contract

Treat a meaningful push (product, test, configuration, or workflow change) and
a review-driven update as a new-head boundary. After either event:

1. re-enter CI triage for the new current head; previous-head checks do not
   unblock it;
2. use `npx dev-loops@0.9.0 loop watch-ci --repo <owner/name> --pr <number>`
   for pending provider-agnostic CI, and stop to investigate a failure rather
   than waiting on it;
3. triage fixable failures, make at most one focused fix commit per cycle,
   validate locally before pushing, then restart CI triage for that pushed head;
4. re-run the mandatory external-review angle after the update; and
5. do not mark the PR ready before validation, and never merge automatically.

Select local validation through `AGENT.md`. `./run.sh --light` is the baseline only when that document requires a repository stability check for the changed surface; documentation, Nix, and agent-instruction-only changes use their applicable static, Nix, and link checks. Add full or integration validation only when `AGENT.md` requires it for an integration-sensitive change.

## Supported-config limit

The installed `@dev-loops/core` 0.9.0 schema supports gate angles/personas,
workflow draft-first/retrospective settings, and human-only merge boundaries.
It does not support `repository`, `externalReview`, `ciWatch`, review-trigger,
CI polling, CI-fix-loop, or validation configuration keys. Those former
unsupported `.devloops` blocks are deliberately not retained: this bounded
workflow contract carries their policy, while the supported mandatory gate
angle carries the required local CLI review instruction. CI watcher duration,
polling, and retry behavior remain the installed helper defaults rather than
project-invented settings.
