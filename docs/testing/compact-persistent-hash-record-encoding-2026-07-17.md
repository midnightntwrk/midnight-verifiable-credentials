# Compact Persistent-Hash Record Encoding Spike

- Status: accepted implementation input for verification-contract A1
- Date: 2026-07-17
- Scope: TypeScript mirroring of fixed Compact record hashes

## Question

Can TypeScript reproduce
`persistentHash<VerificationTranscriptV1>(transcript)` through a supported
Midnight runtime surface, without inferring the encoding from JSON or generated
samples?

## Finding

Yes. The repository's supported `@midnight-ntwrk/compact-runtime@0.15.0`
dependency publishes:

- `CompactType<A>` for a Compact type's field-aligned runtime representation;
- `CompactTypeBytes` and `CompactTypeUnsignedInteger` for the primitive fields
  used by verification V1; and
- `persistentHash<A>(runtimeType, value)` for the same persistent-hash
  operation exposed by Compact.

The `CompactType` contract explicitly composes values through `alignment()`,
`toValue()`, and destructive `fromValue()` methods. This is the authoritative
runtime encoding surface used by generated Compact code; no byte layout was
recovered from hash outputs.

## Decision

[`verification-v1.ts`](../../packages/core/primitives/credentials/src/verification-v1.ts)
defines ordered record descriptors from those published primitives. Descriptor
order exactly follows the fixed records in
[`verification-contract-v1.md`](../spec/verification-contract-v1.md). The
runtime primitive descriptors own integer and byte encoding, and
`persistentHash` owns hashing.

The TypeScript boundary adds one stricter rule: every `Bytes<32>` input must be
an actual 32-byte `Uint8Array` before it reaches the runtime descriptor. This
prevents shorter arrays from being accepted through Compact's canonical
right-padding behavior when decoding untrusted JavaScript input.

The implementation does not use JSON serialization, string concatenation,
field-value inference, or a repository-local hash algorithm.

## Verification

[`verification-v1.test.ts`](../../packages/core/primitives/credentials/src/test/verification-v1.test.ts)
checks literal vectors for:

- credential, holder, consent, and presentation bindings;
- evidence and anchor-evidence receipt bindings;
- decision-nullifier material;
- the named synthetic extension record; and
- the complete 47-field verification transcript.

Each literal must match both the TypeScript runtime descriptor and the
generated Compact `pureCircuits` implementation. The same suite mutates every
transcript field through the direct Compact path and tests bounded enum,
version, evidence-mode, byte-width, and absence-sentinel failures.

Run the focused gate with:

```bash
pnpm --dir packages/core/primitives/credentials exec vitest run \
  src/test/verification-v1.test.ts
```

## Boundary

This spike proves encoding compatibility only. It does not establish evidence
authority, implement persistent decision-nullifier consumption, or make
`ledger-local-v1` or `ledger-attested-v1` a final verification profile. Those
remain gated by Tracks A2, A3, and their upstream authority dependencies.
