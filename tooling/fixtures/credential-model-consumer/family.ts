import { defineCredentialFamily } from "@midnight-ntwrk/credential-model";

export const accessFamily = defineCredentialFamily({
  id: "fixture.access",
  version: "0.1.0",
  name: "Access credential",
  schema: {
    id: "urn:fixture:access",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "AccessCredential"],
    claims: [
      {
        id: "accessLevel",
        path: ["accessLevel"],
        disclosure: "selective",
        required: true,
      },
    ],
  },
});
