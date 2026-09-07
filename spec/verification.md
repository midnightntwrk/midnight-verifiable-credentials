# Verification

A verifier evaluates a presentation against the exact request and credential
configuration. It MUST validate structure before cryptographic acceptance and
MUST fail closed on malformed, unsupported, or indeterminate security input.

The core result reports only:

- well-formed or malformed;
- cryptographically valid, invalid, or indeterminate;
- disclosure and predicate satisfaction;
- holder-binding validity; and
- status validity, invalidity, indeterminacy, or absence when not required.

It MUST NOT contain HTTP status, redirect state, retry state, workflow state,
ledger mutation, protected-action identity, or a business approval decision.

Verification MUST reject domain/context substitution, proof-key mismatch,
request/challenge mismatch, schema mismatch, holder-binding mismatch, expiry,
and required status evidence that is missing, stale, unauthorized, or invalid.

The complete generic verifier operation is currently unsupported. Existing
pure Compact assertions are lower-level evidence only.

