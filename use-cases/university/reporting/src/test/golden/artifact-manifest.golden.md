# University Artifact Manifest

- schema version: midnight-university-artifact-manifest.v1
- artifact set: midnight-university-reporting-inputs
- total bytes: 100202

| artifact | format | schema version | files | bytes | sha256 | produced by |
| --- | --- | --- | ---: | ---: | --- | --- |
| Readable BDD Serenity JSON | serenity-json-directory | n/a | 13 | 2778 | 3885403dcd926e8fff77fb5de5b33b6cf3d19e540628f9bc240b670339c3ce72 | `./run.sh university-bdd` |
| Readable protocol transcript export | university-json-artifact | midnight-university-protocol-export.v1 | 1 | 74769 | d7c552e47e5d25b903863ff043b53718ac63dd16b6258d9879fa329421a84d19 | `./run.sh university-protocol-export` |
| Stress protocol summary | university-json-artifact | midnight-university-protocol-stress-summary.v2 | 1 | 13157 | 5608739ffce092e607263e782cafb1a2bb4148a2362b797a4723228b57215424 | `./run.sh university-protocol-stress` |
| Issuer batch-sweep summary | university-json-artifact | midnight-university-batch-sweep-summary.v2 | 1 | 9498 | 702093b9bedc9cc8631356b55e0635178382a3f06a387b9c28d5ea263657fab7 | `./run.sh university-batch-sweep` |

## Purposes
- readable-bdd-serenity: Readable university BDD scenario JSON; 13 latest scenario titles are summarized by the report
- readable-protocol-transcript: student, issuer, employer, and mall protocol DTO transcript
- stress-protocol-summary: 100-student throughput and rejection summary
- issuer-batch-sweep-summary: batch size and compile-concurrency projection summary

## Notes
- Hashes are deterministic SHA-256 digests over source artifact bytes.
- The Serenity directory hash includes each JSON filename before its file bytes so renamed files change the digest.
- The manifest is an index over already-rendered artifacts; missing source artifacts fail summary rendering instead of producing partial reports.

