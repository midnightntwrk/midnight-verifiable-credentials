import { readFileSync } from "node:fs";
import path from "node:path";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/digital-passport-credential/contract/index.js";
import { createDigitalPassportFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

const claimsSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "digital-passport-credential",
    "claims.compact",
  ),
  "utf8",
);

describe("digital-passport claim root", () => {
  it("uses a family-scoped domain separation tag", () => {
    expect(claimsSource).toContain("midnight:vc:digital-passport:v1");
  });

  it("commits each claim field through a domain-separated claim root", () => {
    const fixture = createDigitalPassportFixture();

    // The claim root should change if any commitment changes.
    const root1 = pureCircuits.digitalPassportClaimRoot(
      fixture.credential.claimCommitments,
    );
    expect(root1).toBeInstanceOf(Uint8Array);
    expect(root1.length).toBe(32);

    // Altering one commitment must produce a different root.
    const alteredCommitments = {
      ...fixture.credential.claimCommitments,
      dateOfBirthCommitment: new Uint8Array(32).fill(99),
    };
    const root2 = pureCircuits.digitalPassportClaimRoot(alteredCommitments);
    expect(root2).not.toEqual(root1);
  });

  it("produces deterministic commitments for each field", () => {
    const fixture = createDigitalPassportFixture();

    const firstNameCommit = pureCircuits.firstNameCommitment(
      fixture.witness.firstNameValuePadded,
      fixture.witness.firstNameOpening,
    );
    const lastNameCommit = pureCircuits.lastNameCommitment(
      fixture.witness.lastNameValuePadded,
      fixture.witness.lastNameOpening,
    );
    const dateOfBirthCommit = pureCircuits.dateOfBirthCommitment(
      fixture.witness.dateOfBirthDays,
      fixture.witness.dateOfBirthOpening,
    );
    const documentNumberCommit = pureCircuits.documentNumberCommitment(
      fixture.witness.documentNumberValue,
      fixture.witness.documentNumberOpening,
    );
    const issuingStateCommit = pureCircuits.issuingStateCommitment(
      fixture.witness.issuingStateValue,
      fixture.witness.issuingStateOpening,
    );

    expect(firstNameCommit).toEqual(
      fixture.credential.claimCommitments.firstNameCommitment,
    );
    expect(lastNameCommit).toEqual(
      fixture.credential.claimCommitments.lastNameCommitment,
    );
    expect(dateOfBirthCommit).toEqual(
      fixture.credential.claimCommitments.dateOfBirthCommitment,
    );
    expect(documentNumberCommit).toEqual(
      fixture.credential.claimCommitments.documentNumberCommitment,
    );
    expect(issuingStateCommit).toEqual(
      fixture.credential.claimCommitments.issuingStateCommitment,
    );

    // Opening the same value with a different opening must produce a different commitment.
    const differentOpening = new Uint8Array(32).fill(42);
    const firstNameCommit2 = pureCircuits.firstNameCommitment(
      fixture.witness.firstNameValuePadded,
      differentOpening,
    );
    expect(firstNameCommit2).not.toEqual(firstNameCommit);
  });

  it("produces a deterministic null commitment for absent documentNumber", () => {
    const nullCommit1 = pureCircuits.documentNumberNullCommitment();
    const nullCommit2 = pureCircuits.documentNumberNullCommitment();
    expect(nullCommit1).toBeInstanceOf(Uint8Array);
    expect(nullCommit1.length).toBe(32);
    expect(nullCommit1).toEqual(nullCommit2);

    // The null commitment must differ from any real documentNumber commitment.
    const fixture = createDigitalPassportFixture();
    expect(nullCommit1).not.toEqual(
      fixture.credential.claimCommitments.documentNumberCommitment,
    );
  });
});
