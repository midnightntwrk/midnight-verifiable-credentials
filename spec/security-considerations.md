# Security Considerations

Conforming implementations MUST:

- domain-separate issuance and presentation proofs;
- bind proofs to the exact body, verification method, and supplied proof context;
- validate schema and credential-family definitions before accepting proof results;
- reject credential, presentation, holder, and status substitution;
- keep holder secrets, claim openings, signing keys, and prover witnesses out of
  public objects and logs;
- fail closed for malformed input and indeterminate required status;
- authenticate generated artifacts by exact version and digest; and
- use negative vectors for every supported capability.

Adapters own durable replay tracking, secure key storage, transport
authentication, rate limiting, and operational availability. Those controls do
not replace canonical core checks.

The manifest covers individual verified primitives. It MUST NOT be represented
as an end-to-end issuance, presentation, or verification security claim.
