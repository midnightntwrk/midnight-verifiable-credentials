import assert from "node:assert/strict";

import {
  CredentialModelError,
  defineCredentialFamily,
} from "@midnight-ntwrk/credential-model";

const jsonCodec = {
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: JSON.parse,
};
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
        disclosure: "predicate-only",
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
  credentialCodec: jsonCodec,
  presentationCodec: jsonCodec,
});

assert.equal(accessFamily.id, "fixture.access");
assert.equal(
  accessFamily.credentialCodec.decode(
    accessFamily.credentialCodec.encode({ accessLevel: 4 }),
  ).accessLevel,
  4,
);
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

console.log("Node ESM consumed the credential model tarball.");
