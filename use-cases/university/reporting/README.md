# @midnight-ntwrk/midnight-did-university-reporting

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
- highlight the slowest scenario and the dominant timing bottlenecks

Build and test:

- operator guide for the full artifact handoff:
  - [`../operator-guide.md`](../operator-guide.md)
- root lane:
  - `./run.sh university-summary`
  - `./run.sh university-summary --light`
- `npm run lint -w ./use-cases/university/reporting`
- `npm run typecheck -w ./use-cases/university/reporting`
- `npm run test:ci -w ./use-cases/university/reporting`
- `npm run build -w ./use-cases/university/reporting`
- render summary from artifacts:
  - `npm run render:summary -w ./use-cases/university/reporting`
  - outputs:
    - `./use-cases/university/reporting/target/summary.json`
    - `./use-cases/university/reporting/target/summary.md`
