import {
  assertCredentialFamilyDefinition,
  type CredentialFamilyDefinition,
} from "@midnight-ntwrk/credential-model";

import { accessFamily } from "./family.js";

export const typedFamily: CredentialFamilyDefinition = accessFamily;

export const parseCredentialFamily = (
  value: unknown,
): CredentialFamilyDefinition => {
  assertCredentialFamilyDefinition(value);
  return value;
};
