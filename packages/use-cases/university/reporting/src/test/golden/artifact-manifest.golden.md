# University Artifact Manifest

- schema version: midnight-university-artifact-manifest.v1
- artifact set: midnight-university-reporting-inputs
- total bytes: 89208

| artifact | format | schema version | files | bytes | sha256 | produced by |
| --- | --- | --- | ---: | ---: | --- | --- |
| Readable BDD Serenity JSON | serenity-json-directory | n/a | 13 | 2778 | 3885403dcd926e8fff77fb5de5b33b6cf3d19e540628f9bc240b670339c3ce72 | `./run.sh university-bdd` |
| Readable protocol transcript export | university-json-artifact | midnight-university-protocol-export.v2 | 1 | 63757 | d0e5c135b5a903732daf448069171c5d8fad1e5390d3c4fcd7082efbf5ad53b1 | `./run.sh university-protocol-export` |
| Stress protocol summary | university-json-artifact | midnight-university-protocol-stress-summary.v2 | 1 | 13166 | eca86ee79f5cab71ada40ec9059711c1de243f832d83d4dad8d73826302d970c | `./run.sh university-protocol-stress` |
| Issuer batch-sweep summary | university-json-artifact | midnight-university-batch-sweep-summary.v2 | 1 | 9507 | 7c60f98cbb138ea3ba0c98692a1fd2743f04b64c798193ec0bc640800d1a48fe | `./run.sh university-batch-sweep` |

## Purposes
- readable-bdd-serenity: Readable university BDD scenario JSON; 13 latest scenario titles are summarized by the report
- readable-protocol-transcript: student, issuer, employer, and mall protocol DTO transcript
- stress-protocol-summary: 100-student throughput and rejection summary
- issuer-batch-sweep-summary: batch size and compile-concurrency projection summary

## Notes
- Hashes are deterministic SHA-256 digests over source artifact bytes.
- The Serenity directory hash includes each JSON filename before its file bytes so renamed files change the digest.
- The manifest is an index over already-rendered artifacts; missing source artifacts fail summary rendering instead of producing partial reports.

