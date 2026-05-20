import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/university-diploma-credential/contract/index.js";
import { createUniversityDiplomaFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("university-diploma validation guards", () => {
  it("rejects a tampered credential body under the issuer proof", () => {
    const fixture = createUniversityDiplomaFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaCredential(
        {
          ...fixture.credential,
          claimRoot: new Uint8Array(32).fill(7),
        },
        fixture.credentialProof,
      ),
    ).toThrow(/Credential claim root mismatch/);
  });

  it("rejects a presentation whose holder binding no longer matches the credential", () => {
    const fixture = createUniversityDiplomaFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaPresentation(
        fixture.credential,
        fixture.credentialProof,
        {
          ...fixture.presentation,
          holderBinding: {
            holderVerificationMethodRef: {
              ...fixture.presentation.holderBinding.holderVerificationMethodRef,
              methodId: new Uint8Array(32).fill(3),
            },
          },
        },
        fixture.presentationProof,
      ),
    ).toThrow(
      /Presentation holder method reference does not match credential holder binding/,
    );
  });

  it("rejects a presentation whose proof signer contract no longer matches the holder binding", () => {
    const fixture = createUniversityDiplomaFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaPresentation(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        {
          ...fixture.presentationProof,
          signerVerificationMethodRef: {
            ...fixture.presentationProof.signerVerificationMethodRef,
            didContractAddress: {
              ...fixture.presentationProof.signerVerificationMethodRef
                .didContractAddress,
              bytes: new Uint8Array(32).fill(4),
            },
          },
        },
      ),
    ).toThrow(/Presentation proof signer must match holder binding/);
  });

  it("rejects a presentation whose proof signer method reference no longer matches the holder binding", () => {
    const fixture = createUniversityDiplomaFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaPresentation(
        fixture.credential,
        fixture.credentialProof,
        fixture.presentation,
        {
          ...fixture.presentationProof,
          signerVerificationMethodRef: {
            ...fixture.presentationProof.signerVerificationMethodRef,
            methodId: new Uint8Array(32).fill(6),
          },
        },
      ),
    ).toThrow(
      /Presentation proof signer method reference must match holder binding/,
    );
  });

  it("rejects a presentation request without a verifier challenge", () => {
    const fixture = createUniversityDiplomaFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaPresentationRequest({
        ...fixture.presentationRequest,
        verifierChallengeHash: new Uint8Array(32),
      }),
    ).toThrow(/University-diploma verifier challenge must be set/);
  });

  it("rejects a presentation request whose version no longer matches the family contract", () => {
    const fixture = createUniversityDiplomaFixture();

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaPresentationRequest({
        ...fixture.presentationRequest,
        version: 2n,
      }),
    ).toThrow(/University-diploma request version mismatch/);
  });

  it("rejects a minimum-grade request that does not require final-grade disclosure", () => {
    const fixture = createUniversityDiplomaFixture({
      request: {
        requireFinalGradeDisclosure: false,
        enforceMinimumFinalGrade: true,
        minimumFinalGrade: 91n,
      },
      disclosure: {
        revealFinalGrade: false,
      },
    });

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaPresentationRequest(
        fixture.presentationRequest,
      ),
    ).toThrow(
      /University-diploma minimum-grade request must require final grade disclosure/,
    );
  });

  it("rejects a request whose challenge no longer matches the presentation proof", () => {
    const fixture = createUniversityDiplomaFixture();

    expect(() =>
      pureCircuits.assertUniversityDiplomaPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        {
          ...fixture.presentationRequest,
          verifierChallengeHash: new Uint8Array(32).fill(9),
        },
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(
      /University-diploma presentation proof challenge does not match the request/,
    );
  });

  it("rejects a request schema that no longer matches the credential schema", () => {
    const fixture = createUniversityDiplomaFixture();

    expect(() =>
      pureCircuits.assertUniversityDiplomaPresentationSatisfiesRequest(
        fixture.credential,
        fixture.credentialProof,
        {
          ...fixture.presentationRequest,
          schema: {
            ...fixture.presentationRequest.schema,
            minorVersion: 1n,
          },
        },
        fixture.presentation,
        fixture.presentationProof,
      ),
    ).toThrow(/Schema reference mismatch/);
  });

  it("rejects a credential whose final grade exceeds the allowed scale", () => {
    const fixture = createUniversityDiplomaFixture({
      claimOverrides: {
        finalGrade: 101n,
      },
    });

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaCredential(
        fixture.credential,
        fixture.credentialProof,
      ),
    ).toThrow(/University-diploma final grade must be at most 100/);
  });

  it("rejects a minimum-grade request outside the 0..100 range", () => {
    const fixture = createUniversityDiplomaFixture({
      request: {
        requireFinalGradeDisclosure: true,
        enforceMinimumFinalGrade: true,
        minimumFinalGrade: 101n,
      },
    });

    expect(() =>
      pureCircuits.assertValidUniversityDiplomaPresentationRequest(
        fixture.presentationRequest,
      ),
    ).toThrow(/University-diploma minimum final grade must be at most 100/);
  });
});
