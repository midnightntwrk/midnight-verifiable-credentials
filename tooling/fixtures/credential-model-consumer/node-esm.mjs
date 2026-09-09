import assert from "node:assert/strict";

import {
  CredentialModelError,
  assertCredentialFamilyDefinition,
  defineCredentialFamily,
} from "@midnight-ntwrk/credential-model";

const accessFamily = defineCredentialFamily({
  id: "fixture.access",
  version: "0.1.0",
  schema: {
    id: "urn:fixture:access",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "AccessCredential"],
    claims: [
      {
        id: "accessLevel",
        path: ["accessLevel"],
        disclosure: "selective",
        required: true,
      },
    ],
  },
});

assertCredentialFamilyDefinition(accessFamily);
assert.equal(accessFamily.id, "fixture.access");
assert.equal(accessFamily.schema.claims[0].id, "accessLevel");
assert.throws(
  () =>
    defineCredentialFamily({
      ...accessFamily,
      version: "latest",
    }),
  (error) =>
    error instanceof CredentialModelError &&
    error.code === "INVALID_VERSION",
);

console.log("Node ESM consumed the credential metadata model tarball.");
