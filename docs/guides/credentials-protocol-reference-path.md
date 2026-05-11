# `credentials-protocol` Reference Path

Status:

- current production-shaped reference path
- Node/runtime-only orchestration guidance

Purpose:

- name one concrete `credentials-protocol` wiring pattern that closes the loop
  across:
  - non-deterministic randomness
  - persistent protocol state
  - restart-safe replay behavior
- keep the path smaller than a full transport integration while still being
  stronger than checklist-only guidance

## Exported helper surface

The current reference path is built from these exports in
[`components/orchestration/protocol/src/index.ts`](/private/tmp/vc-core-redesign-plan/components/orchestration/protocol/src/index.ts):

- `NodeCryptoRandomnessSource`
- `createStableJsonProtocolStateStore(...)`
- `createNodeFileBackedProtocolStateStore(...)`
- `createNodeFileBackedProtocolPartyDependencies(...)`

Supporting storage/runtime pieces:

- [`FileSystemProtocolStateByteStore`](/private/tmp/vc-core-redesign-plan/components/orchestration/protocol/src/adapters/file-protocol-state-store.ts)
- [`StableJsonProtocolStateCodecResolver`](/private/tmp/vc-core-redesign-plan/components/orchestration/protocol/src/adapters/json-protocol-state-codec.ts)

## What this path guarantees

Today this reference path gives you:

1. cryptographically strong runtime randomness from `node:crypto`
2. stable JSON serialization for `bigint` and `Uint8Array`-heavy protocol
   state
3. file-backed per-party storage that survives ordinary process restarts
4. explicit replay retention when the agent supports retained finalized
   outcomes
5. checked-in restart/replay tests that exercise the path end to end

It does not claim:

- a finished wire protocol
- distributed locking or multi-process coordination
- HSM-backed key management
- final status/revocation transport interoperability

## Recommended topology

Use one state root per party:

```text
protocol-state/
  issuer/
  holder/
  verifier/
```

Then create one dependency bundle per party:

```ts
import {
  createNodeFileBackedProtocolPartyDependencies,
} from "@midnight-ntwrk/midnight-did-credentials-protocol";

const issuerDependencies = createNodeFileBackedProtocolPartyDependencies(
  "/var/lib/midnight-vc/issuer",
);
const holderDependencies = createNodeFileBackedProtocolPartyDependencies(
  "/var/lib/midnight-vc/holder",
);
const verifierDependencies = createNodeFileBackedProtocolPartyDependencies(
  "/var/lib/midnight-vc/verifier",
);
```

## Explicit-holder reference shape

```ts
import {
  HolderAgent,
  IssuerAgent,
  MessageBus,
  createNodeFileBackedProtocolPartyDependencies,
} from "@midnight-ntwrk/midnight-did-credentials-protocol";

const bus = new MessageBus();

const issuer = new IssuerAgent(
  issuerProfile,
  bus,
  createNodeFileBackedProtocolPartyDependencies("/var/lib/midnight-vc/issuer"),
);

const holder = new HolderAgent(
  holderProfile,
  bus,
  createNodeFileBackedProtocolPartyDependencies("/var/lib/midnight-vc/holder"),
);
```

If the holder restarts, recreate it with the same directory:

```ts
const restartedHolder = new HolderAgent(
  holderProfile,
  bus,
  createNodeFileBackedProtocolPartyDependencies("/var/lib/midnight-vc/holder"),
);
```

The checked-in proof for this path is:

- [`node-reference-path.test.ts`](/private/tmp/vc-core-redesign-plan/components/orchestration/protocol/src/test/reference/node-reference-path.test.ts)
  - `recovers explicit-holder credentials across restart with file-backed JSON state and crypto randomness`

## Secret-holder reference shape

When you need replay-safe finalized outcomes, add explicit retention:

```ts
import {
  SecretHolderAgent,
  SecretIssuerAgent,
  VerifierAgent,
  createNodeFileBackedProtocolPartyDependencies,
} from "@midnight-ntwrk/midnight-did-credentials-protocol";

const issuer = new SecretIssuerAgent(
  issuerProfile,
  bus,
  createNodeFileBackedProtocolPartyDependencies("/var/lib/midnight-vc/issuer"),
);

const holder = new SecretHolderAgent(holderConfig, bus, {
  ...createNodeFileBackedProtocolPartyDependencies("/var/lib/midnight-vc/holder"),
  stateRetention: {
    finalizedOutcomeTtlMs: 60_000n,
    maxFinalizedOutcomes: 16,
  },
});

const verifier = new VerifierAgent(verifierProfile, bus, {
  ...createNodeFileBackedProtocolPartyDependencies("/var/lib/midnight-vc/verifier"),
  stateRetention: {
    finalizedOutcomeTtlMs: 60_000n,
    maxFinalizedOutcomes: 16,
  },
});
```

The checked-in proof for this path is:

- [`node-reference-path.test.ts`](/private/tmp/vc-core-redesign-plan/components/orchestration/protocol/src/test/reference/node-reference-path.test.ts)
  - `re-delivers secret-holder presentation outcomes across verifier restart with file-backed JSON state and crypto randomness`

## Deployment rules

Treat this path as the current minimum bar for a production-shaped claim:

1. do not use `unsafeReferenceDeterministicRandomnessSource`
2. do not use `InMemoryProtocolStateStore` when restart or delayed delivery
   matters
3. keep one protocol-state directory per party
4. set explicit `stateRetention` when replayed outcomes matter
5. pass explicit `currentDay` / `currentTimeMs` when expiry policy matters
6. define your real transport boundary separately

## Current limitations

- the file-backed store is synchronous and local-process oriented
- this path assumes one runtime instance owns each party directory
- the package still does not define a final external OIDC / DIDComm contract
- status-aware transport behavior remains a separate integration concern

## Local validation

```bash
npm run test:ci -w components/orchestration/protocol
npm exec -w components/orchestration/protocol -- vitest run src/test/reference/node-reference-path.test.ts
```
