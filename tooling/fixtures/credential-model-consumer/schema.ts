import { defineCredentialSchema } from "@midnight-ntwrk/credential-model";

export const accessSchema = defineCredentialSchema({
  id: "urn:fixture:access",
  version: "1.0.0",
  name: "Access credential",
  credentialTypes: ["VerifiableCredential", "AccessCredential"],
  claims: [
    {
      id: "accessLevel",
      path: ["accessLevel"],
      disclosure: "selective",
      required: true,
    },
  ],
});
