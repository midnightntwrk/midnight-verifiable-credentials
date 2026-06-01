import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/digital-passport-credential/contract/index.js";
import {
  createDigitalPassportFixture,
  createDigitalPassportFixtureWithoutDocumentNumber,
} from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

describe("digital-passport credential: private-parts validation", () => {
  it("accepts private parts that match the credential commitments", () => {
    const fixture = createDigitalPassportFixture();

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        fixture.credential.claimCommitments,
        fixture.credential.claimRoot,
        fixture.privateParts,
      ),
    ).not.toThrow();
  });

  it("rejects a wrong first-name opening", () => {
    const fixture = createDigitalPassportFixture();

    const tampered: typeof fixture.privateParts = {
      claimValues: {
        ...fixture.privateParts.claimValues,
      },
      openings: {
        ...fixture.privateParts.openings,
        firstNameOpening: new Uint8Array(32).fill(1),
      },
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        fixture.credential.claimCommitments,
        fixture.credential.claimRoot,
        tampered,
      ),
    ).toThrow(/Private-parts first-name value does not match credential commitment/);
  });

  it("rejects a wrong last-name value", () => {
    const fixture = createDigitalPassportFixture();

    const tampered: typeof fixture.privateParts = {
      claimValues: {
        ...fixture.privateParts.claimValues,
        lastNameValuePadded: new Uint8Array(64).fill(99),
      },
      openings: {
        ...fixture.privateParts.openings,
      },
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        fixture.credential.claimCommitments,
        fixture.credential.claimRoot,
        tampered,
      ),
    ).toThrow(/Private-parts last-name value does not match credential commitment/);
  });

  it("rejects a wrong date-of-birth opening", () => {
    const fixture = createDigitalPassportFixture();

    const tampered: typeof fixture.privateParts = {
      claimValues: {
        ...fixture.privateParts.claimValues,
      },
      openings: {
        ...fixture.privateParts.openings,
        dateOfBirthOpening: new Uint8Array(32).fill(7),
      },
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        fixture.credential.claimCommitments,
        fixture.credential.claimRoot,
        tampered,
      ),
    ).toThrow(/Private-parts date-of-birth value does not match credential commitment/);
  });

  it("rejects a wrong issuing-state value", () => {
    const fixture = createDigitalPassportFixture();

    const tampered: typeof fixture.privateParts = {
      claimValues: {
        ...fixture.privateParts.claimValues,
        issuingStateValue: new Uint8Array(32).fill(0xff),
      },
      openings: {
        ...fixture.privateParts.openings,
      },
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        fixture.credential.claimCommitments,
        fixture.credential.claimRoot,
        tampered,
      ),
    ).toThrow(/Private-parts issuing-state value does not match credential commitment/);
  });

  it("rejects private parts when the claim root does not match", () => {
    const fixture = createDigitalPassportFixture();

    const wrongRoot = new Uint8Array(32).fill(0xab);

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        fixture.credential.claimCommitments,
        wrongRoot,
        fixture.privateParts,
      ),
    ).toThrow(/Private-parts claim root does not match credential/);
  });

  it("rejects a wrong document-number value when document number is present", () => {
    const fixture = createDigitalPassportFixture();

    const tampered: typeof fixture.privateParts = {
      claimValues: {
        ...fixture.privateParts.claimValues,
        documentNumberValue: new Uint8Array(32).fill(99),
      },
      openings: {
        ...fixture.privateParts.openings,
      },
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        fixture.credential.claimCommitments,
        fixture.credential.claimRoot,
        tampered,
      ),
    ).toThrow(/Private-parts document-number value does not match credential commitment/);
  });

  it("rejects a wrong document-number opening when document number is present", () => {
    const fixture = createDigitalPassportFixture();

    const tampered: typeof fixture.privateParts = {
      claimValues: {
        ...fixture.privateParts.claimValues,
      },
      openings: {
        ...fixture.privateParts.openings,
        documentNumberOpening: new Uint8Array(32).fill(42),
      },
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        fixture.credential.claimCommitments,
        fixture.credential.claimRoot,
        tampered,
      ),
    ).toThrow(/Private-parts document-number value does not match credential commitment/);
  });
});

describe("digital-passport credential: private-parts validation with absent document number", () => {
  const nullDocumentNumberCommitment = pureCircuits.documentNumberNullCommitment();

  // Build claim commitments where documentNumber uses the null sentinel.
  const claimCommitments = {
    firstNameCommitment:
      pureCircuits.firstNameCommitment(
        new Uint8Array(64).fill(0),
        new Uint8Array(32).fill(1),
      ),
    lastNameCommitment:
      pureCircuits.lastNameCommitment(
        new Uint8Array(64).fill(0),
        new Uint8Array(32).fill(2),
      ),
    dateOfBirthCommitment:
      pureCircuits.dateOfBirthCommitment(0n, new Uint8Array(32).fill(3)),
    documentNumberCommitment: nullDocumentNumberCommitment,
    issuingStateCommitment:
      pureCircuits.issuingStateCommitment(
        new Uint8Array(32).fill(0),
        new Uint8Array(32).fill(4),
      ),
  };

  const claimRoot =
    pureCircuits.digitalPassportClaimRoot(claimCommitments);

  const privateParts = {
    claimValues: {
      firstNameValuePadded: new Uint8Array(64).fill(0),
      lastNameValuePadded: new Uint8Array(64).fill(0),
      dateOfBirthDays: 0n,
      documentNumberValue: new Uint8Array(32),
      issuingStateValue: new Uint8Array(32).fill(0),
    },
    openings: {
      firstNameOpening: new Uint8Array(32).fill(1),
      lastNameOpening: new Uint8Array(32).fill(2),
      dateOfBirthOpening: new Uint8Array(32).fill(3),
      documentNumberOpening: new Uint8Array(32),
      issuingStateOpening: new Uint8Array(32).fill(4),
    },
  };

  it("accepts zero-filled document-number private parts when the commitment is the null sentinel", () => {
    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        claimCommitments,
        claimRoot,
        privateParts,
      ),
    ).not.toThrow();
  });

  it("rejects a non-zero document-number value when the commitment is the null sentinel", () => {
    const tampered = {
      claimValues: {
        ...privateParts.claimValues,
        documentNumberValue: new Uint8Array(32).fill(1),
      },
      openings: privateParts.openings,
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        claimCommitments,
        claimRoot,
        tampered,
      ),
    ).toThrow(/Private-parts document-number value must be zero-filled when document number is absent/);
  });

  it("rejects a non-zero document-number opening when the commitment is the null sentinel", () => {
    const tampered = {
      claimValues: privateParts.claimValues,
      openings: {
        ...privateParts.openings,
        documentNumberOpening: new Uint8Array(32).fill(1),
      },
    };

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        claimCommitments,
        claimRoot,
        tampered,
      ),
    ).toThrow(/Private-parts document-number opening must be zero-filled when document number is absent/);
  });
});

describe("digital-passport credential: private-parts integration with absent document number", () => {
  it("validates private parts through the issuance result when document number is absent", () => {
    const fixture = createDigitalPassportFixtureWithoutDocumentNumber();

    expect(
      fixture.credential.claimCommitments.documentNumberCommitment,
    ).toEqual(pureCircuits.documentNumberNullCommitment());

    expect(() =>
      pureCircuits.assertValidDigitalPassportCredentialPrivateParts(
        fixture.credential.claimCommitments,
        fixture.credential.claimRoot,
        fixture.privateParts,
      ),
    ).not.toThrow();
  });
});