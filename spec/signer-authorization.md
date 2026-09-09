# Signer Authorization

## Purpose

VC and VP proof validity establishes control of the public key carried by the
proof. It does not establish that an application accepts that key as an issuer
or verifier. Signer authorization is the optional, source-neutral binding
between an exact verification method/key, a role, and a scope.

A consumer MAY verify VC proofs without applying signer authorization. Such a
result is a cryptographic-validity result only and MUST NOT be represented as a
trust-policy decision.

## Authorization sources

A consumer MAY obtain an authorization descriptor from local application
governance or from an external authority such as a Trust Registry. The source
does not change credential or presentation proof semantics.

When local governance installs a descriptor, the consuming contract owns the
authorization lifecycle. When an external authority supplies a descriptor,
the consumer MUST verify a domain-separated authority proof against a locally
configured verification method and public key before materializing it.

Ledger 8 consumers cannot synchronously call DID or Trust Registry contracts.
They therefore MUST keep the accepted descriptor or authority key in their own
ledger state. Relayers MAY transport signed decisions but MUST NOT be treated
as authorities.

## Authorized signer descriptor

An authorized signer descriptor contains:

- `version`, which MUST be `1`;
- a non-zero `authorizationId` identifying one decision lifecycle;
- a positive `decisionSequence` ordering updates in that lifecycle;
- an authorization `state` of active, suspended, or revoked;
- a signer `role` of issuer or verifier;
- the exact `VerificationMethodRef` and native Jubjub public key;
- a positive `didStateVersion` recording the `midnight-did` state observed by
  the authorization source;
- the DID verification relationship checked by that source;
- a non-zero `scopeCommitment`; and
- a non-zero, opaque `policyCommitment`.

The public keys in both signer descriptors and authority anchors MUST be valid
Jubjub prime-subgroup points and MUST NOT be the identity point.

### Midnight DID method references

`midnight-did` stores a verification-method identifier as a canonical fragment
reference in `Opaque<"string">`, whereas the VC core uses a fixed-width
`Bytes<32>` method reference. An adapter MUST set
`VerificationMethodRef.controllerAddress` to the exact Midnight DID contract
address and MUST set `methodId` to:

```text
SHA-256(UTF-8(canonical midnight-did fragment identifier))
```

The input is the exact, case-sensitive fragment stored by the Midnight DID
contract, for example `#key-1`. A DID adapter MUST first apply the Midnight DID
package's subject-binding and fragment-normalization rules. The canonical
fragment MUST NOT then be trimmed, case-folded, truncated, or padded. The
authorization source MUST retain that fragment so it can read the matching DID
entry and relationship before signing the descriptor. The conformance vectors
publish canonical fragments and expected 32-byte values.

This mapping is computed off chain. Compact cannot hash an
`Opaque<"string">` into provable state, and Ledger 8 cannot call the DID
contract. The authority signature binds the resulting method reference, key,
DID contract address, and observed DID state version for the consumer.

Issuer authorization MUST use the `assertionMethod` verification relationship.
Verifier authorization MUST use `authentication` or `capabilityInvocation`.
These requirements describe the authorization source's attestation. The VC
core does not resolve or mutate a DID document.

For issuer authorization, `scopeCommitment` is the canonical persistent hash of
the exact `SchemaRef`. For verifier authorization, it is a consumer-defined
canonical commitment to a protocol-neutral signed request scope. Protocol and
transport definitions remain outside this specification.

Only an active descriptor authorizes an operation. A suspended or revoked
descriptor remains a valid signed lifecycle statement but MUST fail signer
authorization checks.

## Proof binding

An issuer authorization check MUST require all of the following:

1. the descriptor is structurally valid and active;
2. its role is issuer and its relationship is `assertionMethod`;
3. its scope equals the credential schema commitment;
4. the credential issuer verification method equals the proof signer;
5. its verification-method controller and method ID equal the proof signer
   reference; and
6. its Jubjub public key equals `Proof.publicKey`.

`VC<>::assertAuthorizedIssuerProof` accepts the complete credential and derives
its schema, issuer reference, and body root internally before verifying both the
normal issuance-context signature and the authorization binding. Consumers MUST
use this composed helper when making an authorization-aware credential decision.
`assertAuthorizedIssuerDescriptor` is a lower-level signer-and-scope primitive;
it does not verify that a credential carries those fields.

A verifier authorization check verifies a proof over the request scope with
the `midnight:vc:verifier-req:v1` context and applies the same exact method/key
binding. It MUST NOT be applied to the holder's presentation proof as though
the verifier signed the presentation.

## Authority proof

An authority-signed descriptor uses the existing `Proof` structure with the
`midnight:vc:signer-auth:v1` context tag. The proof signs a decision root that
contains the complete canonical descriptor root and the configured authority
`domainCommitment`.

The proof signer reference, public key, and non-zero domain commitment MUST equal
a locally configured authority anchor. The domain commitment MUST uniquely bind
the intended network and consuming contract or registry profile; consumers MUST
NOT reuse a generic value across those domains. `Proof.createdAt` MUST equal
`decisionSequence` under this context. This equality defines sequence semantics
only; it does not establish wall-clock time.

## Time and freshness

Compact integer values and witnesses do not authenticate real-world datetime.
Consequently, `decisionSequence` and `didStateVersion` are logical state
versions, not Unix timestamps.

`issuedAt`, `expiresAt`, and `Proof.createdAt` are signed numeric assertions
unless a consuming application supplies a separately authenticated time source.
An implementation MUST NOT compare a caller- or witness-supplied current time
to an expiry and represent that result as trusted time.

This version defines current-trust semantics: a signer is trusted according to
the newest authorization decision processed by the consumer. Consumers MUST
reject an update whose sequence is not greater than the stored sequence for the
same authorization. They MUST also reject an update whose observed DID state
version is lower than the preceding descriptor. Registry-backed deployments
require a relayer or monitor; revocation is not visible to a Ledger 8 consumer
until the signed update is processed.

Historical claims such as “trusted at issuance time” require an independently
authenticated registry sequence or ledger event and are outside this version.

## DID key rotation

A changed DID key or DID state version does not silently inherit an existing
authorization. The authorization source MUST issue a newer descriptor binding
the replacement method/key before consumers accept it. A consumer that has
processed a newer suspended, revoked, or replacement decision MUST reject
replay of an older active descriptor.

Revocation is terminal for an `authorizationId`. Re-authorizing a previously
revoked signer requires a new authorization ID. Suspension MAY return to active
through a newer authority decision.

## Trust Registry profile

A Trust Registry integration SHOULD sign an envelope containing its registry
identifier, contract address, and the complete descriptor. The consuming
contract MUST commit those registry values together with the network and
consumer identity into its configured authority `domainCommitment`.
Trust Registry policy evaluation, governance, DID resolution, evidence
distribution, and key rotation remain outside the VC core.
