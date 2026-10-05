export type ClaimDisclosure =
  | "public"
  | "selective"
  | "committed"
  | "predicate-only";

export interface CredentialClaimDescriptor {
  readonly id: string;
  readonly path: readonly [string, ...string[]];
  readonly disclosure: ClaimDisclosure;
  readonly required: boolean;
  readonly valueType?: string;
}

export interface CredentialSchemaDefinition {
  readonly id: string;
  readonly version: string;
  readonly name?: string;
  readonly description?: string;
  readonly credentialTypes: readonly [string, ...string[]];
  readonly claims: readonly CredentialClaimDescriptor[];
}
