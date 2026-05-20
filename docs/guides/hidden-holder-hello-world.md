# Hidden-Holder Hello World

Status: starter walkthrough for the current reference hidden-holder path.

Purpose:

- show the smallest current repo path for a hidden-holder integration
- separate on-chain from off-chain surfaces clearly
- point at the exact reference packages that own each concern

This is not a production transport guide.
It is the shortest correct orientation path through the current repository.

## Goal

Build a verifier/business contract that accepts a hidden-holder birth
presentation proving `age >= threshold` without revealing the birth date.

## The packages you actually need

On-chain roots:

- `packages/core/primitives/credentials/src/credentials/composable.compact`
- `packages/prototypes/credential-families/birth-secret/src/secret-birth-credential.compact`
- optional: `packages/use-cases/age-gate/contract/src/demo-revocation.compact` as the
  status-aware reference

Off-chain helpers:

- `credentials-birth-secret` generated/runtime exports
- `credentials-protocol` if you want reference agent orchestration
- `credentials-status-registry` only if you are using the current prototype
  status-aware flow

## Step 1: Choose the profile

For a hidden-holder family today, the current reference choice is:

- `credentials-birth-secret`

Use it when:

- the holder should prove control through a hidden secret witness
- the verifier should learn only the disclosed fields and predicate result
- the contract should verify a typed family-specific request

## Step 2: Write the contract against Compact roots

Use a narrow verifier contract:

```compact
import "../../packages/core/primitives/credentials/src/credentials/composable" prefix Core_;
import "../../packages/prototypes/credential-families/birth-secret/src/secret-birth-credential" prefix BirthSecret_;
```

Then consume the family verification entrypoint for a typed request and
submission.

Do not start from managed TypeScript exports when writing the contract.

## Step 3: Build the verifier request off-chain

The verifier/backend prepares:

- the typed verification request
- the challenge / nonce
- the minimum-age threshold
- optional disclosure requirements

This is off-chain work.
The contract verifies the request-bound submission; it does not author the
request for you.

## Step 4: Holder prepares the witness off-chain

The holder wallet/app prepares:

- the hidden holder witness
- the birth-date witness
- any disclosed openings required by the request

This is also off-chain work.
The contract should never derive secret-holder witness material itself.

## Step 5: Contract verifies the family result, then applies business logic

Order matters:

1. verify the family presentation for the typed request
2. check the family verification result
3. apply the contract-specific business rule

That keeps family semantics reusable and business logic local to the contract.

## Current status-aware variant

If you also need revocation/status today:

- keep `registryId` and `revokedRoot` verifier-supplied
- keep freshness policy off-chain
- use the status-aware hidden-holder path from `credentials-birth-secret`
- use `credentials-status-registry` only for off-chain builders and registry
  contract support

The best current contract reference is:

- `packages/use-cases/age-gate/contract/src/demo-revocation.compact`

## On-chain / off-chain split

On-chain:

- family Compact verification entrypoints
- contract state
- final business acceptance rule

Off-chain:

- request construction
- holder witness preparation
- transport and protocol orchestration
- status root selection and optional authority attestation

## What to read next

1. `packages/prototypes/credential-families/birth-secret/README.md`
2. `docs/guides/integration-surface-map.md`
3. `docs/spec/status-verification-protocol.md` if you need status-aware flows
4. `packages/use-cases/age-gate/contract/README.md` for business-contract examples
