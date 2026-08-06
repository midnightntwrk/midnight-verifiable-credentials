import {
  assertStatusOutcome,
  statusModes,
  type StatusBinding,
  type StatusReader,
  type StatusVerificationOutcome,
} from "@midnight-ntwrk/credential-status";

const binding: StatusBinding = { mode: "none" };
const reader: StatusReader = {
  read: async () => ({ kind: "unavailable", code: "statusStateUnavailable" }),
};
const outcome: StatusVerificationOutcome = {
  verdict: "indeterminate",
  code: "statusStateUnavailable",
};

export const evidence = {
  binding,
  mode: statusModes.none,
  reader,
  outcome,
  acceptsOnlyValid: (() => {
    try {
      assertStatusOutcome(outcome);
      return false;
    } catch {
      return true;
    }
  })(),
};
