import {
  assertCanonicalMessage,
  type CanonicalFamilyIdentity,
  type CanonicalMessage,
} from "./canonical-messages.js";
import type {
  InjectedCredentialFamilyAdapter,
  VerificationResult,
} from "./ports.js";

const canonicalIdentity = (
  adapter: InjectedCredentialFamilyAdapter,
): CanonicalFamilyIdentity => ({
  familyId: adapter.family.id,
  familyVersion: adapter.family.version,
  schemaId: adapter.family.schema.id,
  schemaVersion: adapter.family.schema.version,
});

const snapshotCanonicalMessage = <TKind extends CanonicalMessage["kind"]>(
  message: CanonicalMessage<TKind>,
): CanonicalMessage<TKind> => ({
  ...message,
  payload: Uint8Array.from(message.payload),
});

export class IssuerAgent {
  constructor(private readonly adapter: InjectedCredentialFamilyAdapter) {}

  createOffer(input?: unknown): CanonicalMessage<"issuance-offer"> {
    const offer = this.adapter.issuance.createOffer(input);
    assertCanonicalMessage(offer, canonicalIdentity(this.adapter), "issuance-offer");
    return offer;
  }

  issue(
    request: CanonicalMessage<"issuance-request">,
    input?: unknown,
  ): CanonicalMessage<"credential"> {
    assertCanonicalMessage(request, canonicalIdentity(this.adapter), "issuance-request");
    const credential = this.adapter.issuance.issue(request, input);
    assertCanonicalMessage(credential, canonicalIdentity(this.adapter), "credential");
    return credential;
  }
}

export class HolderAgent {
  private credential?: CanonicalMessage<"credential">;

  constructor(private readonly adapter: InjectedCredentialFamilyAdapter) {}

  createIssuanceRequest(
    offer: CanonicalMessage<"issuance-offer">,
    input?: unknown,
  ): CanonicalMessage<"issuance-request"> {
    assertCanonicalMessage(offer, canonicalIdentity(this.adapter), "issuance-offer");
    const request = this.adapter.issuance.createRequest(offer, input);
    assertCanonicalMessage(request, canonicalIdentity(this.adapter), "issuance-request");
    return request;
  }

  acceptCredential(
    credential: CanonicalMessage<"credential">,
  ): CanonicalMessage<"credential"> {
    assertCanonicalMessage(credential, canonicalIdentity(this.adapter), "credential");
    const accepted = this.adapter.issuance.accept(credential);
    assertCanonicalMessage(accepted, canonicalIdentity(this.adapter), "credential");
    this.credential = snapshotCanonicalMessage(accepted);
    return snapshotCanonicalMessage(accepted);
  }

  createPresentation(
    request: CanonicalMessage<"presentation-request">,
    input?: unknown,
  ): CanonicalMessage<"presentation"> {
    assertCanonicalMessage(
      request,
      canonicalIdentity(this.adapter),
      "presentation-request",
    );
    if (!this.credential) {
      throw new Error("Holder has no accepted credential for presentation");
    }
    const presentation = this.adapter.presentation.present(
      snapshotCanonicalMessage(this.credential),
      request,
      input,
    );
    assertCanonicalMessage(
      presentation,
      canonicalIdentity(this.adapter),
      "presentation",
    );
    return presentation;
  }
}

export class VerifierAgent<
  TResult extends VerificationResult = VerificationResult,
> {
  constructor(
    private readonly adapter: InjectedCredentialFamilyAdapter<TResult>,
  ) {}

  createPresentationRequest(
    input?: unknown,
  ): CanonicalMessage<"presentation-request"> {
    const request = this.adapter.presentation.createRequest(input);
    assertCanonicalMessage(
      request,
      canonicalIdentity(this.adapter),
      "presentation-request",
    );
    return request;
  }

  verify(
    presentation: CanonicalMessage<"presentation">,
    request: CanonicalMessage<"presentation-request">,
    input?: unknown,
  ): TResult {
    assertCanonicalMessage(
      presentation,
      canonicalIdentity(this.adapter),
      "presentation",
    );
    assertCanonicalMessage(
      request,
      canonicalIdentity(this.adapter),
      "presentation-request",
    );
    const result = this.adapter.verification.verify(presentation, request, input);
    assertCanonicalMessage(
      result.canonicalPresentation,
      canonicalIdentity(this.adapter),
      "presentation",
    );
    return result;
  }
}
