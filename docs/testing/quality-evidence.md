# VC quality evidence

Status: bounded evidence catalog, not a production-readiness claim.

This document and `quality-evidence.json` are the machine-checked authority for
quality measurements that have actually been run against a repository base.
They deliberately distinguish measured evidence from work that was not run or
is blocked by unavailable infrastructure.

## Evidence contract

Each row has:

- a stable `id`, `category`, and `scope` identifier;
- `commandStatus`: `defined` or `undefined`; defined rows carry the exact
  runnable command, while unavailable tooling uses `command: null` and an
  explicit undefined status;
- `status`: `measured`, `not-run`, or `blocked`;
- a metric name, unit, and numeric value when measured (otherwise `value` is
  `null`); measured rows also identify a retained report, its SHA-256 digest,
  and the run identifier that produced it;
- an accountable `owner`, review status, and regression `budget` record; and
- the repository `baseSha` and observation date inherited from the manifest.

The CI lint step passes an explicit base contract through
`QUALITY_EVIDENCE_CI_EVENT`, `QUALITY_EVIDENCE_BASE_REF`,
`QUALITY_EVIDENCE_BASE_SHA`, and the push-only immutable
`QUALITY_EVIDENCE_PUSH_BEFORE_SHA`, and uses `fetch-depth: 0`:
- `pull_request` passes the PR base ref and event-captured SHA; the ref must
  resolve in the checkout, while the SHA is validated as an available ancestor.
- `push` passes the pushed branch ref and immutable event `before` SHA. The
  checker binds the SHA to `QUALITY_EVIDENCE_PUSH_BEFORE_SHA` and verifies it
  is an ancestor of the pushed HEAD.
- `workflow_dispatch` passes the selected ref and current SHA. The selected ref
  must be an explicit branch or tag ref and the SHA must equal the checkout
  HEAD; this is a validation mode, not an unknown-event bypass.
- local runs use the manifest's checked-in `baseRef` and `baseSha` and require
  exact ref resolution plus ancestry.

Missing or malformed CI base inputs fail closed. The checker does not execute
commands or infer a measurement from a command name or from a green package
declaration.

## Status rules

- `measured` means the defined command completed and produced the stated
  metric, with retained report provenance and review evidence.
- `not-run` means the metric is defined but no result is claimed for this
  checkout; `commandStatus: undefined` is allowed when no runnable harness has
  been established.
- `blocked` means a required tool, service, or product prerequisite is not
  available. The row must explain the blocker.

A missing Docker proof server, mobile runtime, published consumer, or stable
production profile is recorded as `blocked` or `not-run`; it is never replaced
with a guessed value. This catalog does not establish production support,
latency, coverage, mutation score, proof throughput, or mobile download
budgets.

## Review and budget fields

Every row records an `owner`, a `review` object, and a `budget` object even when
those decisions are pending. `review.status: pending` and
`budget.status: unset` are explicit gaps, not approvals. A later quality or
support decision may replace them with named reviewers and numeric budgets.

## Running the checker

```sh
pnpm run check:quality-evidence
```

The checker validates the JSON shape, allowed statuses and metric fields,
scope/command identity, review and budget records, and base ancestry. It does
not execute every evidence command; each command remains the evidence owner's
responsibility.

## CI base-history recovery

For `push` events, `QUALITY_EVIDENCE_BASE_SHA` is the event's `before` SHA and
must be the parent boundary of the pushed range, not merely any older ancestor.
The workflow rejects GitHub's all-zero `before` SHA for a newly created branch.
If a force-push or rewritten history makes that boundary unavailable, rerun the
lint evidence check through `workflow_dispatch` against the selected branch or
tag; dispatch validates the selected ref's current HEAD directly.
