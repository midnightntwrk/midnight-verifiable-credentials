import {
  midnightDIDMethodId,
  type MidnightDIDMethodBinding,
} from "@midnight-ntwrk/credential-did-midnight";

export const fragmentHash = midnightDIDMethodId("#key-1");

export const acceptsBinding = (
  binding: MidnightDIDMethodBinding,
): bigint => binding.didStateVersion;
