import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/secret-birth-credential/contract/index.js";
import { createSecretBirthCredentialFixture } from "./credential-fixtures.js";

setNetworkId("undeployed");

describe("secret birth credential: issuer-signed status binding commitment", () => {
  it("changes the status-aware body root when the committed registry binding changes", () => {
    const fixture = createSecretBirthCredentialFixture();
    const originalBodyRoot =
      pureCircuits.secretBirthCredentialWithStatusBindingBodyRoot(
        fixture.credentialWithStatusBinding,
      );
    const tamperedStatusBinding = {
      ...fixture.credentialWithStatusBinding.credential.statusBinding,
      registryRef: {
        ...fixture.credentialWithStatusBinding.credential.statusBinding
          .registryRef,
        registryId: new Uint8Array(32).fill(44),
      },
    };
    const tamperedBodyRoot =
      pureCircuits.secretBirthCredentialRegistryBoundStatusBodyRoot(
        fixture.credential,
        tamperedStatusBinding,
      );

    expect([...originalBodyRoot]).not.toEqual([...tamperedBodyRoot]);
  });

  it("rejects a revoked-set status binding when the committed binding diverges from the issuer-signed proof", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialWithStatusBinding({
        ...fixture.credentialWithStatusBinding,
        credential: {
          ...fixture.credentialWithStatusBinding.credential,
          statusBinding: {
            ...fixture.credentialWithStatusBinding.credential.statusBinding,
            statusHandleCommitment: new Uint8Array(32).fill(7),
          },
        },
      }),
    ).toThrow();
  });

  it("rejects a status-bound credential when the committed registry diverges from the issuer-signed proof", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialWithStatusBinding({
        ...fixture.credentialWithStatusBinding,
        credential: {
          ...fixture.credentialWithStatusBinding.credential,
          statusBinding: {
            ...fixture.credentialWithStatusBinding.credential.statusBinding,
            registryRef: {
              ...fixture.credentialWithStatusBinding.credential.statusBinding
                .registryRef,
              registryId: new Uint8Array(32).fill(9),
            },
          },
        },
      }),
    ).toThrow();
  });

  it("rejects a status-bound credential when the committed handle diverges from the issuer-signed proof", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialWithStatusBinding({
        ...fixture.credentialWithStatusBinding,
        credential: {
          ...fixture.credentialWithStatusBinding.credential,
          statusBinding: {
            ...fixture.credentialWithStatusBinding.credential.statusBinding,
            statusHandleCommitment: new Uint8Array(32).fill(5),
          },
        },
      }),
    ).toThrow();
  });

  it("rejects a status-aware wrapper when it reuses the plain base-credential proof", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialWithStatusBinding({
        ...fixture.credentialWithStatusBinding,
        credentialProof: fixture.credentialProof,
      }),
    ).toThrow();
  });

  it("rejects a plain base-credential validation attempt when given the status-bound wrapper proof", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertValidSecretBirthCredential(
        fixture.credential,
        fixture.credentialWithStatusBinding.credentialProof,
      ),
    ).toThrow();
  });
});
