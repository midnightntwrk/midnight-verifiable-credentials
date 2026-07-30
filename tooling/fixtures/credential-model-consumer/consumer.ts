import { type CredentialFamilyDefinition } from "@midnight-ntwrk/credential-model";

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
