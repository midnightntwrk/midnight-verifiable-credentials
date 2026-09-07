# Configuration

## Configuration shape

The `v1` configuration vocabulary is bounded to:

```ts
interface CredentialConfigurationV1 {
  id: string;
  version: string;
  claimMode: "direct" | "committed" | "mixed";
  holderBinding: "explicit" | "hidden";
  status: "none" | "registry";
  verification: "offchain" | "midnight-contract";
}
```

Configuration MUST NOT select a transport, package locator, executable
provider, wallet API, deployment, or business decision.

## Initial conformance matrix

The first core-only slice verifies reusable primitives, not a complete
production ceremony. This prevents partial experiments from becoming implicit
support commitments.

| Claim mode | Holder binding | Status | Verification | State |
| --- | --- | --- | --- | --- |
| direct | explicit | none | midnight-contract | verified primitives only |
| committed | explicit | none | midnight-contract | verified primitives only |
| mixed | explicit | none | midnight-contract | verified primitives only |
| any | hidden | any | any | unsupported for a production conformance claim |
| any | any | registry | any | unsupported until freshness and authority semantics are complete |
| any | any | any | offchain | unsupported until a canonical verifier operation and vectors exist |

`verified primitives only` is not a complete configuration conformance claim.
A configuration becomes supported only after its issuer-to-holder-to-verifier
round trip and required negative vectors are recorded in the conformance
manifest.

An implementation MUST return an explicit unsupported result for every
configuration that is not listed as supported. It MUST NOT silently downgrade
holder binding, status, or verification location.

