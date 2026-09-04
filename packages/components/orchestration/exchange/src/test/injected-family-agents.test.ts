import { describe, expect, it } from "vitest";

import {
  type CanonicalMessage,
  HolderAgent,
  type InjectedCredentialFamilyAdapter,
  IssuerAgent,
  type ProtocolMessageAdapter,
  VerifierAgent,
} from "../index.js";

const text = new TextEncoder();
const decode = new TextDecoder();

const message = <TKind extends CanonicalMessage["kind"]>(
  familyId: string,
  kind: TKind,
  payload: string,
): CanonicalMessage<TKind> => ({
  familyId,
  familyVersion: "1.0.0",
  schemaId: `${familyId}:schema`,
  schemaVersion: "1.0.0",
  kind,
  mediaType: "application/vnd.midnight.canonical+bytes",
  payload: text.encode(payload),
});

const familyAdapter = (
  familyId: string,
  secret: string,
): InjectedCredentialFamilyAdapter => ({
  family: {
    id: familyId,
    version: "1.0.0",
    schema: { id: `${familyId}:schema`, version: "1.0.0" },
  },
  issuance: {
    createOffer: () => message(familyId, "issuance-offer", `offer:${familyId}`),
    createRequest: (offer) =>
      message(familyId, "issuance-request", `request:${decode.decode(offer.payload)}`),
    issue: (request) =>
      message(familyId, "credential", `${secret}:${decode.decode(request.payload)}`),
    accept: (credential) => credential,
  },
  presentation: {
    createRequest: () =>
      message(familyId, "presentation-request", `challenge:${familyId}`),
    present: (credential, request) =>
      message(
        familyId,
        "presentation",
        `${decode.decode(credential.payload)}|${decode.decode(request.payload)}`,
      ),
  },
  verification: {
    verify: (presentation, request) => ({
      valid:
        decode.decode(presentation.payload) ===
        `${secret}:request:offer:${familyId}|${decode.decode(request.payload)}`,
      canonicalPresentation: presentation,
    }),
  },
});

const runLifecycle = (adapter: InjectedCredentialFamilyAdapter) => {
  const issuer = new IssuerAgent(adapter);
  const holder = new HolderAgent(adapter);
  const verifier = new VerifierAgent(adapter);

  const offer = issuer.createOffer();
  const issuanceRequest = holder.createIssuanceRequest(offer);
  holder.acceptCredential(issuer.issue(issuanceRequest));
  const presentationRequest = verifier.createPresentationRequest();
  const presentation = holder.createPresentation(presentationRequest);
  return verifier.verify(presentation, presentationRequest);
};

describe("family-neutral injected agents", () => {
  it("runs unchanged orchestration with two independently injected families", () => {
    expect(runLifecycle(familyAdapter("birth", "birth-proof")).valid).toBe(true);
    expect(runLifecycle(familyAdapter("hello", "hello-proof")).valid).toBe(true);
  });

  it("keeps protocol wrapping outside family validity", () => {
    type PresentationMessage = CanonicalMessage<"presentation">;
    type Wire = { readonly body: PresentationMessage };
    const protocol: ProtocolMessageAdapter<Wire, PresentationMessage> = {
      wrap: (canonical) => ({ body: canonical }),
      unwrap: (wire) => wire.body,
    };
    const adapter = familyAdapter("birth", "birth-proof");
    const verifier = new VerifierAgent(adapter);
    const request = verifier.createPresentationRequest();
    const tampered = message("birth", "presentation", "transport-cannot-approve");

    expect(protocol.unwrap(protocol.wrap(tampered))).toEqual(tampered);
    expect(verifier.verify(protocol.unwrap(protocol.wrap(tampered)), request).valid).toBe(false);
  });

  it("rejects cross-family canonical messages before an adapter sees them", () => {
    const holder = new HolderAgent(familyAdapter("birth", "birth-proof"));
    expect(() =>
      holder.createIssuanceRequest(message("hello", "issuance-offer", "offer:hello")),
    ).toThrow(/family/i);
  });

  it("rejects cross-family canonical messages produced by a verifier adapter", () => {
    const base = familyAdapter("birth", "birth-proof");
    const adapter: InjectedCredentialFamilyAdapter = {
      ...base,
      verification: {
        verify: () => ({
          valid: true,
          canonicalPresentation: message(
            "hello",
            "presentation",
            "invalid-family",
          ),
        }),
      },
    };
    const verifier = new VerifierAgent(adapter);
    const request = verifier.createPresentationRequest();

    expect(() =>
      verifier.verify(message("birth", "presentation", "birth-proof"), request),
    ).toThrow(/family/i);
  });

  it("rejects a message from a different family or schema version", () => {
    const holder = new HolderAgent(familyAdapter("birth", "birth-proof"));
    const oldSchemaOffer = {
      ...message("birth", "issuance-offer", "offer:birth"),
      schemaVersion: "0.9.0",
    };

    expect(() => holder.createIssuanceRequest(oldSchemaOffer)).toThrow(
      /schemaVersion/,
    );
  });
});
