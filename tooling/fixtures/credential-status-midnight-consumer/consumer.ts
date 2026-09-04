import type { StatusReader } from "@midnight-ntwrk/credential-status";
import type { AuthorityEvidencePolicyV1 } from "@midnight-ntwrk/credential-proofs";
import type { StatusRegistryStateV1 } from "@midnight-ntwrk/credential-status-midnight-contract";
import { createMidnightStatusReaderV1 } from "@midnight-ntwrk/credential-status-midnight-verifier";
import type { StatusAuthoritySignerV1 } from "@midnight-ntwrk/credential-status-midnight-authority";

export const consume = (
  state: StatusRegistryStateV1,
  policy: AuthorityEvidencePolicyV1,
  signer: StatusAuthoritySignerV1,
): { reader: StatusReader; policy: AuthorityEvidencePolicyV1; signer: StatusAuthoritySignerV1 } => ({
  reader: createMidnightStatusReaderV1({ readState: () => state }),
  policy,
  signer,
});
