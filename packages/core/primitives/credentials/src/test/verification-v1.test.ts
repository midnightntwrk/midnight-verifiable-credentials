import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  asBytes32,
  hashAnchorEvidenceReceiptV1,
  hashConsentBindingV1,
  hashCredentialBindingV1,
  hashDecisionNullifierMaterialV1,
  hashEvidenceBindingV1,
  hashHolderBindingV1,
  hashPresentationBindingV1,
  hashSyntheticVerificationExtensionV1,
  hashVerificationTranscriptV1,
  type LedgerVerificationReceiptV1,
  type LocalVerificationAttemptV1,
  preflightVerification,
  prepareVerification,
  submitLedgerVerification,
  verificationDomainV1,
  verifyPublicOffchain,
} from "../index.js";
import {
  pureCircuits,
  type VerificationPublicInputsV1,
  type VerificationTranscriptV1,
} from "../managed/credentials/contract/index.js";
import {
  createVerificationV1Fixture,
  digest,
} from "./verification-v1-fixtures.js";

setNetworkId("undeployed");

const toHex = (value: Uint8Array): string =>
  Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");

const cloneFixtureValue = <T>(value: T): T => {
  if (value instanceof Uint8Array) {
    return Uint8Array.from(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map(cloneFixtureValue) as T;
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        cloneFixtureValue(entry),
      ]),
    ) as T;
  }
  return value;
};

const EXPECTED_VECTORS = {
  credential:
    "92ad1a5eb72e9fa503c3600726dd9fa238ee16cfbc07bb6f22900020dc23958c",
  holder: "3b2bae2cb1179b2c7cdbf8e45d61c0ba214a51a90890c945e1e2eae7a6278dbb",
  consent: "0fef22f8bf75615ed86a14350ea06742867d387df3ccf44250b6601b4b4a71b2",
  presentation:
    "e3ff7658463d98ec8220839553fcc399d392f60d9f5b1b2e6b1f47d1ecda0697",
  evidence: "4f242b6b5736b0f3f075e2772e379a4e2b2f1827d394c240f2273e42e82c7e02",
  receipt: "273a162b03ce606d63d19a2bbf467a9fdd8076e2a862e03a3a488a37d4d3de48",
  nullifier: "2fdb3e38ba1a26e1d5b919cbcab8e444bfe319e6633370aee8b79bd6591aa98d",
  extension: "c6a80b82bbbf6bee430c792e7e58b517e55ededd9e3e59484f9ec97bf7285b85",
  transcript:
    "20cc76e018b642a2a2bd9eec97181eed6ab32c1872f0c2e73f12389691ea3954",
} as const;

const TRANSCRIPT_FIELDS = [
  "domain",
  "version",
  "profile",
  "authority",
  "networkIdDigest",
  "verifierContractDigest",
  "deploymentDigest",
  "audienceDigest",
  "originMode",
  "originDigest",
  "connectorEvidenceDigest",
  "requestIdDigest",
  "challengeDigest",
  "expiresAt",
  "credentialFamilyDigest",
  "schemaDigest",
  "credentialBindingMode",
  "credentialBindingDigest",
  "disclosureDigest",
  "predicateDigest",
  "holderBindingDigest",
  "policyDigest",
  "actionClassDigest",
  "actionInvocationDigest",
  "consentDigest",
  "presentationBindingDigest",
  "issuerDidDigest",
  "issuerMethodDigest",
  "issuerRelationship",
  "issuerEvidenceDigest",
  "trustScopeDigest",
  "trustEvidenceDigest",
  "statusMode",
  "statusRegistryDigest",
  "statusRoot",
  "statusRegistryVersion",
  "statusFreshnessPolicyDigest",
  "statusEvidenceDigest",
  "timeMode",
  "trustedTime",
  "timeEvidenceDigest",
  "artifactManifestDigest",
  "artifactEvidenceDigest",
  "nullifierMode",
  "replayPolicy",
  "replayScopeDigest",
  "decisionNullifier",
] as const satisfies readonly (keyof VerificationTranscriptV1)[];

const mutateTranscriptField = (
  transcript: VerificationTranscriptV1,
  key: keyof VerificationTranscriptV1,
): VerificationTranscriptV1 => {
  const mutated = cloneFixtureValue(transcript);
  const record = mutated as unknown as Record<
    keyof VerificationTranscriptV1,
    bigint | Uint8Array
  >;
  const value = record[key];
  if (typeof value === "bigint") {
    record[key] = value + 1n;
  } else {
    const bytes = Uint8Array.from(value);
    bytes[0] ^= 0xff;
    record[key] = bytes;
  }
  return mutated;
};

