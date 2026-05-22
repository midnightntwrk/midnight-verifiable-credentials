# @midnight-ntwrk/midnight-did-university-reporting

> Maturity: `demo`
> Package class: `dist`

Status:

- compact summary package for the university use-case artifact set
- consumes existing readable-lane, transcript-export, stress-summary, and batch-sweep outputs

Purpose:

- produce one deterministic handoff summary instead of asking readers to inspect
  Serenity JSON, transcript exports, and benchmark summaries separately
- keep the reporting surface machine-readable and CI-friendly while still
  emitting a concise Markdown digest for humans

Scope:

- summarize the latest unique Serenity university scenarios by title
- summarize the readable university protocol transcript export
- summarize the 100-student protocol stress summary
- summarize the issuance batch-sweep benchmark output
- emit a deterministic source-artifact manifest with file counts, byte sizes,
  schema versions, producers, and SHA-256 digests
- expose a checked handoff contract so `summary.md` is the primary human
  surface, `summary.json` is the primary machine surface, and
  `artifact-manifest.json` is the source-evidence index
- emit `midnight-university-report-summary.v4`; v4 requires the `handoff`
  contract, so regenerate cached v3 `summary.json` artifacts with
  `./run.sh university-summary` before validating them with this package
- highlight the slowest scenario and the dominant timing bottlenecks
- fail fast when a required source artifact is missing; rerun the documented
  producer lane instead of publishing a partial report
- require callers to pass `artifactBaseDirectory` so manifest paths stay
  portable and do not depend on the process working directory

Build and test:

- operator guide for the full artifact handoff:
  - [`../operator-guide.md`](../operator-guide.md)
- root lane:
  - `./run.sh university-summary`
  - `./run.sh university-summary --light`
- `npm run lint -w ./packages/use-cases/university/reporting`
- `npm run typecheck -w ./packages/use-cases/university/reporting`
- `npm run test:ci -w ./packages/use-cases/university/reporting`
- `npm run build -w ./packages/use-cases/university/reporting`
- render summary from artifacts:
  - `npm run render:summary -w ./packages/use-cases/university/reporting`
  - outputs:
    - `./packages/use-cases/university/reporting/target/summary.json`
    - `./packages/use-cases/university/reporting/target/summary.md`
    - `./packages/use-cases/university/reporting/target/artifact-manifest.json`
    - `./packages/use-cases/university/reporting/target/artifact-manifest.md`
