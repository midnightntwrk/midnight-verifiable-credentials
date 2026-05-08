# Credential Family Scaffold Template

Status: starter template for adding a new VC family package.

Use this when the generic `credentials` package is not enough and you need a
schema-specific family with its own claims, requests, and validation rules.

Fastest repo-local path:

```bash
npm run scaffold:family -- --slug example-family
```

That generator creates a minimal repo-aligned package skeleton with:

- package metadata
- TypeScript config
- Compact root and family subfiles
- helper scripts
- placeholder tests

Use this document when you want to inspect or customize the generated shape
before copying it forward.

## Package shape

A minimal family package should have these parts:

```text
credentials-example-family/
├── README.md
├── package.json
├── src/
│   ├── example-family.compact
│   ├── example-family/
│   │   ├── claims.compact
│   │   ├── model.compact
│   │   ├── requests.compact
│   │   └── validation.compact
│   ├── index.ts
│   └── test/
│       ├── capability-profiles.test.ts
│       └── protocol.test.ts
```

## Compact root template

```compact
pragma language_version >= 0.16.0;

import CompactStandardLibrary;
import "../../core/primitives/credentials/src/credentials" prefix Core_;

import "./example-family/claims" prefix Claims_;
import "./example-family/model" prefix Model_;
import "./example-family/requests" prefix Requests_;
import "./example-family/validation" prefix Validation_;

export circuit verifyExampleFamilyPresentationForRequest(
  request: Requests_ExampleFamilyVerificationRequest,
  submission: Requests_ExampleFamilyVerificationSubmission,
): Validation_ExampleFamilyVerificationResult {
  return Validation_verifyExampleFamilyPresentationForRequest(
    request,
    submission,
  );
}
```

## What belongs in the family package

Put these here:

- schema-specific claims and disclosures
- typed issuance and verification request/result shapes
- schema-specific predicates and disclosure rules
- schema-specific holder-binding combinations if the schema really needs them

Do not put these here:

- generic VC envelope types
- generic DID and holder-binding primitives
- transport protocols
- OpenID message framing
- demo/business-contract logic

## Runtime surface rule

Expose only:

- generated/runtime family mirror via `src/index.ts`
- optional `./testing` surface when external packages need fixtures

Avoid:

- cross-package imports from another package's `src/test/**`
- exporting the full transitive `credentials` core surface again unless there is
  a specific compatibility reason

## First tests to add

1. family happy-path verification
2. wrong-issuer rejection
3. wrong-holder-binding rejection
4. challenge mismatch rejection
5. predicate/disclosure boundary tests
6. capability-profile coverage for the intended holder-binding model

## Best current references

Explicit-holder family reference:

- `credentials-birth`

Hidden-holder family reference:

- `credentials-birth-secret`

Capability composition reference:

- `credentials-same-holder`

## Packaging rule

If external consumers need fixtures or test helpers, promote them to an explicit
package surface such as:

- `src/testing.ts`
- `src/testing/...`

Do not rely on sibling imports into `src/test/**`.
