import {
  type AuthorityEvidencePolicyV1,
  type AuthorityEvidenceVerificationResultV1,
  base64UrlEncode,
  computeSha256Digest,
  type DidMethodEvidenceProviderV1,
  serializeCanonicalJson,
  type Sha256Digest,
  type TrustAuthorizationEvidenceProviderV1,
  verifyAuthorityEvidenceV1,
} from "@midnight-ntwrk/credential-proofs";

import {
  assertCanonicalMessage,
  type CanonicalFamilyIdentity,
  type CanonicalMessage,
} from "./canonical-messages.js";
import type {
  InjectedCredentialFamilyAdapter,
  VerificationResult,
} from "./ports.js";

export interface AuthorityBoundPresentationContextV1 {
  readonly proofDigest: Sha256Digest;
  readonly credentialDigest: Sha256Digest;
}

export interface AuthorityBoundPresentationVerificationResultV1
  extends VerificationResult {
  readonly authority: AuthorityEvidenceVerificationResultV1 | null;
  readonly familyValid: boolean;
}

export interface AuthorityBoundVerifierOptionsV1 {
  readonly policy: AuthorityEvidencePolicyV1;
  readonly didProvider: DidMethodEvidenceProviderV1;
  readonly trustProvider: TrustAuthorizationEvidenceProviderV1;
}

const canonicalIdentity = (
  adapter: InjectedCredentialFamilyAdapter,
): CanonicalFamilyIdentity => ({
  familyId: adapter.family.id,
  familyVersion: adapter.family.version,
  schemaId: adapter.family.schema.id,
  schemaVersion: adapter.family.schema.version,
});

const digestCanonicalMessage = async (
  message: CanonicalMessage,
): Promise<Sha256Digest> =>
  computeSha256Digest(
    serializeCanonicalJson({
      familyId: message.familyId,
      familyVersion: message.familyVersion,
      schemaId: message.schemaId,
      schemaVersion: message.schemaVersion,
      kind: message.kind,
      mediaType: message.mediaType,
      payload: base64UrlEncode(message.payload),
    }),
  );

/**
 * Runtime adapter that keeps family proof verification separate from injected
 * DID/trust authority resolution. Arbitrary family inputs (including private
 * holder witnesses) are never forwarded to authority providers or transcripts.
 */
export class AuthorityBoundVerifierAgent<
  TResult extends VerificationResult = VerificationResult,
> {
  constructor(
    private readonly adapter: InjectedCredentialFamilyAdapter<TResult>,
    private readonly options: AuthorityBoundVerifierOptionsV1,
  ) {}

  async verify(
    presentation: CanonicalMessage<"presentation">,
    request: CanonicalMessage<"presentation-request">,
    context: AuthorityBoundPresentationContextV1,
    input?: unknown,
  ): Promise<AuthorityBoundPresentationVerificationResultV1> {
    const identity = canonicalIdentity(this.adapter);
    assertCanonicalMessage(presentation, identity, "presentation");
    assertCanonicalMessage(request, identity, "presentation-request");

    const familyResult = this.adapter.verification.verify(
      presentation,
      request,
      input,
    );
    assertCanonicalMessage(
      familyResult.canonicalPresentation,
      identity,
      "presentation",
    );

    if (!familyResult.valid) {
      return {
        valid: false,
        familyValid: false,
        canonicalPresentation: familyResult.canonicalPresentation,
        reason: familyResult.reason ?? "Family verification failed",
        authority: null,
      };
    }

    const [presentationDigest, requestDigest] = await Promise.all([
      digestCanonicalMessage(familyResult.canonicalPresentation),
      digestCanonicalMessage(request),
    ]);
    const authority = await verifyAuthorityEvidenceV1({
      policy: this.options.policy,
      context: {
        proofDigest: context.proofDigest,
        credentialDigest: context.credentialDigest,
        presentationDigest,
        requestDigest,
      },
      didProvider: this.options.didProvider,
      trustProvider: this.options.trustProvider,
    });

    return {
      valid: authority.accepted,
      familyValid: true,
      canonicalPresentation: familyResult.canonicalPresentation,
      ...(authority.accepted
        ? {}
        : { reason: authority.reasonCodes.join(",") || "Authority unavailable" }),
      authority,
    };
  }
}
