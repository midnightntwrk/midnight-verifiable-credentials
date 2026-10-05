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
const parsedFamily = JSON.parse(JSON.stringify(accessFamily));
assertCredentialFamilyDefinition(parsedFamily);
assert.equal(parsedFamily.schema.id, "urn:fixture:access");
const namedFamily = defineCredentialFamily({
  ...accessFamily,
  name: "Access credential",
  description: "Describes access granted to one subject.",
  schema: {
    ...accessFamily.schema,
    name: "Access credential schema",
    description: "Claims used by the access credential.",
  },
});
assert.equal(namedFamily.name, "Access credential");
for (const [field, value, path] of [
  ["name", "", "name"],
  ["description", 7, "description"],
]) {
  assert.throws(
    () =>
      assertCredentialFamilyDefinition({
        ...namedFamily,
        [field]: value,
      }),
    (error) =>
      error instanceof CredentialModelError &&
      error.code === "INVALID_DESCRIPTOR" &&
      error.path === path,
  );
}
for (const [field, value, path] of [
  ["name", " Schema", "schema.name"],
  ["description", false, "schema.description"],
]) {
  assert.throws(
    () =>
      assertCredentialFamilyDefinition({
        ...namedFamily,
        schema: {
          ...namedFamily.schema,
          [field]: value,
        },
      }),
    (error) =>
      error instanceof CredentialModelError &&
      error.code === "INVALID_DESCRIPTOR" &&
      error.path === path,
  );
}
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
assert.throws(
  () =>
    assertCredentialFamilyDefinition({
      ...accessFamily,
      version: "1.0.0-alpha..1",
    }),
  (error) =>
    error instanceof CredentialModelError &&
    error.code === "INVALID_VERSION" &&
    error.path === "version",
);
assert.throws(
  () =>
    assertCredentialFamilyDefinition({
      ...accessFamily,
      schema: {
        ...accessFamily.schema,
        claims: [
          accessFamily.schema.claims[0],
          accessFamily.schema.claims[0],
        ],
      },
    }),
  (error) =>
    error instanceof CredentialModelError &&
    error.code === "DUPLICATE_ID" &&
    error.path === "schema.claims[1].id",
);
for (const [field, value, code, path] of [
  ["path", [], "INVALID_DESCRIPTOR", "schema.claims[0].path"],
  [
    "disclosure",
    "private",
    "INVALID_DESCRIPTOR",
    "schema.claims[0].disclosure",
  ],
  ["required", "true", "INVALID_DESCRIPTOR", "schema.claims[0].required"],
]) {
  assert.throws(
    () =>
      assertCredentialFamilyDefinition({
        ...accessFamily,
        schema: {
          ...accessFamily.schema,
          claims: [
            {
              ...accessFamily.schema.claims[0],
              [field]: value,
            },
          ],
        },
      }),
    (error) =>
      error instanceof CredentialModelError &&
      error.code === code &&
      error.path === path,
  );
}

console.log("Node ESM consumed the credential metadata model tarball.");
