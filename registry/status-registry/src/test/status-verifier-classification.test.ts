import { describe, expect, it } from "vitest";

import {
  describeStatusVerificationFailure,
  normalizeStatusVerificationFailure,
  StatusHelperError,
  StatusVerificationError,
  statusVerificationErrorCodes,
  type StatusVerificationMode,
} from "../index.js";

type ClassificationCase = {
  readonly title: string;
  readonly mode: StatusVerificationMode;
  readonly error: string;
  readonly code: string;
};

const rawCases: readonly ClassificationCase[] = [
  {
    title:
      "maps verifier-supplied-root demo policy mismatch to unsupported mode",
    mode: "revokedSetObservedState",
    error:
      "failed assert: Revocation demo verifier-supplied-root request must require revoked-set status support",
    code: statusVerificationErrorCodes.unsupportedStatusProofMode,
  },
  {
    title: "maps live-status demo policy mismatch to unsupported mode",
    mode: "liveContractState",
    error:
      "failed assert: Verifier status policy does not accept live revoked-set verification",
    code: statusVerificationErrorCodes.unsupportedStatusProofMode,
  },
  {
    title: "maps wrong authority contract-address failures",
    mode: "authorityAttested",
    error:
      "failed assert: Authority-attested proof contract address does not match the status authority",
    code: statusVerificationErrorCodes.authorityMismatch,
  },
  {
    title: "maps authority-attested freshness failures",
    mode: "authorityAttested",
    error:
      "failed assert: Authority-attested status proof exceeds the verifier max-age policy",
    code: statusVerificationErrorCodes.attestationTooOld,
  },
  {
    title: "maps authority-attested future-dated failures",
    mode: "authorityAttested",
    error:
      "failed assert: Authority-attested proof creation time cannot be in the future",
    code: statusVerificationErrorCodes.futureDatedAttestation,
  },
  {
    title: "maps revoked-root request mismatches",
    mode: "revokedSetObservedState",
    error: "failed assert: Revoked root does not match the verifier request",
    code: statusVerificationErrorCodes.statusRequestMismatch,
  },
  {
    title: "maps live registry binding mismatches",
    mode: "liveContractState",
    error:
      "failed assert: Live revocation registry state does not match the status binding registry",
    code: statusVerificationErrorCodes.statusBindingMismatch,
  },
  {
    title: "maps local live-registry revocation hits",
    mode: "liveContractState",
    error: "failed assert: Credential is revoked in the live status registry",
    code: statusVerificationErrorCodes.revoked,
  },
];

describe("status verifier classification", () => {
  for (const testCase of rawCases) {
    it(testCase.title, () => {
      const error = normalizeStatusVerificationFailure({
        mode: testCase.mode,
        error: new Error(testCase.error),
      });

      expect(error.code).toEqual(testCase.code);
      expect(error.mode).toEqual(testCase.mode);
    });
  }

  it("preserves the original helper error as the outer cause", () => {
    const innerCause = new TypeError("broken acceptance policy");
    const helperError = new StatusHelperError({
      code: statusVerificationErrorCodes.unknownRegistry,
      message:
        "Registry deadbeef is not accepted by the verifier registry policy",
      cause: innerCause,
    });

    const error = normalizeStatusVerificationFailure({
      mode: "revokedSetObservedState",
      error: helperError,
    });

    expect(error.code).toEqual(statusVerificationErrorCodes.unknownRegistry);
    expect(error.cause).toBe(helperError);
    expect((error.cause as StatusHelperError).cause).toBe(innerCause);
  });

  it("returns a pre-normalized status verification error unchanged", () => {
    const error = new StatusVerificationError({
      code: statusVerificationErrorCodes.attestationExpired,
      mode: "authorityAttested",
      message: "expired",
    });

    const normalized = normalizeStatusVerificationFailure({
      mode: "liveContractState",
      error,
    });

    expect(normalized).toBe(error);
  });

  it("fails closed on unknown throw shapes with the reserved helper code", () => {
    const error = normalizeStatusVerificationFailure({
      mode: "liveContractState",
      error: 42,
    });

    expect(error.code).toEqual(
      statusVerificationErrorCodes.unclassifiedFailure,
    );
    expect(error.message).toContain("42");
  });

  it("projects canonical failures onto a plain-data record surface", () => {
    const record = describeStatusVerificationFailure({
      mode: "authorityAttested",
      error: new Error(
        "failed assert: Authority-attested proof contract address does not match the status authority",
      ),
    });

    expect(record).toEqual({
      mode: "authorityAttested",
      code: statusVerificationErrorCodes.authorityMismatch,
      message:
        "failed assert: Authority-attested proof contract address does not match the status authority",
    });
  });
});
