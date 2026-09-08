import {
  defineCredentialFamily,
  type CredentialCodec,
  type PresentationCodec,
} from "@midnight-ntwrk/credential-model";
import {
  decodeCompactValue,
  encodeCompactValue,
} from "@midnight-ntwrk/credential-compact";

export interface SyntheticCredential {
  readonly subject: string;
  readonly score: number;
}

export interface SyntheticPresentation {
  readonly subject: string;
}

const jsonCodec = <T>(): CredentialCodec<T, string> => ({
  mediaType: "application/json",
  encode: JSON.stringify,
  decode: (encoded) => JSON.parse(encoded) as T,
});

const presentationCodec: PresentationCodec<SyntheticPresentation, string> =
  jsonCodec<SyntheticPresentation>();

export const syntheticFamily = defineCredentialFamily({
  id: "example.synthetic-score",
  version: "0.1.0",
  schema: {
    id: "urn:example:synthetic-score",
    version: "1.0.0",
    credentialTypes: ["VerifiableCredential", "SyntheticScoreCredential"],
    claims: [
      {
        id: "subject",
        path: ["subject"],
        disclosure: "selective",
        required: true,
      },
      {
        id: "score",
        path: ["score"],
        disclosure: "committed",
        required: true,
      },
    ],
  },
  capabilities: [],
  artifacts: [],
  composition: {
    formatVersion: 1,
    packages: [
      {
        name: "@midnight-ntwrk/credential-model",
        version: "0.2.0",
        exports: ["."],
      },
      {
        name: "@midnight-ntwrk/credential-compact",
        version: "0.2.0",
        exports: ["."],
      },
    ],
  },
  credentialCodec: jsonCodec<SyntheticCredential>(),
  presentationCodec,
});

export const roundTripCompactValue = (
  value: readonly Uint8Array[],
): readonly Uint8Array[] => decodeCompactValue(encodeCompactValue(value));
