import type { StatusBinding } from "./bindings.js";
import type { StatusVerificationOutcome } from "./outcomes.js";
import type { StatusEvidence, StatusPolicy, StatusQuery } from "./policy.js";

export type StatusReadResult =
  | { readonly kind: "evidence"; readonly evidence: StatusEvidence }
  | { readonly kind: "unavailable"; readonly code: "statusAuthorityUnavailable" | "statusStateUnavailable" | "statusProofUnavailable" | "trustedTimeUnavailable" };

export type StatusWriteRequest<TMutation> = {
  readonly binding: StatusBinding;
  readonly mutation: TMutation;
  /** Authorization is supplied by a later authority adapter; this package does not implement it. */
  readonly authorization: unknown;
};

export type StatusWriteResult<TReceipt = unknown> = {
  readonly receipt: TReceipt;
};

export type StatusVerificationRequest<TEvidence = StatusEvidence> = {
  readonly binding: StatusBinding;
  readonly evidence: TEvidence;
  readonly policy: StatusPolicy;
};

export interface StatusReader {
  read(query: StatusQuery): Promise<StatusReadResult>;
}

export interface StatusWriter<TMutation = unknown, TReceipt = unknown> {
  write(request: StatusWriteRequest<TMutation>): Promise<StatusWriteResult<TReceipt>>;
}

export interface StatusVerifier<TEvidence = StatusEvidence> {
  verify(
    request: StatusVerificationRequest<TEvidence>,
  ): Promise<StatusVerificationOutcome> | StatusVerificationOutcome;
}

/** A verifier-facing helper that keeps binding and evidence separate from adapters. */
export type StatusVerificationPort<TEvidence = StatusEvidence> = StatusVerifier<TEvidence>;

/** A read-only view useful to adapters that expose only the binding. */
export type StatusBindingReader = StatusReader & {
  readonly binding?: StatusBinding;
};
