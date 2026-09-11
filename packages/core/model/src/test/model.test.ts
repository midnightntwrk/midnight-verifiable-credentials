import { describe, expect, it } from "vitest";

import {
  assertCredentialFamilyDefinition,
  type CredentialFamilyDefinition,
  type CredentialModelError,
  defineCredentialFamily,
} from "../index.js";

const family = (): CredentialFamilyDefinition => ({
  id: "example.employee",
  version: "0.1.0",
  name: "Employee credential",
  description: "Describes an employee identifier.",
  schema: {
    id: "urn:example:employee",
    version: "1.0.0",
    name: "Employee credential schema",
    description: "Employee schema metadata.",
    credentialTypes: ["VerifiableCredential", "EmployeeCredential"],
    claims: [
      {
        id: "subject",
        path: ["credentialSubject", "id"],
        disclosure: "selective",
        required: true,
        valueType: "string",
      },
    ],
  },
});

const schemaWith = (overrides: Readonly<Record<string, unknown>>): unknown => ({
  ...family(),
  schema: { ...family().schema, ...overrides },
});
const claimWith = (overrides: Readonly<Record<string, unknown>>): unknown =>
  schemaWith({
    claims: [{ ...family().schema.claims[0], ...overrides }],
  });
const expectedModelError = (
  code: CredentialModelError["code"],
  path: string,
) => expect.objectContaining<Partial<CredentialModelError>>({ code, path });

describe("defineCredentialFamily", () => {
  it("accepts metadata and preserves source literal types", () => {
    const definition = defineCredentialFamily({
      id: "example.employee",
      version: "0.1.0",
      schema: {
        id: "urn:example:employee",
        version: "1.0.0",
        credentialTypes: ["VerifiableCredential"],
        claims: [
          {
            id: "subject",
            path: ["credentialSubject", "id"],
            disclosure: "selective",
            required: true,
          },
        ],
      },
    });
    const disclosure: "selective" = definition.schema.claims[0].disclosure;

    expect(disclosure).toBe("selective");
    expect(definition.id).toBe("example.employee");
  });

  it("rejects duplicate claim identifiers", () => {
    const definition = family();
    const duplicate = schemaWith({
      claims: [...definition.schema.claims, definition.schema.claims[0]],
    });

    expect(() => assertCredentialFamilyDefinition(duplicate)).toThrowError(
      expectedModelError("DUPLICATE_ID", "schema.claims[1].id"),
    );
  });
});

