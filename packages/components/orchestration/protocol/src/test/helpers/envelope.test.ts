import { describe, expect, it } from "vitest";

import {
  createEnvelope,
  resetEnvelopeCounter,
  unsafeReferenceDeterministicEnvelopeIdentifierSource,
} from "../../shared/envelope.js";

describe("protocol envelope helper", () => {
  it("reuses the request thread id for response messages", () => {
    resetEnvelopeCounter();

    const request = createEnvelope(
      "issuance-offer",
      "birth-issuance",
      true,
    );
    const response = createEnvelope(
      "issuance-request",
      "birth-issuance",
      false,
      request.messageId,
      request.threadId,
    );

    expect(response.initialMessage).toBe(false);
    expect(response.respondsToMessageId).toEqual(request.messageId);
    expect(response.threadId).toEqual(request.threadId);
  });

  it("uses distinct CSPRNG identifiers by default", () => {
    resetEnvelopeCounter();
    const first = createEnvelope("offer", "issuance", true);
    resetEnvelopeCounter();
    const second = createEnvelope("offer", "issuance", true);

    expect(first.messageId).toHaveLength(32);
    expect(first.threadId).toHaveLength(32);
    expect(first.messageId).not.toEqual(second.messageId);
    expect(first.threadId).not.toEqual(second.threadId);
  });

  it("requires explicit opt-in for deterministic fixture identifiers", () => {
    const createDeterministicEnvelope = () =>
      createEnvelope("offer", "issuance", true, undefined, undefined, {
        identifierSource:
          unsafeReferenceDeterministicEnvelopeIdentifierSource,
      });

    resetEnvelopeCounter();
    const first = createDeterministicEnvelope();
    resetEnvelopeCounter();
    const second = createDeterministicEnvelope();

    expect(first.messageId).toEqual(second.messageId);
    expect(first.threadId).toEqual(second.threadId);
  });
});
