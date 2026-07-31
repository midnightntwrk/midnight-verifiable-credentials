import type { EnabledStatusMode, StatusMode } from "./bindings.js";

export type StatusState = "active" | "suspended" | "revoked" | "expired";

/** Version and evidence-age requirements; no clock or authority is selected here. */
export type FreshnessPolicy = {
  readonly minimumVersion?: bigint;
  readonly maximumAge?: bigint;
  readonly requireFreshEvidence: boolean;
};

export type StatusPolicy = {
  readonly required: boolean;
  readonly acceptedModes: readonly EnabledStatusMode[];
  readonly freshness?: FreshnessPolicy;
  readonly acceptedStates?: readonly StatusState[];
};

export type StatusEvidence = {
  readonly mode: StatusMode;
  readonly state: StatusState;
  readonly version?: bigint;
  readonly observedAt?: bigint;
  readonly expiresAt?: bigint;
  readonly payload?: unknown;
};

export type StatusQuery = {
  readonly binding: StatusBindingForQuery;
  readonly policy: StatusPolicy;
};

export type StatusBindingForQuery = {
  readonly mode: StatusMode;
  readonly statusType?: string;
  readonly statusReference?: string | Uint8Array;
  readonly statusHandle?: string | Uint8Array;
};
