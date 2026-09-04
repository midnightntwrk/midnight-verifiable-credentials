import type {
  CredentialDeploymentAssemblyV1,
  CredentialFamilyDefinition,
  CredentialFamilyProfileV1,
  ResolvedCredentialCompositionV1,
} from "@midnight-ntwrk/credential-model";

import {
  accessFamily,
  type AccessCredential,
  type AccessPresentation,
} from "./family.js";

export const typedFamily: CredentialFamilyDefinition<
  AccessCredential,
  AccessPresentation,
  string,
  string
> = accessFamily;

export type PublicCompositionContracts = {
  profile: CredentialFamilyProfileV1;
  assembly: CredentialDeploymentAssemblyV1;
  resolved: ResolvedCredentialCompositionV1;
};
