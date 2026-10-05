import { describe, expect, it } from "vitest";

import {
  assertCredentialSchemaDefinition,
  type CredentialModelError,
  type CredentialSchemaDefinition,
  defineCredentialSchema,
} from "../index.js";

const schema = (): CredentialSchemaDefinition => ({
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
});

const schemaWith = (overrides: Readonly<Record<string, unknown>>): unknown => ({
  ...schema(),
  ...overrides,
});
const claimWith = (overrides: Readonly<Record<string, unknown>>): unknown =>
  schemaWith({
    claims: [{ ...schema().claims[0], ...overrides }],
  });
const expectedModelError = (
  code: CredentialModelError["code"],
  path: string,
) => expect.objectContaining<Partial<CredentialModelError>>({ code, path });

describe("defineCredentialSchema", () => {
  it("accepts metadata and preserves source literal types", () => {
    const definition = defineCredentialSchema({
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
    });
    const disclosure: "selective" = definition.claims[0].disclosure;

    expect(disclosure).toBe("selective");
    expect(definition.id).toBe("urn:example:employee");
  });

  it("rejects duplicate claim identifiers", () => {
    const definition = schema();
    const duplicate = schemaWith({
      claims: [...definition.claims, definition.claims[0]],
    });

    expect(() => assertCredentialSchemaDefinition(duplicate)).toThrowError(
      expectedModelError("DUPLICATE_ID", "claims[1].id"),
    );
  });
});

describe("assertCredentialSchemaDefinition", () => {
  it("narrows valid untyped input", () => {
    const definition: unknown = schema();

    assertCredentialSchemaDefinition(definition);

    expect(definition.claims[0].id).toBe("subject");
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
      "missing schema identifier",
      schemaWith({ id: undefined }),
      "INVALID_IDENTIFIER",
      "id",
    ],
    [
      "missing schema version",
      schemaWith({ version: undefined }),
      "INVALID_VERSION",
      "version",
    ],
    [
      "schema display metadata",
      schemaWith({ name: false }),
      "INVALID_DESCRIPTOR",
      "name",
    ],
    [
      "schema description",
      schemaWith({ description: "schema " }),
      "INVALID_DESCRIPTOR",
      "description",
    ],
    [
      "missing credential types",
      schemaWith({ credentialTypes: undefined }),
      "INVALID_DESCRIPTOR",
      "credentialTypes",
    ],
    [
      "empty credential types",
      schemaWith({ credentialTypes: [] }),
      "INVALID_DESCRIPTOR",
      "credentialTypes",
    ],
    [
      "credential type",
      schemaWith({ credentialTypes: ["VerifiableCredential", 7] }),
      "INVALID_IDENTIFIER",
      "credentialTypes[1]",
    ],
    [
      "missing claims",
      schemaWith({ claims: undefined }),
      "INVALID_DESCRIPTOR",
      "claims",
    ],
    ["non-object claim", schemaWith({ claims: [null] }), "INVALID_DESCRIPTOR", "claims[0]"],
    ["claim identifier", claimWith({ id: 1 }), "INVALID_IDENTIFIER", "claims[0].id"],
    ["disclosure", claimWith({ disclosure: "sometimes" }), "INVALID_DESCRIPTOR", "claims[0].disclosure"],
    ["required flag", claimWith({ required: 1 }), "INVALID_DESCRIPTOR", "claims[0].required"],
    ["value type", claimWith({ valueType: "" }), "INVALID_IDENTIFIER", "claims[0].valueType"],
    ["empty claim path", claimWith({ path: [] }), "INVALID_DESCRIPTOR", "claims[0].path"],
    ["missing claim path", claimWith({ path: undefined }), "INVALID_DESCRIPTOR", "claims[0].path"],
    [
      "claim path segment",
      claimWith({ path: ["credentialSubject", false] }),
      "INVALID_IDENTIFIER",
      "claims[0].path[1]",
    ],
  ];

  it.each(invalidCases)("rejects %s", (_name, input, code, path) => {
    expect(() => assertCredentialSchemaDefinition(input)).toThrowError(
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
      assertCredentialSchemaDefinition(schemaWith({ version })),
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
      assertCredentialSchemaDefinition(schemaWith({ version })),
    ).toThrowError(expectedModelError("INVALID_VERSION", "version"));
  });
});
