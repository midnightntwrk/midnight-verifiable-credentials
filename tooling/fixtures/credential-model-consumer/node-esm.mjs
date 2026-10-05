import assert from "node:assert/strict";

import {
  CredentialModelError,
  assertCredentialSchemaDefinition,
  defineCredentialSchema,
} from "@midnight-ntwrk/credential-model";

const accessSchema = defineCredentialSchema({
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
});

assertCredentialSchemaDefinition(accessSchema);
assert.equal(accessSchema.id, "urn:fixture:access");
assert.equal(accessSchema.claims[0].id, "accessLevel");
const parsedSchema = JSON.parse(JSON.stringify(accessSchema));
assertCredentialSchemaDefinition(parsedSchema);
assert.equal(parsedSchema.id, "urn:fixture:access");

const namedSchema = defineCredentialSchema({
  ...accessSchema,
  name: "Access credential schema",
  description: "Claims used by the access credential.",
});
assert.equal(namedSchema.name, "Access credential schema");

for (const [field, value, path] of [
  ["name", " Schema", "name"],
  ["description", false, "description"],
]) {
  assert.throws(
    () =>
      assertCredentialSchemaDefinition({
        ...namedSchema,
        [field]: value,
      }),
    (error) =>
      error instanceof CredentialModelError &&
      error.code === "INVALID_DESCRIPTOR" &&
      error.path === path,
  );
}

assert.throws(
  () =>
    defineCredentialSchema({
      ...accessSchema,
      version: "latest",
    }),
  (error) =>
    error instanceof CredentialModelError &&
    error.code === "INVALID_VERSION",
);
assert.throws(
  () =>
    assertCredentialSchemaDefinition({
      ...accessSchema,
      version: "1.0.0-alpha..1",
    }),
  (error) =>
    error instanceof CredentialModelError &&
    error.code === "INVALID_VERSION" &&
    error.path === "version",
);
assert.throws(
  () =>
    assertCredentialSchemaDefinition({
      ...accessSchema,
      claims: [accessSchema.claims[0], accessSchema.claims[0]],
    }),
  (error) =>
    error instanceof CredentialModelError &&
    error.code === "DUPLICATE_ID" &&
    error.path === "claims[1].id",
);
for (const [field, value, code, path] of [
  ["path", [], "INVALID_DESCRIPTOR", "claims[0].path"],
  ["disclosure", "private", "INVALID_DESCRIPTOR", "claims[0].disclosure"],
  ["required", "true", "INVALID_DESCRIPTOR", "claims[0].required"],
]) {
  assert.throws(
    () =>
      assertCredentialSchemaDefinition({
        ...accessSchema,
        claims: [{ ...accessSchema.claims[0], [field]: value }],
      }),
    (error) =>
      error instanceof CredentialModelError &&
      error.code === code &&
      error.path === path,
  );
}

console.log("Node ESM consumed the credential metadata model tarball.");
