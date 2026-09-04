import {
  assertCanonicalMessage,
  type CanonicalFamilyIdentity,
  type CanonicalMessage,
} from "./canonical-messages.js";
import {
  assertClaimIds,
  assertClaimOpeningDelivery,
  assertClaimOpeningRequest,
  assertClaimOpeningSelection,
  cloneCanonicalMessage,
  cloneClaimOpeningDelivery,
  cloneHolderCredentialRecord,
  type CredentialIssuanceResult,
  type HolderAgentOptions,
  type HolderClaimOpeningRequest,
  type HolderClaimOpeningSelection,
  type HolderCredentialAcceptanceReceipt,
  type HolderCredentialRecord,
  type IssuanceRequestWithClaimOpenings,
} from "./claim-openings.js";
import type {
  ClaimOpeningAdapter,
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

const requireClaimOpeningAdapter = (
  adapter: InjectedCredentialFamilyAdapter,
): ClaimOpeningAdapter => {
  const claimOpenings = adapter.issuance.claimOpenings;
  if (!claimOpenings) {
    throw new Error("Injected family adapter does not support claim-opening delivery");
  }
  return claimOpenings;
};

const assertExactCanonicalBytes = (
  expected: CanonicalMessage,
  actual: CanonicalMessage,
  context: string,
): void => {
  if (
    expected.mediaType !== actual.mediaType ||
    expected.payload.length !== actual.payload.length
  ) {
    throw new Error(context);
  }
  for (let index = 0; index < expected.payload.length; index += 1) {
    if (expected.payload[index] !== actual.payload[index]) {
      throw new Error(context);
    }
  }
};

const acceptanceReceipt = (
  record: HolderCredentialRecord,
): HolderCredentialAcceptanceReceipt => ({
  formatVersion: 1,
  familyId: record.familyId,
  familyVersion: record.familyVersion,
  schemaId: record.schemaId,
  schemaVersion: record.schemaVersion,
  deliveredClaimCount: record.claimOpenings.claimIds.length,
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

  issueWithClaimOpenings(
    issuance: IssuanceRequestWithClaimOpenings,
    input?: unknown,
  ): CredentialIssuanceResult {
    if (issuance?.formatVersion !== 1) {
      throw new Error("Claim-opening issuance request formatVersion must be 1");
    }
    assertCanonicalMessage(
      issuance.request,
      canonicalIdentity(this.adapter),
      "issuance-request",
    );
    assertClaimOpeningRequest(issuance.claimOpenings);

    const claimOpenings = requireClaimOpeningAdapter(this.adapter);
    const credential = cloneCanonicalMessage(this.issue(issuance.request, input));
    const delivery = claimOpenings.createDelivery({
      request: cloneCanonicalMessage(issuance.request),
      credential: cloneCanonicalMessage(credential),
      holder: {
        recipientId: issuance.claimOpenings.recipientId,
        claimIds: [...issuance.claimOpenings.claimIds],
      },
      input,
    });
    assertClaimOpeningDelivery(delivery, issuance.claimOpenings);

    return {
      formatVersion: 1,
      request: cloneCanonicalMessage(issuance.request),
      credential,
      claimOpenings: cloneClaimOpeningDelivery(delivery),
    };
  }
}

export class HolderAgent {
  private credential?: CanonicalMessage<"credential">;
  private holderRecord?: HolderCredentialRecord;

  constructor(
    private readonly adapter: InjectedCredentialFamilyAdapter,
    private readonly options: HolderAgentOptions = {},
  ) {}

  createIssuanceRequest(
    offer: CanonicalMessage<"issuance-offer">,
    input?: unknown,
  ): CanonicalMessage<"issuance-request"> {
    assertCanonicalMessage(offer, canonicalIdentity(this.adapter), "issuance-offer");
    const request = this.adapter.issuance.createRequest(offer, input);
    assertCanonicalMessage(request, canonicalIdentity(this.adapter), "issuance-request");
    return request;
  }

  createIssuanceRequestWithClaimOpenings(
    offer: CanonicalMessage<"issuance-offer">,
    claimIds: readonly string[],
    input?: unknown,
  ): IssuanceRequestWithClaimOpenings {
    requireClaimOpeningAdapter(this.adapter);
    const holder = this.holderClaimOpeningRequest(claimIds);
    return {
      formatVersion: 1,
      request: this.createIssuanceRequest(offer, input),
      claimOpenings: holder,
    };
  }

  acceptCredential(
    credential: CanonicalMessage<"credential">,
  ): CanonicalMessage<"credential"> {
    assertCanonicalMessage(credential, canonicalIdentity(this.adapter), "credential");
    const accepted = this.adapter.issuance.accept(cloneCanonicalMessage(credential));
    assertCanonicalMessage(accepted, canonicalIdentity(this.adapter), "credential");
    this.holderRecord = undefined;
    this.credential = snapshotCanonicalMessage(accepted);
    return snapshotCanonicalMessage(accepted);
  }

  acceptIssuanceResult(
    result: CredentialIssuanceResult,
    issuance: IssuanceRequestWithClaimOpenings,
  ): HolderCredentialAcceptanceReceipt {
    if (result?.formatVersion !== 1) {
      throw new Error("Credential issuance result formatVersion must be 1");
    }
    if (issuance?.formatVersion !== 1) {
      throw new Error("Claim-opening issuance request formatVersion must be 1");
    }

    const identity = canonicalIdentity(this.adapter);
    assertCanonicalMessage(issuance.request, identity, "issuance-request");
    assertClaimOpeningRequest(issuance.claimOpenings);
    const recipientId = this.requireRecipientId();
    if (issuance.claimOpenings.recipientId !== recipientId) {
      throw new Error("Claim-opening request recipient does not match this holder");
    }
    assertCanonicalMessage(result.request, identity, "issuance-request");
    assertExactCanonicalBytes(
      issuance.request,
      result.request,
      "Credential issuance result must preserve canonical issuance request bytes",
    );
    assertCanonicalMessage(result.credential, identity, "credential");
    assertClaimOpeningDelivery(result.claimOpenings, issuance.claimOpenings);

    const claimOpenings = requireClaimOpeningAdapter(this.adapter);
    const issued = cloneCanonicalMessage(result.credential);
    const accepted = this.adapter.issuance.accept(cloneCanonicalMessage(issued));
    assertCanonicalMessage(accepted, identity, "credential");
    assertExactCanonicalBytes(
      issued,
      accepted,
      "Credential acceptance must preserve canonical credential bytes",
    );
    claimOpenings.validateDelivery({
      request: cloneCanonicalMessage(result.request),
      credential: cloneCanonicalMessage(issued),
      delivery: cloneClaimOpeningDelivery(result.claimOpenings),
      holder: {
        recipientId: issuance.claimOpenings.recipientId,
        claimIds: [...issuance.claimOpenings.claimIds],
      },
    });

    const record: HolderCredentialRecord = {
      formatVersion: 1,
      ...identity,
      recipientId,
      issuanceRequest: cloneCanonicalMessage(result.request),
      credential: issued,
      claimOpenings: cloneClaimOpeningDelivery(result.claimOpenings),
    };
    this.options.credentialStore?.save(cloneHolderCredentialRecord(record));
    this.holderRecord = record;
    this.credential = record.credential;
    return acceptanceReceipt(record);
  }

  restoreCredential(): HolderCredentialAcceptanceReceipt {
    const recipientId = this.requireRecipientId();
    const store = this.options.credentialStore;
    if (!store) {
      throw new Error("Holder credential restore requires a credential store");
    }
    const identity = canonicalIdentity(this.adapter);
    const loaded = store.load({ ...identity, recipientId });
    if (!loaded) {
      throw new Error("No persisted holder credential exists for this family and recipient");
    }
    if (loaded.formatVersion !== 1) {
      throw new Error("Persisted holder credential formatVersion must be 1");
    }
    for (const field of [
      "familyId",
      "familyVersion",
      "schemaId",
      "schemaVersion",
    ] as const) {
      if (loaded[field] !== identity[field]) {
        throw new Error(`Persisted holder credential ${field} does not match adapter`);
      }
    }
    if (loaded.recipientId !== recipientId) {
      throw new Error("Persisted claim-opening recipient does not match this holder");
    }
    assertCanonicalMessage(loaded.issuanceRequest, identity, "issuance-request");
    assertCanonicalMessage(loaded.credential, identity, "credential");
    const expected: HolderClaimOpeningRequest = {
      recipientId,
      claimIds: loaded.claimOpenings?.claimIds,
    };
    assertClaimOpeningRequest(expected);
    assertClaimOpeningDelivery(loaded.claimOpenings, expected);

    const persisted = cloneCanonicalMessage(loaded.credential);
    const accepted = this.adapter.issuance.accept(cloneCanonicalMessage(persisted));
    assertCanonicalMessage(accepted, identity, "credential");
    assertExactCanonicalBytes(
      persisted,
      accepted,
      "Credential acceptance must preserve canonical credential bytes",
    );
    requireClaimOpeningAdapter(this.adapter).validateDelivery({
      request: cloneCanonicalMessage(loaded.issuanceRequest),
      credential: cloneCanonicalMessage(persisted),
      delivery: cloneClaimOpeningDelivery(loaded.claimOpenings),
      holder: { recipientId: expected.recipientId, claimIds: [...expected.claimIds] },
    });

    const record = cloneHolderCredentialRecord({
      ...loaded,
      credential: persisted,
    });
    this.holderRecord = record;
    this.credential = record.credential;
    return acceptanceReceipt(record);
  }

  recoverClaimOpenings(
    claimIds: readonly string[],
  ): HolderClaimOpeningSelection {
    assertClaimIds(claimIds, "Claim-opening recovery request");
    const record = this.holderRecord;
    if (!record) {
      throw new Error("Holder has no validated claim openings to recover");
    }
    for (const claimId of claimIds) {
      if (!record.claimOpenings.claimIds.includes(claimId)) {
        throw new Error(`Claim opening "${claimId}" was not delivered to this holder`);
      }
    }
    const selection = requireClaimOpeningAdapter(this.adapter).select({
      credential: cloneCanonicalMessage(record.credential),
      delivery: cloneClaimOpeningDelivery(record.claimOpenings),
      claimIds: [...claimIds],
    });
    assertClaimOpeningSelection(selection, claimIds);
    return {
      claimIds: [...selection.claimIds],
      payload: selection.payload.slice(),
    };
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
      cloneCanonicalMessage(request),
      input,
    );
    assertCanonicalMessage(
      presentation,
      canonicalIdentity(this.adapter),
      "presentation",
    );
    return presentation;
  }

  private requireRecipientId(): string {
    const recipientId = this.options.recipientId;
    if (typeof recipientId !== "string" || recipientId.trim().length === 0) {
      throw new Error("Claim-opening delivery requires a configured holder recipientId");
    }
    return recipientId;
  }

  private holderClaimOpeningRequest(
    claimIds: readonly string[],
  ): HolderClaimOpeningRequest {
    const request = { recipientId: this.requireRecipientId(), claimIds: [...claimIds] };
    assertClaimOpeningRequest(request);
    return request;
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
