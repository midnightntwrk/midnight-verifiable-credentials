# Canonical Encoding

Compact values and the active Compact compiler/runtime define canonical field
layout and `persistentHash` semantics. JSON is never a canonical signing input.

The TypeScript boundary frames Compact runtime `Value` chunks as:

1. ASCII magic `MCV1`;
2. a big-endian unsigned 32-bit chunk count; and
3. for every chunk, a big-endian unsigned 32-bit length followed by its bytes.

The byte sequence is encoded as canonical unpadded base64url and identified by
`compact-value-v1.base64url`. Decoders MUST reject an invalid magic value,
truncation, non-canonical base64url, trailing bytes, and descriptor leftovers.

Typed decoding is also descriptor-canonical. After a descriptor consumes every
chunk, the decoder MUST re-encode the decoded value with that descriptor and
reject the payload unless the re-encoded payload is byte-for-byte identical.
This rejects alternate chunk widths, including redundant zero padding, that a
Compact runtime descriptor could otherwise normalize to the same typed value.
It also fails closed when a descriptor's decode/encode round trip is lossy.

Untyped decoding cannot infer descriptor-relative widths and therefore remains
width-preserving: `decodeCompactValue` returns the framed chunks exactly as
supplied after transport-level validation. Callers that require typed
canonicality MUST use `decodeCompactPayload` with the expected descriptor.

The `bytes32-descriptor` conformance vectors use `CompactTypeBytes(32)` from
the Compact runtime version pinned by `@midnight-ntwrk/credential-compact`.
For that descriptor, the canonical chunk ends at the final non-zero byte and
an all-zero value uses an empty chunk. Zero-padded alternatives are invalid
even when the descriptor can normalize them to the same 32-byte value.

Context tags, proof payload roots, and Schnorr challenges are defined in
[`proof-semantics.md`](./proof-semantics.md). Issuance, presentation, signer
authorization, and verifier-request proofs MUST use different tags. The checked
vectors in
[`../conformance/vectors/compact-generated.json`](../conformance/vectors/compact-generated.json)
are produced by generated Compact circuits and verified by TypeScript.

This draft does not define a portable external encoding for arbitrary generic
VC/VP types. Credential families own any encoding beyond the Compact value
framing defined here.
