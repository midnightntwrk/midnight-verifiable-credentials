# University CI Matrix

Status: generated lane contract for local runs, CI selection, and artifact retention.

Regenerate this view with:

```bash
npm run --silent build:university-ci-matrix:markdown
```

| Lane | Run target | CI script | Light/artifacts | When to run |
| --- | --- | --- | --- | --- |
| `data-profiles` | `./run.sh university-data-profiles` | `ci:university-data-profiles` | full only<br>artifacts: none | Any change to use-cases/university/data or data-profile registry scripts. |
| `policy-catalog` | `./run.sh university-policy-catalog` | `ci:university-policy-catalog` | full only<br>artifacts: none | Any change to university verifier policies, request presets, or protocol disclosure logic. |
| `bdd-readable` | `./run.sh university-bdd` | `ci:university-bdd` | full only<br>artifacts: `use-cases/university/scenarios/target/site/serenity` | Narrative scenario, BDD step, or readable report behavior changes. |
| `bdd-proof-server-contract` | `./run.sh university-bdd-proof-server` | `ci:university-bdd:proof-server` | full only<br>artifacts: `use-cases/university/scenarios/target/site/serenity` | Proof-backend, proof-server contract, or protocol DTO boundaries change. |
| `bdd-standalone-hybrid` | `./run.sh university-bdd-standalone` | `ci:university-bdd:standalone` | full only<br>artifacts: `use-cases/university/scenarios/target/standalone-timing` | Standalone environment, DID bootstrap, or proof-backend timing changes. |
| `batch-sweep` | `./run.sh university-batch-sweep` | `ci:university-batch-sweep` | full only<br>artifacts: `use-cases/university/scenarios/target/batch-sweep/summary.json` | Issuer batching, batch metrics, or reporting summary inputs change. |
| `protocol` | `./run.sh university-protocol` | `ci:university-protocol` | light profile: `managed-university-protocol`<br>artifacts: none | Protocol agents, transports, persistence, proof backend, or transcript logic changes. |
| `protocol-export` | `./run.sh university-protocol-export` | `ci:university-protocol:export` | light profile: `managed-university-protocol-export`<br>artifacts: `use-cases/university/protocol/target/readable-10/transcript-export.json`, `use-cases/university/protocol/target/readable-10/transcript-export.md`, `use-cases/university/protocol/target/readable-10/application-decisions-export.json`, `use-cases/university/protocol/target/readable-10/application-decisions-export.md` | Transcript schema, application decision schema, or export formatting changes. |
| `protocol-cohort` | `./run.sh university-protocol-cohort` | `ci:university-protocol:cohort` | light profile: `managed-university-protocol-cohort`<br>artifacts: `use-cases/university/protocol/target/cohort-30` | Cohort data, profile summary schema, or sampled transcript behavior changes. |
| `protocol-stress` | `./run.sh university-protocol-stress` | `ci:university-protocol:stress` | light profile: `managed-university-protocol-stress`<br>artifacts: `use-cases/university/protocol/target/stress-100` | Stress data, throughput summary, or protocol profile performance behavior changes. |
| `summary` | `./run.sh university-summary` | `ci:university-summary` | light profile: `managed-university-summary`<br>artifacts: `use-cases/university/reporting/target` | Reporting package, summary schema, or aggregate artifact wiring changes. |
| `ci-matrix-contract` | `./run.sh university-ci-matrix` | `ci:university-ci-matrix` | full only<br>artifacts: none | Any run.sh, package.json, workflow, or university lane contract change. |

The GitHub Actions `University Validation` job runs the committed data/profile, policy, cohort, and stress profile lanes when university-relevant files change, then uploads `university-protocol-targets` containing the generated cohort and stress summaries.
