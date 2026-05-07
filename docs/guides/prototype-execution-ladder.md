# Prototype Execution Ladder

This guide gives the shortest current execution path through the VC repository.

Use it when you want to move from orientation to runnable examples without
guessing which package or command should come next.

## 1. Discover the repository targets

From the repository root:

```bash
./run.sh targets
```

That shows the repo-level lanes for lint, typecheck, build, package tests,
BDD, revocation, and Docker-backed integration.

## 2. Start with the smallest verifier contract

Run the smallest verifier-side use case first:

```bash
npm run test:ci -w use-cases/hello-verifier/contract
```

Use this package when you want to understand:

- one verifier request
- one credential family
- one presentation verification path

without business-capability or status-aware complexity.

## 3. Move to the explicit-holder age-gate contract

Next, run the concrete explicit-holder age-gate package:

```bash
npm run test:ci -w use-cases/age-gate/contract
```

This adds:

- business-contract state
- reusable access-capability issuance
- explicit-holder age-gate flow

## 4. Review the happy-path living documentation

Run the BDD smoke lane:

```bash
./run.sh bdd
```

That currently exercises:

- explicit-holder age-gate happy path
- hidden-holder revocation-aware happy path

Open the generated Serenity report:

```bash
open use-cases/age-gate/scenarios/target/site/serenity/index.html
```

## 5. Review the hidden-holder trust boundary failures

Run the negative BDD lane:

```bash
./run.sh bdd-negative
```

That currently covers:

- wrong registry id
- wrong revoked root
- stale authority-attested proof

Use this lane when you want the fastest executable view of the current status
trust boundary rather than the full revocation package test suite.

## 6. Run the full BDD layer

Run the full living-documentation set:

```bash
./run.sh bdd-all
```

This is the simplest single command when you want both:

- the narrated happy paths
- the narrated negative status-boundary scenarios

## 7. Drop to the focused revocation lane

When you need package-level status work rather than narrated scenarios, use:

```bash
./run.sh revocation
```

This is the current focused engineering lane for:

- `credentials`
- `credentials-status-registry`
- `credentials-same-holder`
- `credentials-birth`
- `credentials-birth-secret`
- `use-cases/age-gate/contract`

## 8. Only then move to Docker-backed integration

Use Docker-backed integration only after the smaller local paths are already
green:

```bash
./run.sh integration-demo-contract
./run.sh integration-protocol
```

This keeps the execution path ordered from:

1. smallest verifier
2. concrete business contract
3. narrated happy path
4. narrated negative trust boundary
5. focused revocation package lane
6. full integration
