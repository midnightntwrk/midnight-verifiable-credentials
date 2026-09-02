import { describe, expect, it } from "vitest";

import type { AuthorityEvidenceVerificationResultV1 } from "../authority-evidence.js";
import {
  assertHiddenHolderPublicSurfaceV1,
  deriveAuthenticatedVerifierIdentityDigestV1,
  HiddenHolderPrivacyError,
  snapshotHiddenHolderPublicSurfaceV1,
} from "../hidden-holder-privacy.js";

const secret = new Uint8Array(32).fill(7);

const safeSurface = {
  version: 1,
  kind: "hidden-holder-result",
  approved: true,
  verifierScopedPseudonym: new Uint8Array(32).fill(3),
  presentationBindingDigest: new Uint8Array(32).fill(4),
  status: { verdict: "valid", transcriptDigest: "sha256:abc" },
};

describe("hidden-holder public surface privacy", () => {
  it("snapshots bounded public outputs without retaining binary values", () => {
    expect(snapshotHiddenHolderPublicSurfaceV1(safeSurface)).toMatchInlineSnapshot(`
      {
        "approved": true,
        "kind": "hidden-holder-result",
        "presentationBindingDigest": "<bytes:32>",
        "status": {
          "transcriptDigest": "sha256:abc",
          "verdict": "valid",
        },
        "verifierScopedPseudonym": "<bytes:32>",
        "version": 1,
      }
    `);
  });

  it.each([
    ["credential root", { credentialRoot: "stable" }],
    ["holder secret", { nested: { holderSecret: secret } }],
    ["status handle", { statusHandle: "stable" }],
    ["status opening", { statusOpening: secret }],
    ["status witness", { statusWitness: { siblings: [] } }],
    ["raw proof leaf", { statusLeaf: "stable" }],
  ])("rejects an intentional %s leak fixture", (_label, fixture) => {
    expect(() => assertHiddenHolderPublicSurfaceV1(fixture)).toThrow(HiddenHolderPrivacyError);
    try {
      assertHiddenHolderPublicSurfaceV1(fixture);
    } catch (error) {
      expect(error).toMatchObject({ code: "HIDDEN_HOLDER_PUBLIC_LEAK" });
      expect(String(error)).not.toContain("stable");
      expect(String(error)).not.toContain("070707");
    }
  });

  it("rejects retained secret bytes even under an innocuous field name", () => {
    expect(() => assertHiddenHolderPublicSurfaceV1(
      { artifact: { value: secret } },
      { forbiddenValues: [secret] },
    )).toThrow(/privacy-forbidden value/);
  });

  it("derives verifier identity only from accepted #494 DID/trust evidence", async () => {
    const actor = {
      role: "verifier",
      didEvidence: {
        authenticated: true,
        lifecycleStatus: "active",
        did: "did:midnight:testnet:verifier",
        methodId: "did:midnight:testnet:verifier#key-1",
        keyFingerprint: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        network: "midnight:testnet",
      },
      trustEvidence: {
        authenticated: true,
        status: "active",
        subjectDid: "did:midnight:testnet:verifier",
        methodId: "did:midnight:testnet:verifier#key-1",
        keyFingerprint: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        scope: "vc-verifier",
        epoch: "42",
      },
    };
    const authority = {
      status: "valid",
      decisionStatus: "approved",
      accepted: true,
      transcriptDigest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      transcript: { actors: [actor] },
    } as unknown as AuthorityEvidenceVerificationResultV1;

    const first = await deriveAuthenticatedVerifierIdentityDigestV1(authority);
    const changedEpoch = {
      ...authority,
      transcript: {
        ...authority.transcript,
        actors: [{ ...actor, trustEvidence: { ...actor.trustEvidence, epoch: "43" } }],
      },
    } as unknown as AuthorityEvidenceVerificationResultV1;
    await expect(deriveAuthenticatedVerifierIdentityDigestV1(changedEpoch))
      .resolves.not.toBe(first);
    await expect(deriveAuthenticatedVerifierIdentityDigestV1({
      ...authority,
      accepted: false,
    })).rejects.toMatchObject({ code: "HIDDEN_HOLDER_PUBLIC_LEAK" });
  });

  it("snapshots every public, retained, log, error, and artifact privacy surface", () => {
    const surfaces = {
      request: {
        kind: "hidden-holder-request",
        verifierPseudonymScope: {
          verifierIdentityDigest: new Uint8Array(32).fill(1),
          executionContextDigest: new Uint8Array(32).fill(2),
          audienceDigest: new Uint8Array(32).fill(3),
          originDigest: new Uint8Array(32).fill(4),
          consentDigest: new Uint8Array(32).fill(5),
          requestDigest: new Uint8Array(32).fill(6),
          challengeDigest: new Uint8Array(32).fill(7),
        },
      },
      submissionVisible: {
        revealVerifierScopedPseudonym: true,
        verifierScopedPseudonym: new Uint8Array(32).fill(3),
        proveAgeOverThreshold: true,
        ageThresholdYears: 18,
      },
      result: safeSurface,
      retained: { kind: "approved", result: safeSurface },
      receipt: {
        kind: "hidden-holder-receipt",
        transcriptDigest: "sha256:receipt",
        presentationBindingDigest: new Uint8Array(32).fill(4),
      },
      event: { kind: "verification-completed", requestDigest: "sha256:req" },
      error: { code: "PRIVATE_STATUS_PROOF_UNAVAILABLE", retryable: true },
      log: { level: "warn", code: "PRIVATE_STATUS_PROOF_UNAVAILABLE" },
      artifact: { formatVersion: 1, transcriptDigest: "sha256:scoped" },
    };

    expect(assertHiddenHolderPublicSurfaceV1(surfaces)).toBe(surfaces);
    expect(snapshotHiddenHolderPublicSurfaceV1(surfaces)).toMatchInlineSnapshot(`
      {
        "artifact": {
          "formatVersion": 1,
          "transcriptDigest": "sha256:scoped",
        },
        "error": {
          "code": "PRIVATE_STATUS_PROOF_UNAVAILABLE",
          "retryable": true,
        },
        "event": {
          "kind": "verification-completed",
          "requestDigest": "sha256:req",
        },
        "log": {
          "code": "PRIVATE_STATUS_PROOF_UNAVAILABLE",
          "level": "warn",
        },
        "receipt": {
          "kind": "hidden-holder-receipt",
          "presentationBindingDigest": "<bytes:32>",
          "transcriptDigest": "sha256:receipt",
        },
        "request": {
          "kind": "hidden-holder-request",
          "verifierPseudonymScope": {
            "audienceDigest": "<bytes:32>",
            "challengeDigest": "<bytes:32>",
            "consentDigest": "<bytes:32>",
            "executionContextDigest": "<bytes:32>",
            "originDigest": "<bytes:32>",
            "requestDigest": "<bytes:32>",
            "verifierIdentityDigest": "<bytes:32>",
          },
        },
        "result": {
          "approved": true,
          "kind": "hidden-holder-result",
          "presentationBindingDigest": "<bytes:32>",
          "status": {
            "transcriptDigest": "sha256:abc",
            "verdict": "valid",
          },
          "verifierScopedPseudonym": "<bytes:32>",
          "version": 1,
        },
        "retained": {
          "kind": "approved",
          "result": "<cycle>",
        },
        "submissionVisible": {
          "ageThresholdYears": 18,
          "proveAgeOverThreshold": true,
          "revealVerifierScopedPseudonym": true,
          "verifierScopedPseudonym": "<bytes:32>",
        },
      }
    `);
  });
});
