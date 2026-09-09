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

Context tags are fixed 32-byte Compact values. Issuance, presentation, signer
authorization, and verifier-request proofs MUST use different tags. The checked
vectors in
[`../conformance/vectors/compact-generated.json`](../conformance/vectors/compact-generated.json)
are produced by generated Compact circuits and verified by TypeScript.

This draft does not define a portable external encoding for arbitrary generic
VC/VP types. Credential families own any encoding beyond the Compact value
framing defined here.
