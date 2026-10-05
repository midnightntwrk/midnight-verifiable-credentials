import {
  midnightDIDMethodId,
  signMidnightDIDCredentialProof,
  signMidnightDIDPresentationProof,
  type MidnightDIDMethodBinding,
  type MidnightDIDResolutionSource,
} from "@midnight-ntwrk/credential-did-midnight";

export const fragmentHash = midnightDIDMethodId("#key-1");

export const acceptsBinding = (
  binding: MidnightDIDMethodBinding,
): bigint => binding.didStateVersion;

export const acceptsResolver = (
  resolver: MidnightDIDResolutionSource,
): MidnightDIDResolutionSource => resolver;

interface ExtendedResolutionDocument {
  readonly id: Parameters<MidnightDIDResolutionSource["resolveResult"]>[0];
  readonly keyAgreement: readonly string[];
}

interface ExtendedResolutionMetadata {
  readonly versionId: string;
  readonly created: string;
}

export const openDocumentResolver: MidnightDIDResolutionSource = {
  resolveResult: async (did) => {
    const didDocument: ExtendedResolutionDocument = {
      id: did,
      keyAgreement: [],
    };
    const didDocumentMetadata: ExtendedResolutionMetadata = {
      versionId: "1",
      created: "2026-09-29",
    };
    return { didDocument, didDocumentMetadata };
  },
};

export const signingHelpers = {
  credential: signMidnightDIDCredentialProof,
  presentation: signMidnightDIDPresentationProof,
};
