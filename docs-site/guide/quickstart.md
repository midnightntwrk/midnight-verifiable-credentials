# Quickstart

## Prerequisites

- Node.js 24 or newer
- pnpm 10.34.5 or newer
- Compact `0.31.1` when consuming the Compact package

## Install

Install only the package boundaries the consumer needs:

```bash
pnpm add @midnight-ntwrk/credential-model@rc
pnpm add @midnight-ntwrk/credential-compact@rc
```

Pin exact prerelease versions for reproducible credential-family builds.

## Define Metadata

`credential-model` validates protocol-neutral family and claim-schema metadata:

```ts
import { defineCredentialFamily } from "@midnight-ntwrk/credential-model";

export const membershipFamily = defineCredentialFamily({
  id: "example.membership",
  version: "0.1.0",
  schema: {
    id: "urn:example:membership",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "MembershipCredential"],
    claims: [
      {
        id: "memberId",
        path: ["memberId"],
        disclosure: "selective",
        required: true,
      },
    ],
  },
});
```

## Select a Compact Entrypoint

`credential-compact` publishes exactly two supported Compact roots:

| Entrypoint                         | Use                                                        |
| ---------------------------------- | ---------------------------------------------------------- |
| `./credentials.compact`            | Standalone use of the complete core surface                |
| `./credentials/composable.compact` | Include shared declarations once before family composition |

Use only package exports. Do not import repository `src`, generated `managed`,
or `dist` internals.

## Verify the Repository

From a source checkout:

```bash
pnpm install --frozen-lockfile
./run.sh --light
./run.sh docs
```
