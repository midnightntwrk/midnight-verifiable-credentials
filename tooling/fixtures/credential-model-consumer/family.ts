import {
  defineCredentialFamily,
  type CredentialCodec,
  type PresentationCodec,
} from "@midnight-ntwrk/credential-model";

export interface AccessCredential {
  accessLevel: number;
}

export interface AccessPresentation {
  minimumAccessLevel: number;
}

const credentialCodec: CredentialCodec<AccessCredential, string> = {
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: (value) => JSON.parse(value) as AccessCredential,
};

const presentationCodec: PresentationCodec<AccessPresentation, string> = {
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: (value) => JSON.parse(value) as AccessPresentation,
};

export const accessFamily = defineCredentialFamily({
  id: "fixture.access",
  version: "0.1.0",
  schema: {
    id: "urn:fixture:access",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "AccessCredential"],
    claims: [
      {
        id: "accessLevel",
        path: ["accessLevel"],
        disclosure: "predicate-only",
        required: true,
      },
    ],
  },
  capabilities: [
    {
      id: "proof.range",
      kind: "proof",
      required: true,
    },
  ],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [],
  },
  credentialCodec,
  presentationCodec,
});
