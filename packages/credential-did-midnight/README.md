# @midnight-ntwrk/credential-did-midnight

Composable Midnight DID binding for the protocol-independent VC/VP primitives
in `@midnight-ntwrk/credential-compact`.

The TypeScript adapter resolves an on-chain `did:midnight` document through an
injected `@midnight-ntwrk/midnight-did` resolver. It binds a subject-owned native
Jubjub verification method to the core `VerificationMethodRef`, the observed DID
state version, and one supported verification relationship. It does not sign,
deploy, mutate a DID, select a trust policy, or call another contract.

> **Ledger 8 security boundary:** this package's binding circuits compare DID
> references and keys; they do not verify signatures or prove that resolved DID
> state is current. Always compose them with the matching core context-proof
> circuit over a root recomputed from the complete VC/VP input, then pin the
> accepted binding root or verify an authority-signed descriptor.

```ts
import {
  createMidnightDIDSignerDescriptor,
  resolveMidnightDIDMethodBinding,
} from "@midnight-ntwrk/credential-did-midnight";
import {
  AuthorizationState,
  SignerRole,
} from "@midnight-ntwrk/credential-compact";

const method = await resolveMidnightDIDMethodBinding({
  resolver,
  did,
  verificationMethodId: "#issuer-key",
  relationship: "assertionMethod",
});

const descriptor = createMidnightDIDSignerDescriptor(method, {
  authorizationId,
  decisionSequence: 1n,
  state: AuthorizationState.active,
  role: SignerRole.issuer,
  scopeCommitment,
  policyCommitment,
});
```

`methodId` is `SHA-256(UTF-8(fragment))` over the exact canonical,
case-sensitive fragment, including `#`. Only on-chain Midnight DIDs are
accepted because the core controller is a Compact `ContractAddress`.

## Compact composition

Add each installed package's `dist` directory to the Compact compiler search
path. On Unix-like systems, for example:

```bash
compact compile --compact-path \
  "node_modules/@midnight-ntwrk/credential-compact/dist:node_modules/@midnight-ntwrk/credential-did-midnight/dist" \
  src/contract.compact managed/contract
```

Use the standalone entrypoint when the consumer does not already include the VC
core:

```compact
include "did-midnight";
```

Use the composition entrypoint when assembling a larger contract. Include the
core root exactly once, then this extension:

```compact
include "credentials/composable";
include "did-midnight/composable";
```

The extension exports `MidnightDIDMethodBinding`,
`MidnightDIDHolderBinding`, and circuits that validate the method binding, bind
a proof or holder, bind an authorized signer descriptor, and derive a stable
binding root.

The exported `assertMidnightDID*` circuits are low-level equality checks, not
proof-of-possession checks. For issuance use
`VC<>::assertValidCredentialProof` or `VC<>::assertAuthorizedIssuerProof`. For
presentation, validate the complete presentation, derive its body root, and
invoke `assertValidPresentationContextProof` in addition to the DID holder
binding. Authority and verifier decisions likewise require the core
`assertValidSignerAuthorizationProof` or `assertAuthorizedVerifierProof`
circuit.

## Ledger 8 trust boundary

These circuits prove internal consistency between values already supplied to a
consumer contract. They cannot query the DID contract on Ledger 8 and therefore
do not prove that a method is current. The consumer must pin an accepted binding
root or verify an authority-signed descriptor before relying on it. DID and
Trust Registry policy stays outside this package.

The supported build profile is Compact `0.31.1`, runtime `0.16.0`, and Ledger
`8.0.2`. Ledger 9 cross-contract validation is future work.
