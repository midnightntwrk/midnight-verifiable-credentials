import {
  assertCredentialSchemaDefinition,
  type CredentialSchemaDefinition,
} from "@midnight-ntwrk/credential-model";

import { accessSchema } from "./schema.js";

export const typedSchema: CredentialSchemaDefinition = accessSchema;

export const parseCredentialSchema = (
  value: unknown,
): CredentialSchemaDefinition => {
  assertCredentialSchemaDefinition(value);
  return value;
};
