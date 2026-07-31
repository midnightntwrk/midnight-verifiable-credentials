import { describe, expect, it } from "vitest";

import {
  assertStatusOutcome,
  isStatusValid,
  statusIndeterminateCodes,
  statusInvalidityCodes,
  statusModes,
  type StatusVerificationError,
  type StatusVerificationOutcome,
} from "../index.js";

describe("status outcomes", () => {
  it("accepts only an active valid outcome", () => {
    const outcome: StatusVerificationOutcome = {
      verdict: "valid",
      state: "active",
    };

    expect(isStatusValid(outcome)).toBe(true);
    expect(() => assertStatusOutcome(outcome)).not.toThrow();
  });

  it.each([
    ["revoked", statusInvalidityCodes.revoked, "invalid"],
    ["stale state", statusInvalidityCodes.staleRegistryState, "invalid"],
    ["unavailable state", statusIndeterminateCodes.statusStateUnavailable, "indeterminate"],
    ["unavailable authority", statusIndeterminateCodes.statusAuthorityUnavailable, "indeterminate"],
  ] as const)("keeps %s distinct and fail-closed", (_label, code, verdict) => {
    const outcome = { verdict, code } as StatusVerificationOutcome;

    expect(isStatusValid(outcome)).toBe(false);
    expect(() => assertStatusOutcome(outcome)).toThrowError(
      expect.objectContaining<Partial<StatusVerificationError>>({ verdict, code }),
    );
  });

  it("does not turn unavailable evidence into revoked", () => {
    const unavailable: StatusVerificationOutcome = {
      verdict: "indeterminate",
      code: "statusStateUnavailable",
    };

    expect(unavailable).not.toEqual({ verdict: "invalid", code: "revoked" });
    expect(statusModes.authorityAttested).toBe("authority-attested");
  });
});
