import { resetEnvelopeCounter } from "@midnight-ntwrk/midnight-did-credentials-protocol";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  decodeUniversityProtocolTransportValue,
  encodeUniversityProtocolTransportValue,
  SerializedUniversityProtocolTransport,
  UniversityProtocolFlowRunner,
} from "../testing.js";

const fixedProtocolTime = new Date("2030-06-01T00:00:00.000Z");

type FlowComparableResult = Omit<
  ReturnType<UniversityProtocolFlowRunner["runAll"]>,
  "metrics"
>;

const runComparableFlow = (
  transport?: SerializedUniversityProtocolTransport,
): FlowComparableResult => {
  resetEnvelopeCounter();
  vi.setSystemTime(fixedProtocolTime);
  const runner = new UniversityProtocolFlowRunner({ transport });
  const result = runner.runAll();
  // Wall-clock metrics are intentionally excluded from equivalence checks; the
  // serialized transport adds encode/decode overhead but must preserve all
  // business messages and transcript entries.
  return {
    issuance: result.issuance,
    jobApplications: result.jobApplications,
    discounts: result.discounts,
    transcript: result.transcript,
  };
};

describe("serialized university protocol transport", () => {
  beforeEach(() => {
    setNetworkId("undeployed");
    vi.useFakeTimers();
    vi.setSystemTime(fixedProtocolTime);
  });

  afterEach(() => {
    vi.useRealTimers();
    resetEnvelopeCounter();
  });

  it("round-trips bigint, bytes, arrays, and undefined values through the transport codec", () => {
    const bytes = new Uint8Array([1, 2, 3, 255]);
    const encoded = encodeUniversityProtocolTransportValue({
      bigintValue: 12345678901234567890n,
      bytes,
      nested: [undefined, { ok: true }],
    });

    expect(decodeUniversityProtocolTransportValue(encoded)).toEqual({
      bigintValue: 12345678901234567890n,
      bytes,
      nested: [undefined, { ok: true }],
    });
  });

  it("rejects DTO values that JSON would silently corrupt across a process boundary", () => {
    expect(() => encodeUniversityProtocolTransportValue(Number.NaN)).toThrow(
      /Unsupported university protocol transport number NaN/u,
    );
    expect(() => encodeUniversityProtocolTransportValue(Infinity)).toThrow(
      /Unsupported university protocol transport number Infinity/u,
    );
    expect(() =>
      encodeUniversityProtocolTransportValue(new Date("2030-01-01T00:00:00Z")),
    ).toThrow(/Unsupported university protocol transport value/u);
    expect(() =>
      encodeUniversityProtocolTransportValue(new Map([["student", "STU-0001"]])),
    ).toThrow(/Unsupported university protocol transport value/u);
    expect(() =>
      encodeUniversityProtocolTransportValue(new Set(["STU-0001"])),
    ).toThrow(/Unsupported university protocol transport value/u);
    expect(() =>
      encodeUniversityProtocolTransportValue(new Uint16Array([1, 2])),
    ).toThrow(/Unsupported university protocol transport value/u);
    expect(() =>
      encodeUniversityProtocolTransportValue({
        __midnightUniversityProtocolTransportType: "bigint",
        value: "123",
      }),
    ).toThrow(/reserved transport key/u);
  });

  it("rejects malformed transport tags before they reach protocol handlers", () => {
    expect(() =>
      decodeUniversityProtocolTransportValue({
        __midnightUniversityProtocolTransportType: "bigint",
        value: "12.34",
      }),
    ).toThrow(/Malformed university protocol transport bigint value/u);
    expect(() =>
      decodeUniversityProtocolTransportValue({
        __midnightUniversityProtocolTransportType: "bytes",
        value: 42,
      }),
    ).toThrow(
      /Malformed university protocol transport bytes value: expected string field "value"/u,
    );
    expect(() =>
      decodeUniversityProtocolTransportValue({
        __midnightUniversityProtocolTransportType: "future-tag",
      }),
    ).toThrow(/Malformed university protocol transport tag future-tag/u);
    expect(() =>
      decodeUniversityProtocolTransportValue({
        __midnightUniversityProtocolTransportType: "bigint",
        extra: "not allowed",
        value: "123",
      }),
    ).toThrow(/unexpected tagged fields/u);
    expect(() =>
      decodeUniversityProtocolTransportValue({
        __midnightUniversityProtocolTransportType: "bytes",
        value: "not-base64!",
      }),
    ).toThrow(/expected canonical base64/u);
  });

  it("rejects non-university messages before trace metadata is derived", () => {
    const transport = new SerializedUniversityProtocolTransport();

    expect(() =>
      transport.send({
        type: "issuance:offer",
        from: "external",
        to: "STU-0001",
        envelope: {} as Parameters<
          SerializedUniversityProtocolTransport["send"]
        >[0]["envelope"],
        body: {},
      }),
    ).toThrow(
      /Serialized university protocol transport only accepts university protocol messages/u,
    );
  });

  it("rejects reserved transport tags inside message bodies", () => {
    const baseline = runComparableFlow();
    const [first] = baseline.issuance.messages;
    const transport = new SerializedUniversityProtocolTransport();
    if (!first) {
      throw new Error("Expected at least one issuance request in baseline flow");
    }

    expect(() =>
      transport.send({
        ...first,
        body: {
          ...first.body,
          __midnightUniversityProtocolTransportType: "bigint",
          value: "123",
        },
      }),
    ).toThrow(/reserved transport key/u);
  });

  it("decodes queued messages with FIFO ordering through the receive path", () => {
    const baseline = runComparableFlow();
    const [first, second] = baseline.issuance.messages.filter(
      (message) => message.type === "issuance:request",
    );
    const transport = new SerializedUniversityProtocolTransport();
    if (!first || !second) {
      throw new Error("Expected at least two issuance requests in baseline flow");
    }

    // In-process runner messages are plain DTOs, so they are valid fixtures for
    // the serialized transport validator.
    transport.send(first);
    transport.send(second);

    expect(transport.pending(first.to)).toBe(2);
    expect(transport.receive(first.to)).toEqual(first);
    expect(transport.receive(first.to)).toEqual(second);
    expect(transport.receive(first.to)).toBeUndefined();
  });

  it("preserves the protocol result across a serialized process-boundary transport", () => {
    const baseline = runComparableFlow();
    const transport = new SerializedUniversityProtocolTransport();
    const serialized = runComparableFlow(transport);

    expect(serialized).toEqual(baseline);
    expect(transport.trace()).toHaveLength(
      serialized.issuance.messages.length +
        serialized.jobApplications.messages.length +
        serialized.discounts.messages.length,
    );
    expect(transport.totalPayloadBytes()).toBeGreaterThan(0);
    expect(transport.trace()[0]).toMatchObject({
      sequence: 0,
      type: "issuance:request",
      from: "STU-0001",
      to: "uni-example-001",
    });
  });

  it("records every transport frame with thread and response correlation identifiers", () => {
    const transport = new SerializedUniversityProtocolTransport();
    const result = runComparableFlow(transport);
    const resultFrame = transport
      .trace()
      .find((frame) => frame.type === "presentation:result");

    expect(resultFrame).toBeDefined();
    expect(resultFrame!.threadIdHex).toMatch(/^[0-9a-f]{64}$/u);
    expect(resultFrame!.messageIdHex).toMatch(/^[0-9a-f]{64}$/u);
    expect(resultFrame!.respondsToHex).toMatch(/^[0-9a-f]{64}$/u);
    expect(resultFrame!.payloadBytes).toBeGreaterThan(0);
    expect(transport.pending(resultFrame!.to)).toBe(0);
    expect(transport.trace()).toHaveLength(
      result.issuance.messages.length +
        result.jobApplications.messages.length +
        result.discounts.messages.length,
    );
  });
});
