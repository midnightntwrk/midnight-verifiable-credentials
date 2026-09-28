# Quickstart

## Prerequisites

- Node.js 24 or newer
- pnpm 10.34.5 or newer
- Compact `0.31.1` when consuming the Compact package

## Install

When a consumer needs the complete model, Compact, and Midnight DID graph, use
this guarded function. It requires every stable tag to remain on the version
the consumer explicitly approved and records that version exactly:

```bash
install_stable_graph() (
  set -euo pipefail
  EXPECTED_STABLE="${1:?usage: install_stable_graph VERSION}"
  NPM_REGISTRY=https://registry.npmjs.org/
  MODEL_STABLE="$(npm view --registry "$NPM_REGISTRY" @midnight-ntwrk/credential-model dist-tags.latest)"
  COMPACT_STABLE="$(npm view --registry "$NPM_REGISTRY" @midnight-ntwrk/credential-compact dist-tags.latest)"
  DID_STABLE="$(npm view --registry "$NPM_REGISTRY" @midnight-ntwrk/credential-did-midnight dist-tags.latest)"
  if [[ "$MODEL_STABLE" != "$EXPECTED_STABLE" || \
    "$COMPACT_STABLE" != "$EXPECTED_STABLE" || \
    "$DID_STABLE" != "$EXPECTED_STABLE" ]]; then
    printf 'refusing unapproved stable graph: expected=%s model=%s compact=%s did=%s\n' \
      "$EXPECTED_STABLE" "$MODEL_STABLE" "$COMPACT_STABLE" "$DID_STABLE" >&2
    exit 1
  fi
  pnpm add -E \
    "@midnight-ntwrk/credential-model@${MODEL_STABLE}" \
    "@midnight-ntwrk/credential-compact@${MODEL_STABLE}" \
    "@midnight-ntwrk/credential-did-midnight@${MODEL_STABLE}"
)

install_stable_graph 0.2.0
```

If the consumer only needs protocol-neutral family and claim-schema metadata,
install only the model package:

```bash
pnpm add -E @midnight-ntwrk/credential-model@latest
```

Keep the package graph on one exact version for reproducible credential-family
builds. The moving `rc` dist-tag may identify a prerelease older or newer than
`latest`; inspect it before opting in:

```bash
NPM_REGISTRY=https://registry.npmjs.org/
MODEL_RC="$(npm view --registry "$NPM_REGISTRY" @midnight-ntwrk/credential-model dist-tags.rc)"
COMPACT_RC="$(npm view --registry "$NPM_REGISTRY" @midnight-ntwrk/credential-compact dist-tags.rc)"
DID_RC="$(npm view --registry "$NPM_REGISTRY" @midnight-ntwrk/credential-did-midnight dist-tags.rc)"
printf 'model=%s compact=%s did=%s\n' "$MODEL_RC" "$COMPACT_RC" "$DID_RC"
```

Only after confirming that all three `rc` tags identify the prerelease graph you
intend to evaluate, record that exact version as `EXPECTED_RC`. The guarded
install rechecks every moving tag against that approved version before using the
immutable version:

```bash
(
  set -euo pipefail
  NPM_REGISTRY=https://registry.npmjs.org/
  EXPECTED_RC=0.3.0-rc1 # Replace with the version inspected above.
  MODEL_RC="$(npm view --registry "$NPM_REGISTRY" @midnight-ntwrk/credential-model dist-tags.rc)"
  COMPACT_RC="$(npm view --registry "$NPM_REGISTRY" @midnight-ntwrk/credential-compact dist-tags.rc)"
  DID_RC="$(npm view --registry "$NPM_REGISTRY" @midnight-ntwrk/credential-did-midnight dist-tags.rc)"
  if [[ -z "$EXPECTED_RC" || "$MODEL_RC" != "$EXPECTED_RC" || \
    "$COMPACT_RC" != "$EXPECTED_RC" || "$DID_RC" != "$EXPECTED_RC" ]]; then
    printf 'refusing unapproved RC graph: expected=%s model=%s compact=%s did=%s\n' \
      "$EXPECTED_RC" "$MODEL_RC" "$COMPACT_RC" "$DID_RC" >&2
    exit 1
  fi
  pnpm add -E \
    "@midnight-ntwrk/credential-model@${EXPECTED_RC}" \
    "@midnight-ntwrk/credential-compact@${EXPECTED_RC}" \
    "@midnight-ntwrk/credential-did-midnight@${EXPECTED_RC}"
)
```

Use those install commands only when the reported `rc` versions are the exact
prerelease graph you intend to evaluate. Prerelease adoption should not happen
implicitly.

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

For Midnight DID-aware contracts, include either the binding package's
standalone `./did-midnight.compact` root or include the core composable root
once followed by `./did-midnight/composable.compact`.

## Verify the Repository

From a source checkout:

```bash
pnpm install --frozen-lockfile
./run.sh --light
./run.sh docs
```
