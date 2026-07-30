import type {
  CredentialClaimDescriptor,
  CredentialCompositionManifest,
} from "@midnight-ntwrk/credential-model";

export const claim: CredentialClaimDescriptor = {
  id: "accessLevel",
  path: ["accessLevel"],
  disclosure: "predicate-only",
  required: true,
};

export const composition: CredentialCompositionManifest = {
  formatVersion: 1,
  packages: [],
};
