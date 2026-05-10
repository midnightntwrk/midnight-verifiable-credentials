import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/secret-birth-credential/contract/index.js";
import {
  createSecretBirthCredentialFixture,
  type SecretBirthStatusCredentialCompat,
} from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("secret birth credential: issuer-signed status binding commitment", () => {
  const registryBoundStatusBodyRoot = (
    credential: SecretBirthStatusCredentialCompat,
  ): Uint8Array => {
    const bodyRoot =
      pureCircuits.secretBirthCredentialRegistryBoundStatusBodyRoot as unknown as (
        ...args: unknown[]
      ) => Uint8Array;

    try {
      return bodyRoot(credential, credential.statusBinding);
    } catch {
      return bodyRoot(credential);
    }
  };

  it("changes the status-aware body root when the committed registry binding changes", () => {
    const fixture = createSecretBirthCredentialFixture();
    const originalBodyRoot =
      pureCircuits.secretBirthCredentialWithStatusBindingBodyRoot(
        fixture.credentialWithStatusBinding as never,
      );
    const tamperedStatusBinding = {
      ...fixture.credentialWithStatusBinding.credential.statusBinding,
      registryRef: {
        ...fixture.credentialWithStatusBinding.credential.statusBinding
          .registryRef,
        registryId: new Uint8Array(32).fill(44),
      },
    };
    const tamperedCredential = {
      ...fixture.credentialWithStatusBinding.credential,
      statusBinding: tamperedStatusBinding,
    };
    const tamperedBodyRoot = registryBoundStatusBodyRoot(tamperedCredential);

    expect([...originalBodyRoot]).not.toEqual([...tamperedBodyRoot]);
  });

  it("rejects a revoked-set status binding when the committed binding diverges from the issuer-signed proof", () => {
    const fixture = createSecretBirthCredentialFixture();
    const tamperedCredential = {
      ...fixture.credentialWithStatusBinding.credential,
      statusBinding: {
        ...fixture.credentialWithStatusBinding.credential.statusBinding,
        statusHandleCommitment: new Uint8Array(32).fill(7),
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialWithStatusBinding({
        ...fixture.credentialWithStatusBinding,
        credential: tamperedCredential,
        statusBinding: tamperedCredential.statusBinding,
      } as never),
    ).toThrow();
  });

  it("rejects a status-bound credential when the committed registry diverges from the issuer-signed proof", () => {
    const fixture = createSecretBirthCredentialFixture();
    const tamperedCredential = {
      ...fixture.credentialWithStatusBinding.credential,
      statusBinding: {
        ...fixture.credentialWithStatusBinding.credential.statusBinding,
        registryRef: {
          ...fixture.credentialWithStatusBinding.credential.statusBinding
            .registryRef,
          registryId: new Uint8Array(32).fill(9),
        },
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialWithStatusBinding({
        ...fixture.credentialWithStatusBinding,
        credential: tamperedCredential,
        statusBinding: tamperedCredential.statusBinding,
      } as never),
    ).toThrow();
  });

  it("rejects a status-bound credential when the committed handle diverges from the issuer-signed proof", () => {
    const fixture = createSecretBirthCredentialFixture();
    const tamperedCredential = {
      ...fixture.credentialWithStatusBinding.credential,
      statusBinding: {
        ...fixture.credentialWithStatusBinding.credential.statusBinding,
        statusHandleCommitment: new Uint8Array(32).fill(5),
      },
    };

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialWithStatusBinding({
        ...fixture.credentialWithStatusBinding,
        credential: tamperedCredential,
        statusBinding: tamperedCredential.statusBinding,
      } as never),
    ).toThrow();
  });

  it("rejects a status-aware wrapper when it reuses the plain base-credential proof", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialWithStatusBinding({
        ...fixture.credentialWithStatusBinding,
        credentialProof: fixture.credentialProof,
      } as never),
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

  it("rejects a status-bound credential when the committed status type is not a valid enum value", () => {
    const fixture = createSecretBirthCredentialFixture();

    expect(() =>
      pureCircuits.assertValidSecretBirthCredentialWithStatusBinding({
        ...fixture.credentialWithStatusBinding,
        credential: {
          ...fixture.credentialWithStatusBinding.credential,
          statusBinding: {
            ...fixture.credentialWithStatusBinding.credential.statusBinding,
            statusType:
              99 as unknown as typeof fixture.credentialWithStatusBinding.credential.statusBinding.statusType,
          },
        },
      }),
    ).toThrow(/type error/i);
  });
});
