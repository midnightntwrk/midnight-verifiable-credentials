import { describe, expect, it } from "vitest";

import {
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
    credentialTypes: ["VerifiableCredential", "EmployeeCredential"],
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

describe("defineCredentialFamily", () => {
  it("accepts generic family and claim-schema metadata", () => {
    const definition = defineCredentialFamily(family());

    expect(definition.id).toBe("example.employee");
    expect(definition.schema.credentialTypes).toEqual([
      "VerifiableCredential",
      "EmployeeCredential",
    ]);
  });

  it("rejects duplicate claim identifiers", () => {
    const definition = family();
    const duplicate = {
      ...definition,
      schema: {
        ...definition.schema,
        claims: [...definition.schema.claims, definition.schema.claims[0]],
      },
    };

    expect(() => defineCredentialFamily(duplicate)).toThrowError(
      expect.objectContaining<Partial<CredentialModelError>>({
        code: "DUPLICATE_ID",
        path: "schema.claims[1].id",
      }),
    );
  });

  it("rejects invalid claim metadata", () => {
    const definition = family();

    expect(() =>
      defineCredentialFamily({
        ...definition,
        schema: {
          ...definition.schema,
          claims: [
            {
              ...definition.schema.claims[0],
              disclosure: "sometimes",
            },
          ],
        },
      } as unknown as CredentialFamilyDefinition),
    ).toThrowError(
      expect.objectContaining<Partial<CredentialModelError>>({
        code: "INVALID_DESCRIPTOR",
        path: "schema.claims[0].disclosure",
      }),
    );
  });

  it("rejects malformed versions and display metadata", () => {
    expect(() =>
      defineCredentialFamily({
        ...family(),
        version: "next",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<CredentialModelError>>({
        code: "INVALID_VERSION",
        path: "version",
      }),
    );

    expect(() =>
      defineCredentialFamily({
        ...family(),
        name: " Employee credential",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<CredentialModelError>>({
        code: "INVALID_DESCRIPTOR",
        path: "name",
      }),
    );
  });

  it("returns a model error for a null claim", () => {
    const definition = family();

    expect(() =>
      defineCredentialFamily({
        ...definition,
        schema: {
          ...definition.schema,
          claims: [null],
        },
      } as unknown as CredentialFamilyDefinition),
    ).toThrowError(
      expect.objectContaining<Partial<CredentialModelError>>({
        code: "INVALID_DESCRIPTOR",
        path: "schema.claims[0]",
      }),
    );
  });
});
