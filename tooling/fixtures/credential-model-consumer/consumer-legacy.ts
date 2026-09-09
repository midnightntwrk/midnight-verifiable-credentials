import type { CredentialClaimDescriptor } from "@midnight-ntwrk/credential-model";

export const claim: CredentialClaimDescriptor = {
  id: "accessLevel",
  path: ["accessLevel"],
  disclosure: "predicate-only",
  required: true,
};
