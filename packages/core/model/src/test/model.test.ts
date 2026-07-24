import { describe, expect, it } from "vitest";

import {
  type CredentialFamilyDefinition,
  type CredentialModelError,
  defineCredentialFamily,
} from "../index.js";

interface ExampleCredential {
  subject: string;
}

interface ExamplePresentation {
  subject: string;
}

const family = (): CredentialFamilyDefinition<
  ExampleCredential,
  ExamplePresentation,
  string,
  string
> => ({
  id: "example.employee",
  version: "0.1.0",
  schema: {
    id: "urn:example:employee",
    version: "1.0.0",
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
  capabilities: [
    {
      id: "holder-binding.did",
      kind: "holder-binding",
      version: "1.0.0",
      required: true,
    },
  ],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [
      {
        name: "@midnight-ntwrk/credential-compact",
        version: "^0.1.0",
        exports: [".", "./same-holder"],
      },
    ],
  },
  credentialCodec: {
    mediaType: "application/json",
    encode: JSON.stringify,
    decode: (value) => JSON.parse(value) as ExampleCredential,
  },
  presentationCodec: {
    mediaType: "application/json",
    encode: JSON.stringify,
    decode: (value) => JSON.parse(value) as ExamplePresentation,
  },
});

describe("defineCredentialFamily", () => {
  it("accepts a protocol-neutral family definition", () => {
    const definition = defineCredentialFamily(family());

    expect(definition.id).toBe("example.employee");
    expect(
      definition.credentialCodec.decode(
        definition.credentialCodec.encode({ subject: "did:example:123" }),
      ),
    ).toEqual({ subject: "did:example:123" });
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

  it("rejects local package locators in composition manifests", () => {
    const definition = family();
    const localComposition = {
      ...definition,
      composition: {
        formatVersion: 1 as const,
        packages: [
          {
            name: "@midnight-ntwrk/credential-compact",
            version: "workspace:*",
          },
        ],
      },
    };

    expect(() => defineCredentialFamily(localComposition)).toThrowError(
      expect.objectContaining<Partial<CredentialModelError>>({
        code: "INVALID_PACKAGE_REQUIREMENT",
        path: "composition.packages[0].version",
      }),
    );
  });

  it("rejects incomplete codec ports", () => {
    const definition = family();
    const invalidCodec = {
      ...definition,
      credentialCodec: {
        mediaType: "application/json",
        encode: JSON.stringify,
      },
    };

    expect(() =>
      defineCredentialFamily(
        invalidCodec as unknown as ReturnType<typeof family>,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<CredentialModelError>>({
        code: "INVALID_CODEC",
        path: "credentialCodec",
      }),
    );
  });

  it.each([
    {
      label: "claim disclosure",
      mutate: (definition: ReturnType<typeof family>) => ({
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
      }),
      path: "schema.claims[0].disclosure",
    },
    {
      label: "capability kind",
      mutate: (definition: ReturnType<typeof family>) => ({
        ...definition,
        capabilities: [
          {
            ...definition.capabilities[0],
            kind: "transport",
          },
        ],
      }),
      path: "capabilities[0].kind",
    },
    {
      label: "artifact purpose",
      mutate: (definition: ReturnType<typeof family>) => ({
        ...definition,
        artifacts: [
          {
            id: "artifact.example",
            mediaType: "application/octet-stream",
            purpose: "deployment",
          },
        ],
      }),
      path: "artifacts[0].purpose",
    },
  ])("rejects an invalid $label", ({ mutate, path }) => {
    const invalid = mutate(family());

    expect(() =>
      defineCredentialFamily(
        invalid as unknown as ReturnType<typeof family>,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<CredentialModelError>>({
        code: "INVALID_DESCRIPTOR",
        path,
      }),
    );
  });

  it("rejects malformed versions and package export maps", () => {
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

    const invalidExports = family();
    expect(() =>
      defineCredentialFamily({
        ...invalidExports,
        composition: {
          formatVersion: 1,
          packages: [
            {
              ...invalidExports.composition.packages[0],
              exports: "dist/internal",
            },
          ],
        },
      } as unknown as ReturnType<typeof family>),
    ).toThrowError(
      expect.objectContaining<Partial<CredentialModelError>>({
        code: "INVALID_PACKAGE_REQUIREMENT",
        path: "composition.packages[0].exports",
      }),
    );
  });
});
