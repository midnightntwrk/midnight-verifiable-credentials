# @midnight-ntwrk/credential-model

> Maturity: `core`
> Package class: `dist`
> Release stage: `candidate`

Protocol-neutral TypeScript contracts for defining a credential family without
depending on Compact, a ledger, a wallet, a transport, or generated family
types.

The package provides:

- schema and claim descriptors;
- holder-binding, status, proof, and presentation capability descriptors;
- credential and presentation codec ports;
- proof-artifact requirements;
- bounded package composition manifests;
- validation helpers and family-neutral errors.

## Install

The candidate is currently validated as an isolated tarball. Registry
publication requires the separate release-enablement change.

## Define a family

```ts
import {
  defineCredentialFamily,
  type CredentialCodec,
  type PresentationCodec,
} from "@midnight-ntwrk/credential-model";

interface EmployeeCredential {
  employeeId: string;
}

interface EmployeePresentation {
  employeeId: string;
}

const credentialCodec: CredentialCodec<EmployeeCredential, string> = {
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: (value) => JSON.parse(value) as EmployeeCredential,
};

const presentationCodec: PresentationCodec<EmployeePresentation, string> = {
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: (value) => JSON.parse(value) as EmployeePresentation,
};

export const employeeFamily = defineCredentialFamily({
  id: "example.employee",
  version: "0.1.0",
  schema: {
    id: "urn:example:employee",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "EmployeeCredential"],
    claims: [
      {
        id: "employeeId",
        path: ["employeeId"],
        disclosure: "selective",
        required: true,
      },
    ],
  },
  capabilities: [],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [],
  },
  credentialCodec,
  presentationCodec,
});
```

`defineCredentialFamily` validates descriptor identifiers, semantic versions,
claim paths, unique IDs, package requirements, and codec functions. Codecs are
responsible for validating their encoded data when decoding.

## Boundaries

This package has zero runtime dependencies. It does not define proof
execution, status storage, DID resolution, exchange protocols, sessions,
display rendering, or deployment behavior. Those capabilities belong in
separate packages that depend on this model.