const withTranscript = (
  inputs: VerificationPublicInputsV1,
  transcript: VerificationTranscriptV1,
): VerificationPublicInputsV1 => ({
  ...cloneFixtureValue(inputs),
  transcript,
});

describe("credentials core: verification contract v1", () => {
  it("keeps domain separators aligned with the generated Compact circuits", () => {
    const domains = [
      [
        "transcript",
        "midnight:vc:verification-transcript:v1",
        pureCircuits.verificationTranscriptDomainV1,
      ],
      [
        "decisionNullifier",
        "midnight:vc:decision-nullifier:v1",
        pureCircuits.decisionNullifierDomainV1,
      ],
      [
        "credentialBinding",
        "midnight:vc:credential-binding:v1",
        pureCircuits.credentialBindingDomainV1,
      ],
      [
        "holderBinding",
        "midnight:vc:holder-binding:v1",
        pureCircuits.holderBindingDomainV1,
      ],
      [
        "consentBinding",
        "midnight:vc:consent-binding:v1",
        pureCircuits.consentBindingDomainV1,
      ],
      [
        "presentationBinding",
        "midnight:vc:presentation-binding:v1",
        pureCircuits.presentationBindingDomainV1,
      ],
      [
        "issuerEvidence",
        "midnight:vc:evidence:issuer:v1",
        pureCircuits.issuerEvidenceDomainV1,
      ],
      [
        "trustEvidence",
        "midnight:vc:evidence:trust:v1",
        pureCircuits.trustEvidenceDomainV1,
      ],
      [
        "statusEvidence",
        "midnight:vc:evidence:status:v1",
        pureCircuits.statusEvidenceDomainV1,
      ],
      [
        "timeEvidence",
        "midnight:vc:evidence:time:v1",
        pureCircuits.timeEvidenceDomainV1,
      ],
      [
        "artifactEvidence",
        "midnight:vc:evidence:artifact:v1",
        pureCircuits.artifactEvidenceDomainV1,
      ],
      [
        "connectorEvidence",
        "midnight:vc:evidence:connector:v1",
        pureCircuits.connectorEvidenceDomainV1,
      ],
      [
        "anchorEvidenceReceipt",
        "midnight:vc:anchor-evidence-receipt:v1",
        pureCircuits.anchorEvidenceReceiptDomainV1,
      ],
      [
        "syntheticExtension",
        "midnight:vc:synthetic-extension:v1",
        pureCircuits.syntheticVerificationExtensionDomainV1,
      ],
    ] as const;

    for (const [name, identifier, compactDomain] of domains) {
      expect(verificationDomainV1(name)).toEqual(digest(identifier));
      expect(verificationDomainV1(name)).toEqual(compactDomain());
    }
  });

  it("matches checked-in Compact persistent-hash vectors", () => {
    const fixture = createVerificationV1Fixture();
    const vectors = [
      [
        "credential",
        hashCredentialBindingV1(fixture.credentialBinding),
        pureCircuits.credentialBindingV1Digest(fixture.credentialBinding),
      ],
      [
        "holder",
        hashHolderBindingV1(fixture.holderBinding),
        pureCircuits.holderBindingV1Digest(fixture.holderBinding),
      ],
      [
        "consent",
        hashConsentBindingV1(fixture.consentBinding),
        pureCircuits.consentBindingV1Digest(fixture.consentBinding),
      ],
      [
        "presentation",
        hashPresentationBindingV1(fixture.presentationBinding),
        pureCircuits.presentationBindingV1Digest(fixture.presentationBinding),
      ],
      [
        "evidence",
        hashEvidenceBindingV1(fixture.issuerEvidence),
        pureCircuits.evidenceBindingV1Digest(fixture.issuerEvidence),
      ],
      [
        "receipt",
        hashAnchorEvidenceReceiptV1(fixture.anchorEvidenceReceipt),
        pureCircuits.anchorEvidenceReceiptV1Digest(
          fixture.anchorEvidenceReceipt,
        ),
      ],
      [
        "nullifier",
        hashDecisionNullifierMaterialV1(fixture.decisionNullifierMaterial),
        pureCircuits.decisionNullifierMaterialV1Digest(
          fixture.decisionNullifierMaterial,
        ),
      ],
      [
        "extension",
        hashSyntheticVerificationExtensionV1(fixture.syntheticExtension),
        pureCircuits.syntheticVerificationExtensionV1Digest(
          fixture.syntheticExtension,
        ),
      ],
      [
        "transcript",
        hashVerificationTranscriptV1(fixture.transcript),
        pureCircuits.verificationTranscriptV1Digest(fixture.transcript),
      ],
    ] as const;

    for (const [name, runtimeDigest, compactDigest] of vectors) {
      expect(toHex(runtimeDigest)).toBe(EXPECTED_VECTORS[name]);
      expect(toHex(compactDigest)).toBe(EXPECTED_VECTORS[name]);
    }
  });

  it("wires a synthetic unavailable-authority attempt to the transcript", () => {
    const fixture = createVerificationV1Fixture();
    const transcriptDigest = hashVerificationTranscriptV1(fixture.transcript);

    const attempt = pureCircuits.syntheticUnavailableAuthorityVerificationV1(
      fixture.publicInputs,
      transcriptDigest,
    );

    expect(attempt).toEqual({
      proofStatus: 2n,
      decisionStatus: 0n,
      authority: 3n,
      executionStatus: 0n,
      transcriptDigest,
    });
  });

  it("binds every transcript field into the direct Compact path", () => {
    const fixture = createVerificationV1Fixture();
    const expectedDigest = hashVerificationTranscriptV1(fixture.transcript);

    expect(TRANSCRIPT_FIELDS).toHaveLength(47);
    expect(TRANSCRIPT_FIELDS).toEqual(Object.keys(fixture.transcript));

    for (const field of TRANSCRIPT_FIELDS) {
      const mutated = withTranscript(
        fixture.publicInputs,
        mutateTranscriptField(fixture.transcript, field),
      );
      expect(
        () =>
          pureCircuits.syntheticUnavailableAuthorityVerificationV1(
            mutated,
            expectedDigest,
          ),
        field,
      ).toThrow();
    }
  });

  it("rejects every unknown transcript code", () => {
    const fixture = createVerificationV1Fixture();
    const cases = [
      ["profile", 4n, /Verification profile is unknown/],
      ["authority", 4n, /Verification authority is unknown/],
      ["credentialBindingMode", 3n, /Credential binding mode is unknown/],
      ["originMode", 3n, /Origin mode is unknown/],
      ["issuerRelationship", 4n, /Issuer relationship is unknown/],
      ["statusMode", 4n, /Status mode is unknown/],
      ["timeMode", 3n, /Time mode is unknown/],
      ["nullifierMode", 2n, /Nullifier mode is unknown/],
      ["replayPolicy", 4n, /Replay policy is unknown/],
    ] as const satisfies readonly (readonly [
      keyof VerificationTranscriptV1,
      bigint,
      RegExp,
    ])[];

    for (const [field, code, error] of cases) {
      const transcript = cloneFixtureValue(fixture.transcript);
      const record = transcript as unknown as Record<
        keyof VerificationTranscriptV1,
        bigint | Uint8Array
      >;
      record[field] = code;
      expect(
        () =>
          pureCircuits.syntheticUnavailableAuthorityVerificationV1(
            withTranscript(fixture.publicInputs, transcript),
            pureCircuits.verificationTranscriptV1Digest(transcript),
          ),
        field,
      ).toThrow(error);
    }
  });

  it("rejects unknown versions, evidence codes, and wrong-zero encodings", () => {
    const fixture = createVerificationV1Fixture();

    const unknownVersion = cloneFixtureValue(fixture.transcript);
    unknownVersion.version = 2n;
    expect(() =>
      pureCircuits.syntheticUnavailableAuthorityVerificationV1(
        withTranscript(fixture.publicInputs, unknownVersion),
        pureCircuits.verificationTranscriptV1Digest(unknownVersion),
      ),
    ).toThrow(/Transcript version must be 1/);

    const unknownEvidenceMode = cloneFixtureValue(fixture.issuerEvidence);
    unknownEvidenceMode.mode = 5n;
    expect(() =>
      pureCircuits.assertValidEvidenceBindingV1(
        unknownEvidenceMode,
        verificationDomainV1("issuerEvidence"),
      ),
    ).toThrow(/Evidence mode is unknown/);

    const unknownEvidenceVersion = cloneFixtureValue(fixture.issuerEvidence);
    unknownEvidenceVersion.version = 2n;
    expect(() =>
      pureCircuits.assertValidEvidenceBindingV1(
        unknownEvidenceVersion,
        verificationDomainV1("issuerEvidence"),
      ),
    ).toThrow(/Evidence version must be 1/);

    const wrongZero = cloneFixtureValue(fixture.transcript);
    wrongZero.originDigest = digest("verification-v1:forbidden-origin");
    expect(() =>
      pureCircuits.syntheticUnavailableAuthorityVerificationV1(
        withTranscript(fixture.publicInputs, wrongZero),
        pureCircuits.verificationTranscriptV1Digest(wrongZero),
      ),
    ).toThrow(/No-origin digest must be zero/);

    const missingNetwork = cloneFixtureValue(fixture.transcript);
    missingNetwork.networkIdDigest = new Uint8Array(32);
    expect(() =>
      pureCircuits.syntheticUnavailableAuthorityVerificationV1(
        withTranscript(fixture.publicInputs, missingNetwork),
        pureCircuits.verificationTranscriptV1Digest(missingNetwork),
      ),
    ).toThrow(/Network digest must be set/);

    const malformedEvidence = cloneFixtureValue(fixture.statusEvidence);
    malformedEvidence.subjectDigest = digest(
      "verification-v1:forbidden-status-subject",
    );
    const malformedInputs = cloneFixtureValue(fixture.publicInputs);
    malformedInputs.statusEvidence = malformedEvidence;
    malformedInputs.transcript.statusEvidenceDigest =
      pureCircuits.evidenceBindingV1Digest(malformedEvidence);
    expect(() =>
      pureCircuits.syntheticUnavailableAuthorityVerificationV1(
        malformedInputs,
        pureCircuits.verificationTranscriptV1Digest(malformedInputs.transcript),
      ),
    ).toThrow(/Not-required evidence subject must be zero/);

    const missingUnavailableSubject = cloneFixtureValue(fixture.issuerEvidence);
    missingUnavailableSubject.subjectDigest = new Uint8Array(32);
    expect(() =>
      pureCircuits.assertValidEvidenceBindingV1(
        missingUnavailableSubject,
        verificationDomainV1("issuerEvidence"),
      ),
    ).toThrow(/Unavailable evidence subject must be scoped/);
  });

  it("prepares defensively and keeps unavailable adapters fail-closed", async () => {
    const fixture = createVerificationV1Fixture();
    const prepared = prepareVerification(
      "ledger-local-v1",
      fixture.publicInputs,
    );
    expect(prepared.kind).toBe("prepared-verification");
    if (prepared.kind !== "prepared-verification") return;

    expect(prepared.unavailableEvidence).toEqual([
      "issuer",
      "trust",
      "artifact",
    ]);
    expect(preflightVerification(prepared)).toMatchObject({
      proofStatus: "indeterminate",
      decisionStatus: "notEvaluated",
      executionStatus: "notSubmitted",
      reasonCode: "authority-unavailable-v1",
    });
    expect(await submitLedgerVerification(prepared)).toMatchObject({
      proofStatus: "indeterminate",
      reasonCode: "ledger-adapter-unavailable-v1",
    });
    expect(verifyPublicOffchain(prepared)).toMatchObject({
      proofStatus: "malformed",
      reasonCode: "profile-mismatch-v1",
    });
  });

  it("rejects malformed bytes and profile mismatches before verification", () => {
    const fixture = createVerificationV1Fixture();
    const malformed = cloneFixtureValue(fixture.publicInputs);
    malformed.transcript.challengeDigest = new Uint8Array(31);

    expect(prepareVerification("ledger-local-v1", malformed)).toMatchObject({
      proofStatus: "malformed",
      reasonCode: "malformed-input-v1",
    });
    expect(
      prepareVerification("offchain-public-v1", fixture.publicInputs),
    ).toMatchObject({
      proofStatus: "malformed",
      reasonCode: "profile-mismatch-v1",
    });
    expect(() => asBytes32(new Uint8Array(31))).toThrow(/Expected 32 bytes/);
    expect(() =>
      prepareVerification("unknown-profile" as never, fixture.publicInputs),
    ).toThrow(/Unknown verification profile/);

    const source = digest("verification-v1:defensive-copy");
    const copied = asBytes32(source);
    source[0] ^= 0xff;
    expect(copied).not.toEqual(source);
  });

  it("makes impossible result combinations unrepresentable", () => {
    expectTypeOf<
      Extract<LocalVerificationAttemptV1, { executionStatus: "committed" }>
    >().toEqualTypeOf<never>();
    expectTypeOf<
      Extract<LedgerVerificationReceiptV1, { proofStatus: "indeterminate" }>
    >().toEqualTypeOf<never>();
    expectTypeOf<
      Extract<LedgerVerificationReceiptV1, { authority: "local-process" }>
    >().toEqualTypeOf<never>();
    expectTypeOf<
      Extract<
        LedgerVerificationReceiptV1,
        { profile: "ledger-local-v1"; authority: "ledger-attested" }
      >
    >().toEqualTypeOf<never>();
  });
});
