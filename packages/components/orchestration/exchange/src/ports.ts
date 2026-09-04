import type {
  CredentialFamilyDefinition,
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

/** Direct injection is deliberate; family discovery/resolution is out of scope. */
export interface InjectedCredentialFamilyAdapter<
  TResult extends VerificationResult = VerificationResult,
> {
  readonly family: CredentialFamilyReference;
  readonly issuance: IssuanceAdapter;
  readonly presentation: PresentationAdapter;
  readonly verification: VerificationAdapter<TResult>;
}
