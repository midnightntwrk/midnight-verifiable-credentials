import { readFileSync } from "node:fs";
import path from "node:path";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";

import { pureCircuits } from "../managed/passport-kyc-credential/contract/index.js";
import { createPassportKycFixture } from "../testing/credential-fixtures.js";

setNetworkId("undeployed");

const claimsSource = readFileSync(
  path.resolve(
    import.meta.dirname,
    "..",
    "passport-kyc-credential",
    "claims.compact",
  ),
  "utf8",
);

describe("passport-kyc claim root", () => {
  it("uses a family-scoped domain separation tag", () => {
    expect(claimsSource).toContain("midnight:vc:passport-kyc:v1");
  });

  it("commits each claim field through a domain-separated claim root", () => {
    const fixture = createPassportKycFixture();

    // The claim root should change if any commitment changes.
    const root1 = pureCircuits.passportKycClaimRoot(
      fixture.credential.claimCommitments,
    );
    expect(root1).toBeInstanceOf(Uint8Array);
    expect(root1.length).toBe(32);

    // Altering one commitment must produce a different root.
    const alteredCommitments = {
      ...fixture.credential.claimCommitments,
      dateOfBirthCommitment: new Uint8Array(32).fill(99),
    };
    const root2 = pureCircuits.passportKycClaimRoot(alteredCommitments);
    expect(root2).not.toEqual(root1);
  });

  it("produces deterministic commitments for each field", () => {
    const fixture = createPassportKycFixture();

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

    expect(firstNameCommit).toEqual(
      fixture.credential.claimCommitments.firstNameCommitment,
    );
    expect(lastNameCommit).toEqual(
      fixture.credential.claimCommitments.lastNameCommitment,
    );
    expect(dateOfBirthCommit).toEqual(
      fixture.credential.claimCommitments.dateOfBirthCommitment,
    );

    // Opening the same value with a different opening must produce a different commitment.
    const differentOpening = new Uint8Array(32).fill(42);
    const firstNameCommit2 = pureCircuits.firstNameCommitment(
      fixture.witness.firstNameValuePadded,
      differentOpening,
    );
    expect(firstNameCommit2).not.toEqual(firstNameCommit);
  });
});
