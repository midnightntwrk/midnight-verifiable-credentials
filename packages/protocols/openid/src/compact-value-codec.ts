/**
 * @deprecated Import protocol-neutral Compact value framing from
 * `@midnight-ntwrk/credential-compact`. This re-export preserves the existing
 * OpenID package surface for one compatibility cycle.
 */
export {
  COMPACT_VALUE_ENCODING,
  type CompactValueEncoding,
  compactValueFromBytes,
  compactValueToBytes,
  decodeCompactPayload,
  decodeCompactValue,
  encodeCompactPayload,
  encodeCompactValue,
  type EncodedCompactValue,
} from "@midnight-ntwrk/credential-compact";
