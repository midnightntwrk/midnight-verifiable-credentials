import type {
  CredentialFamilyDefinition,
  CredentialFamilyReference as RuntimeCredentialFamilyReference,
  CredentialSchemaDescriptor,
} from "@midnight-ntwrk/credential-model";

import type { CanonicalMessage } from "./canonical-messages.js";

export type CredentialFamilyReference = Pick<
  CredentialFamilyDefinition<unknown, unknown>,
  "id" | "version"
> & {
  readonly schema: Pick<CredentialSchemaDescriptor, "id" | "version">;
};

export interface IssuanceAdapter {
  createOffer(input?: unknown): CanonicalMessage<"issuance-offer">;
  createRequest(
    offer: CanonicalMessage<"issuance-offer">,
    input?: unknown,
  ): CanonicalMessage<"issuance-request">;
  issue(
    request: CanonicalMessage<"issuance-request">,
    input?: unknown,
  ): CanonicalMessage<"credential">;
  accept(
    credential: CanonicalMessage<"credential">,
  ): CanonicalMessage<"credential">;
}

export interface PresentationAdapter {
  createRequest(input?: unknown): CanonicalMessage<"presentation-request">;
  present(
    credential: CanonicalMessage<"credential">,
    request: CanonicalMessage<"presentation-request">,
    input?: unknown,
  ): CanonicalMessage<"presentation">;
}

export interface VerificationResult {
  readonly valid: boolean;
  readonly canonicalPresentation: CanonicalMessage<"presentation">;
  readonly reason?: string;
}

export interface VerificationAdapter<
  TResult extends VerificationResult = VerificationResult,
> {
  verify(
    presentation: CanonicalMessage<"presentation">,
    request: CanonicalMessage<"presentation-request">,
    input?: unknown,
  ): TResult;
}

/** Agents deliberately consume an already resolved adapter by injection. */
export interface InjectedCredentialFamilyAdapter<
  TResult extends VerificationResult = VerificationResult,
> {
  readonly family: CredentialFamilyReference;
  readonly issuance: IssuanceAdapter;
  readonly presentation: PresentationAdapter;
  readonly verification: VerificationAdapter<TResult>;
}

type UnknownRecord = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasFunction = (value: unknown, key: string): boolean =>
  isRecord(value) && typeof value[key] === "function";

/** Runtime guard suitable for `credential-model`'s injected surface validator. */
export const isInjectedCredentialFamilyAdapter = (
  value: unknown,
): value is InjectedCredentialFamilyAdapter => {
  if (!isRecord(value) || !isRecord(value.family)) return false;
  const family = value.family;
  if (
    !isNonEmptyString(family.id) ||
    !isNonEmptyString(family.version) ||
    !isRecord(family.schema) ||
    !isNonEmptyString(family.schema.id) ||
    !isNonEmptyString(family.schema.version)
  ) {
    return false;
  }

  return (
    hasFunction(value.issuance, "createOffer") &&
    hasFunction(value.issuance, "createRequest") &&
    hasFunction(value.issuance, "issue") &&
    hasFunction(value.issuance, "accept") &&
    hasFunction(value.presentation, "createRequest") &&
    hasFunction(value.presentation, "present") &&
    hasFunction(value.verification, "verify")
  );
};

export const isInjectedCredentialFamilyAdapterFor = (
  reference: RuntimeCredentialFamilyReference,
  value: unknown,
): value is InjectedCredentialFamilyAdapter =>
  isInjectedCredentialFamilyAdapter(value) &&
  value.family.id === reference.id &&
  value.family.version === reference.version &&
  value.family.schema.id === reference.schemaId &&
  value.family.schema.version === reference.schemaVersion;
