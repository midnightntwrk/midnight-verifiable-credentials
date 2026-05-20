# University Cohort Dataset

Purpose:

- named profile id: `cohort-30`
- exercise a richer 30-student university cohort without making the BDD report as heavy as `stress-100`
- increase verifier, requested-role, award, faculty, credit, and mall-discount outcome diversity
- keep protocol profile summaries readable through sampled transcript views

Shape:

- 30 graduating students
- 6 company verifiers across 3 request-policy presets
- 3 issuance batches of 10 students
- 10 mall-discount applicants with mixed accepted/rejected outcomes

Boundary:

- this profile is intended for protocol/export/reporting maturity checks, not the primary human-readable Serenity BDD lane
- use `readable-10` when every actor thread should remain small enough to inspect end to end
- use `stress-100` when issuer and employer verifier throughput is the primary signal
