# Security Considerations

Conforming implementations MUST:

- domain-separate issuance and presentation proofs;
- bind proofs to the exact body, challenge, verification method, and context;
- validate schema and configuration before accepting proof results;
- reject request, credential, presentation, holder, and status substitution;
- reject replayed verifier challenges according to adapter policy;
- keep holder secrets, claim openings, signing keys, and prover witnesses out of
  public objects and logs;
- fail closed for unsupported configurations and indeterminate required status;
- authenticate generated artifacts by exact version and digest; and
- use negative vectors for every supported capability.

Adapters own durable replay tracking, secure key storage, transport
authentication, rate limiting, and operational availability. Those controls do
not replace canonical core checks.

No current configuration has complete production conformance. The manifest's
verified primitives MUST NOT be represented as an end-to-end security claim.
