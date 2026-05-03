import type {
  HolderBindingProfile,
  ProtocolMessageEnvelope,
  SchemaRef,
  VerificationMethodRef,
} from "@midnight-ntwrk/midnight-did-credentials/managed/credentials/contract/index.js";

export type PartyId = string;

export type ProtocolMessageType =
  | "issuance:offer"
  | "issuance:request"
  | "issuance:result"
  | "issuance:rejection"
  | "presentation:request"
  | "presentation:submission"
  | "presentation:rejection"
  | "presentation:result";

export type SecretBirthCredentialIssuanceRejectionCategory =
  | "malformed_request"
  | "offer_request_mismatch"
  | "unknown_offer_reference"
  | "expired_offer"
  | "expired_request";

export type SecretBirthCredentialIssuanceRejection = {
  readonly envelope: ProtocolMessageEnvelope;
  readonly schema: SchemaRef;
  readonly issuerVerificationMethodRef: VerificationMethodRef;
  readonly holderBindingProfile: HolderBindingProfile;
  readonly body: {
    readonly category: SecretBirthCredentialIssuanceRejectionCategory;
    readonly detail: string;
    readonly retryable: boolean;
  };
};

export type SecretBirthCredentialVerificationRejectionCategory =
  | "malformed_submission"
  | "request_submission_mismatch"
  | "unsatisfied_request";

export type SecretBirthCredentialVerificationRejection = {
  readonly envelope: ProtocolMessageEnvelope;
  readonly schema: SchemaRef;
  readonly issuerVerificationMethodRef: VerificationMethodRef;
  readonly holderBindingProfile: HolderBindingProfile;
  readonly body: {
    readonly category: SecretBirthCredentialVerificationRejectionCategory;
    readonly detail: string;
    readonly retryable: boolean;
  };
};

export type ProtocolMessage<TBody = unknown> = {
  readonly type: ProtocolMessageType;
  readonly from: PartyId;
  readonly to: PartyId;
  readonly envelope: ProtocolMessageEnvelope;
  readonly body: TBody;
};
