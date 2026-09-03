import type {
  CanonicalMessage,
  InjectedCredentialFamilyAdapter,
  VerificationResult,
} from "@midnight-ntwrk/credential-exchange";
import type { BirthCredentialVerificationRequest } from "@midnight-ntwrk/midnight-did-credentials-birth/managed/birth-credential/contract/index.js";

import type { DIDProfile } from "../../agents/types.js";
import { MessageBus } from "../../transport/message-bus.js";
import type { PartyId, ProtocolMessage } from "../../transport/types.js";
import { stableJsonProtocolStateCodec } from "../json-protocol-state-codec.js";
import { HolderAgent, type PresentationWitness } from "./holder-agent.js";
import { type ClaimWitness, IssuerAgent } from "./issuer-agent.js";
import {
  BIRTH_SCHEMA,
  BIRTH_SCHEMA_FAMILY_ADAPTER,
  formatSchemaRef,
} from "./schema-descriptors.js";
import {
  type PresentationRequirements,
  type SimulatorWitness,
  VerifierAgent,
} from "./verifier-agent.js";

const FAMILY_IDENTITY = {
  familyId: BIRTH_SCHEMA_FAMILY_ADAPTER.familyId,
  familyVersion: "1.0.0",
  schemaId: formatSchemaRef(BIRTH_SCHEMA),
  schemaVersion: `${BIRTH_SCHEMA.majorVersion}.${BIRTH_SCHEMA.minorVersion}`,
} as const;

const MEDIA_TYPE = "application/vnd.midnight.birth.protocol-message+json";

type BirthVerificationResult = VerificationResult & {
  readonly protocolResult: ReturnType<VerifierAgent["receiveSubmissionAndEvaluate"]>["result"];
};

export type BirthInjectedCredentialFamilyAdapter =
  InjectedCredentialFamilyAdapter<BirthVerificationResult>;

export type BirthInjectedCredentialFamilyAdapterOptions = {
  readonly issuerProfile: DIDProfile;
  readonly holderProfile: DIDProfile;
  readonly verifierProfile: DIDProfile;
};

const requiredInput = <T>(value: unknown, label: string): T => {
  if (value === undefined || value === null) {
    throw new TypeError(`${label} is required`);
  }
  return value as T;
};

/**
 * Adapts the repository's concrete explicit-holder birth lifecycle to the
 * family-neutral directly injected exchange ports. Transport framing stays in
 * this outward protocol package; birth Compact circuits remain the validity
 * authority.
 */
export const createBirthInjectedCredentialFamilyAdapter = (
  options: BirthInjectedCredentialFamilyAdapterOptions,
): BirthInjectedCredentialFamilyAdapter => {
  const bus = new MessageBus();
  const issuer = new IssuerAgent(options.issuerProfile, bus);
  const holder = new HolderAgent(options.holderProfile, bus);
  const verifier = new VerifierAgent(options.verifierProfile, bus);

  const receive = (party: PartyId, action: string): ProtocolMessage => {
    const message = bus.receive(party);
    if (!message) {
      throw new Error(`Birth adapter produced no ${action} message for ${party}`);
    }
    return message;
  };
  const encode = <TKind extends CanonicalMessage["kind"]>(
    kind: TKind,
    message: ProtocolMessage,
  ): CanonicalMessage<TKind> => ({
    ...FAMILY_IDENTITY,
    kind,
    mediaType: MEDIA_TYPE,
    payload: stableJsonProtocolStateCodec.encode(message),
  });
  const decode = <TKind extends CanonicalMessage["kind"]>(
    message: CanonicalMessage<TKind>,
  ): ProtocolMessage =>
    stableJsonProtocolStateCodec.decode(message.payload) as ProtocolMessage;

  return {
    family: {
      id: FAMILY_IDENTITY.familyId,
      version: FAMILY_IDENTITY.familyVersion,
      schema: {
        id: FAMILY_IDENTITY.schemaId,
        version: FAMILY_IDENTITY.schemaVersion,
      },
    },
    issuance: {
      createOffer: () => {
        issuer.createAndSendOffer(options.holderProfile.label);
        return encode(
          "issuance-offer",
          receive(options.holderProfile.label, "issuance offer"),
        );
      },
      createRequest: (offer) => {
        holder.receiveOfferAndSendRequest(decode(offer));
        return encode(
          "issuance-request",
          receive(options.issuerProfile.label, "issuance request"),
        );
      },
      issue: (request, input) => {
        issuer.receiveRequestAndIssueCredential(
          decode(request),
          requiredInput<ClaimWitness>(input, "Birth claim witness"),
        );
        return encode(
          "credential",
          receive(options.holderProfile.label, "credential result"),
        );
      },
      accept: (credential) => {
        holder.receiveCredentialResult(decode(credential));
        return credential;
      },
    },
    presentation: {
      createRequest: (input) => {
        verifier.createAndSendPresentationRequest(
          options.holderProfile.label,
          requiredInput<PresentationRequirements>(
            input,
            "Birth presentation requirements",
          ),
        );
        return encode(
          "presentation-request",
          receive(options.holderProfile.label, "presentation request"),
        );
      },
      present: (_credential, request, input) => {
        holder.receiveRequestAndSendPresentation(
          decode(request),
          requiredInput<PresentationWitness>(input, "Birth presentation witness"),
        );
        return encode(
          "presentation",
          receive(options.verifierProfile.label, "presentation submission"),
        );
      },
    },
    verification: {
      verify: (presentation, request, input) => {
        const witness = requiredInput<Omit<SimulatorWitness, "request">>(
          input,
          "Birth simulator witness",
        );
        const requestMessage = decode(request);
        const evaluation = verifier.receiveSubmissionAndEvaluate(
          decode(presentation),
          {
            ...witness,
            request: requestMessage.body as BirthCredentialVerificationRequest,
          },
        );
        return {
          valid: evaluation.approved,
          canonicalPresentation: presentation,
          protocolResult: evaluation.result,
        };
      },
    },
  };
};
