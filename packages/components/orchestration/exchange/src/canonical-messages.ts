export type CanonicalMessageKind =
  | "issuance-offer"
  | "issuance-request"
  | "credential"
  | "presentation-request"
  | "presentation";

/**
 * A family-owned canonical payload. Protocol adapters may frame these bytes,
 * but they cannot reinterpret them or decide whether they are valid.
 */
export interface CanonicalFamilyIdentity {
  readonly familyId: string;
  readonly familyVersion: string;
  readonly schemaId: string;
  readonly schemaVersion: string;
}

export interface CanonicalMessage<
  TKind extends CanonicalMessageKind = CanonicalMessageKind,
> extends CanonicalFamilyIdentity {
  readonly kind: TKind;
  readonly mediaType: string;
  readonly payload: Uint8Array;
}

export interface CanonicalMessageCodec<TValue, TKind extends CanonicalMessageKind> {
  encode(value: TValue): CanonicalMessage<TKind>;
  decode(message: CanonicalMessage<TKind>): TValue;
}

export interface ProtocolMessageAdapter<
  TWire,
  TMessage extends CanonicalMessage = CanonicalMessage,
> {
  wrap(message: TMessage): TWire;
  unwrap(wire: TWire): TMessage;
}

export function assertCanonicalMessage<TKind extends CanonicalMessageKind>(
  message: CanonicalMessage,
  expected: CanonicalFamilyIdentity,
  kind: TKind,
): asserts message is CanonicalMessage<TKind> {
  for (const field of [
    "familyId",
    "familyVersion",
    "schemaId",
    "schemaVersion",
  ] as const) {
    if (message[field] !== expected[field]) {
      throw new Error(
        `Canonical message ${field} "${message[field]}" does not match injected identity "${expected[field]}"`,
      );
    }
  }
  if (message.kind !== kind) {
    throw new Error(
      `Expected canonical message kind "${kind}", got "${message.kind}"`,
    );
  }
  if (!(message.payload instanceof Uint8Array) || message.payload.length === 0) {
    throw new Error("Canonical message payload must contain family-owned bytes");
  }
}