describe("assertCredentialFamilyDefinition", () => {
  it("narrows valid untyped input", () => {
    const definition: unknown = family();

    assertCredentialFamilyDefinition(definition);

    expect(definition.schema.claims[0].id).toBe("subject");
  });

  type InvalidCase = readonly [
    name: string,
    input: unknown,
    code: CredentialModelError["code"],
    path: string,
  ];
  const invalidCases: readonly InvalidCase[] = [
    ["non-object definition", null, "INVALID_DESCRIPTOR", "definition"],
    ["array definition", [], "INVALID_DESCRIPTOR", "definition"],
    [
      "missing family identifier",
      { ...family(), id: undefined },
      "INVALID_IDENTIFIER",
      "id",
    ],
    [
      "missing family version",
      { ...family(), version: undefined },
      "INVALID_VERSION",
      "version",
    ],
    [
      "family display metadata",
      { ...family(), name: " Employee credential" },
      "INVALID_DESCRIPTOR",
      "name",
    ],
    [
      "family description",
      { ...family(), description: 7 },
      "INVALID_DESCRIPTOR",
      "description",
    ],
    [
      "missing schema",
      { ...family(), schema: undefined },
      "INVALID_DESCRIPTOR",
      "schema",
    ],
    [
      "array schema",
      { ...family(), schema: [] },
      "INVALID_DESCRIPTOR",
      "schema",
    ],
    ["schema identifier", schemaWith({ id: "" }), "INVALID_IDENTIFIER", "schema.id"],
    [
      "missing schema version",
      schemaWith({ version: undefined }),
      "INVALID_VERSION",
      "schema.version",
    ],
    [
      "schema display metadata",
      schemaWith({ name: false }),
      "INVALID_DESCRIPTOR",
      "schema.name",
    ],
    [
      "schema description",
      schemaWith({ description: "schema " }),
      "INVALID_DESCRIPTOR",
      "schema.description",
    ],
    [
      "missing credential types",
      schemaWith({ credentialTypes: undefined }),
      "INVALID_DESCRIPTOR",
      "schema.credentialTypes",
    ],
    [
      "empty credential types",
      schemaWith({ credentialTypes: [] }),
      "INVALID_DESCRIPTOR",
      "schema.credentialTypes",
    ],
    [
      "credential type",
      schemaWith({ credentialTypes: ["VerifiableCredential", 7] }),
      "INVALID_IDENTIFIER",
      "schema.credentialTypes[1]",
    ],
    [
      "missing claims",
      schemaWith({ claims: undefined }),
      "INVALID_DESCRIPTOR",
      "schema.claims",
    ],
    ["non-object claim", schemaWith({ claims: [null] }), "INVALID_DESCRIPTOR", "schema.claims[0]"],
    ["claim identifier", claimWith({ id: 1 }), "INVALID_IDENTIFIER", "schema.claims[0].id"],
    ["disclosure", claimWith({ disclosure: "sometimes" }), "INVALID_DESCRIPTOR", "schema.claims[0].disclosure"],
    ["required flag", claimWith({ required: 1 }), "INVALID_DESCRIPTOR", "schema.claims[0].required"],
    ["value type", claimWith({ valueType: "" }), "INVALID_IDENTIFIER", "schema.claims[0].valueType"],
    ["empty claim path", claimWith({ path: [] }), "INVALID_DESCRIPTOR", "schema.claims[0].path"],
    ["missing claim path", claimWith({ path: undefined }), "INVALID_DESCRIPTOR", "schema.claims[0].path"],
    [
      "claim path segment",
      claimWith({ path: ["credentialSubject", false] }),
      "INVALID_IDENTIFIER",
      "schema.claims[0].path[1]",
    ],
  ];

  it.each(invalidCases)("rejects %s", (_name, input, code, path) => {
    expect(() => assertCredentialFamilyDefinition(input)).toThrowError(
      expectedModelError(code, path),
    );
  });

  const validVersions = [
    "0.0.0",
    "1.0.0",
    "1.0.0-alpha",
    "1.0.0-alpha.1",
    "1.0.0-0.3.7",
    "1.0.0-x.7.z.92",
    "1.0.0+20130313144700",
    "1.0.0-beta+exp.sha.5114f85",
  ];

  it.each(validVersions)("accepts SemVer 2.0 version %s", (version) => {
    expect(() =>
      assertCredentialFamilyDefinition({ ...family(), version }),
    ).not.toThrow();
    expect(() =>
      assertCredentialFamilyDefinition(schemaWith({ version })),
    ).not.toThrow();
  });

  const invalidVersions = [
    "1",
    "1.0",
    "01.0.0",
    "1.01.0",
    "1.0.01",
    "1.0.0-",
    "1.0.0-01",
    "1.0.0-alpha..1",
    "1.0.0-alpha.",
    "1.0.0-.alpha",
    "1.0.0+",
    "1.0.0+build..1",
    "1.0.0+build_1",
    " 1.0.0",
    "1.0.0\n",
  ];

  it.each(invalidVersions)("rejects malformed version %s", (version) => {
    expect(() =>
      assertCredentialFamilyDefinition({ ...family(), version }),
    ).toThrowError(expectedModelError("INVALID_VERSION", "version"));
    expect(() =>
      assertCredentialFamilyDefinition(schemaWith({ version })),
    ).toThrowError(expectedModelError("INVALID_VERSION", "schema.version"));
  });
});
