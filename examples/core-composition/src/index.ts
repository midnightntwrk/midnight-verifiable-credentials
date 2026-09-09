import { defineCredentialFamily } from "@midnight-ntwrk/credential-model";
import {
  decodeCompactValue,
  encodeCompactValue,
} from "@midnight-ntwrk/credential-compact";

export const syntheticFamily = defineCredentialFamily({
  id: "example.synthetic-score",
  version: "0.1.0",
  name: "Synthetic score credential",
  description: "Minimal metadata used to exercise both core packages.",
  schema: {
    id: "urn:example:synthetic-score",
    version: "1.0.0",
    name: "Synthetic score schema",
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
});

export const roundTripCompactValue = (
  value: readonly Uint8Array[],
): readonly Uint8Array[] => decodeCompactValue(encodeCompactValue(value));
