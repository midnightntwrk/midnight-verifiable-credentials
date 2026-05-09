import { TextEncoder } from "node:util";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/university-diploma/contract/index.js";

setNetworkId("undeployed");

const padText = (value: string, length = 32): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length >= length) {
    return bytes.subarray(0, length);
  }
  const padded = new Uint8Array(length);
  padded.set(bytes);
  return padded;
};

const schema = {
  packageId: padText("midnight-did:vc:unidiploma"),
  schemaId: padText("university-diploma:v1"),
  majorVersion: 1n,
  minorVersion: 0n,
};

const verificationMethodRef = {
  didContractAddress: { bytes: padText("issuer-contract-address") },
  methodId: padText("#assertion-key-1"),
};

describe("university diploma presentation request", () => {
  it("requires a verifier challenge", () => {
    expect(() =>
      pureCircuits.assertValidUniversityDiplomaPresentationRequest({
        version: 1n,
        schema,
        issuerVerificationMethodRef: verificationMethodRef,
        requireLegalNameDisclosure: false,
        requireDocumentTypeDisclosure: false,
        requireDocumentNumberDisclosure: false,
        requireDegreeTitleDisclosure: true,
        requireProgramDisclosure: false,
        requireFacultyDisclosure: false,
        requireAwardDateDisclosure: true,
        requireGraduationStatusDisclosure: true,
        verifierChallengeHash: new Uint8Array(32),
      }),
    ).toThrow(/challenge must be set/);
  });

  it("rejects a presentation that omits a requested disclosure", () => {
    const request = {
      version: 1n,
      schema,
      issuerVerificationMethodRef: verificationMethodRef,
      requireLegalNameDisclosure: false,
      requireDocumentTypeDisclosure: false,
      requireDocumentNumberDisclosure: false,
      requireDegreeTitleDisclosure: true,
      requireProgramDisclosure: false,
      requireFacultyDisclosure: false,
      requireAwardDateDisclosure: false,
      requireGraduationStatusDisclosure: true,
      verifierChallengeHash: padText("verifier-challenge"),
    };

    const presentation = {
      version: 1n,
      schema,
      credentialClaimRoot: padText("credential-claim-root"),
      issuerVerificationMethodRef: verificationMethodRef,
      holderBinding: {
        holderVerificationMethodRef: {
          didContractAddress: { bytes: padText("holder-contract-address") },
          methodId: padText("#holder-key-1"),
        },
      },
      disclosed: {
        revealLegalName: false,
        legalNamePadded: new Uint8Array(32),
        legalNameOpening: new Uint8Array(32),
        revealDocumentType: false,
        documentTypePadded: new Uint8Array(32),
        documentTypeOpening: new Uint8Array(32),
        revealDocumentNumber: false,
        documentNumberPadded: new Uint8Array(32),
        documentNumberOpening: new Uint8Array(32),
        revealDegreeTitle: false,
        degreeTitlePadded: new Uint8Array(32),
        degreeTitleOpening: new Uint8Array(32),
        revealProgram: false,
        programPadded: new Uint8Array(32),
        programOpening: new Uint8Array(32),
        revealFaculty: false,
        facultyPadded: new Uint8Array(32),
        facultyOpening: new Uint8Array(32),
        revealAwardDate: false,
        awardDateDays: 0n,
        awardDateOpening: new Uint8Array(32),
        revealGraduationStatus: false,
        graduationStatusPadded: new Uint8Array(32),
        graduationStatusOpening: new Uint8Array(32),
      },
    };

    expect(() =>
      pureCircuits.assertUniversityDiplomaPresentationSatisfiesRequest(
        request,
        presentation,
      ),
    ).toThrow(/must disclose degree title/);
  });
});
