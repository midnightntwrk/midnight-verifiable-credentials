import {
  type AuthorityEvidencePolicyV1,
  type AuthorityVerificationContextV1,
  type DidMethodEvidenceProviderV1,
  type Sha256Digest,
  type TrustAuthorizationEvidenceProviderV1,
  type TrustedTimeAnchorVerifierV1,
  type TrustedTimeAttestationSignatureVerifierV1,
  type TrustedTimeAuthorityVerifierV1,
  type TrustedTimeCheckpointV1,
  type TrustedTimeEvidenceV1,
  type TrustedTimePolicyV1,
  type TrustedTimeScopeV1,
  type TrustedTimeSequenceKeyV1,
  type TrustedTimeVerificationResultV1,
  verifyAuthorityEvidenceV1,
  verifyTrustedTimeEvidenceV1,
} from "@midnight-ntwrk/credential-proofs";
import {
  computeStatusRecordDigestV1,
  computeStatusRegistryAuthorizationDigestV1,
  type StatusRegistryAuthorizationGateV1,
  type StatusRegistryAuthorizationRequestV1,
  type StatusRegistryOperatorV1,
  type StatusSha256DigestV1,
} from "@midnight-ntwrk/credential-status-midnight-contract";

export interface StatusAuthorityEvidenceInputV1 {
  readonly policy: AuthorityEvidencePolicyV1;
  readonly context: AuthorityVerificationContextV1;
  readonly signature: StatusAuthoritySignatureV1 | null;
  readonly trustedTimeEvidence: TrustedTimeEvidenceV1 | null;
}

export interface StatusTrustedTimeVerifierV1 {
  verify(input: {
    readonly request: StatusRegistryAuthorizationRequestV1;
    readonly authorizationDigest: StatusSha256DigestV1;
    readonly evidence: TrustedTimeEvidenceV1 | null;
  }): Promise<TrustedTimeVerificationResultV1>;
  commit?(checkpoint: TrustedTimeCheckpointV1): Promise<void>;
}

export interface StatusTrustedTimeCheckpointStoreV1 {
  read(key: TrustedTimeSequenceKeyV1): Promise<TrustedTimeCheckpointV1 | null>;
  /**
   * Atomically rejects stale, duplicate, or conflicting checkpoints for the
   * scope/source pair. A best-effort last-write-wins store is not sufficient.
   */
  commit(checkpoint: TrustedTimeCheckpointV1): Promise<void>;
}

export const createStatusTrustedTimeVerifierV1 = (input: {
  readonly policy: TrustedTimePolicyV1;
  readonly resolveScope: (request: StatusRegistryAuthorizationRequestV1) => TrustedTimeScopeV1;
  readonly anchorVerifier?: TrustedTimeAnchorVerifierV1;
  readonly authorityVerifier?: TrustedTimeAuthorityVerifierV1;
  readonly signatureVerifier?: TrustedTimeAttestationSignatureVerifierV1;
  readonly checkpointStore?: StatusTrustedTimeCheckpointStoreV1;
}): StatusTrustedTimeVerifierV1 => ({
  verify: async ({ request, authorizationDigest, evidence }) => {
    const scope = input.resolveScope(request);
    if (scope.requestDigest !== authorizationDigest) {
      return {
        status: "invalid",
        accepted: false,
        authoritative: false,
        authority: "local-process",
        trustedTime: null,
        reasonCodes: ["TRUSTED_TIME_SCOPE_MISMATCH"],
        evidenceDigest: null,
        anchorDigest: null,
        authorityTranscriptDigest: null,
        checkpoint: null,
      };
    }
    const sequenceKey: TrustedTimeSequenceKeyV1 = {
      formatVersion: 1,
      network: scope.network,
      deployment: scope.deployment,
      authority: input.policy.sequenceAuthority,
      sourcePolicyDigest: input.policy.sourcePolicyDigest,
    };
    const previousCheckpoint =
      await input.checkpointStore?.read(sequenceKey) ?? null;
    const verified = await verifyTrustedTimeEvidenceV1({
      policy: input.policy,
      scope,
      evidence,
      anchorVerifier: input.anchorVerifier,
      authorityVerifier: input.authorityVerifier,
      signatureVerifier: input.signatureVerifier,
      previousCheckpoint,
    });
    return verified;
  },
  ...(input.checkpointStore === undefined
    ? {}
    : { commit: (checkpoint: TrustedTimeCheckpointV1) => input.checkpointStore!.commit(checkpoint) }),
});

export type StatusAuthorityPolicyBindingV1 = Omit<
  AuthorityEvidencePolicyV1,
  "actors"
>;

export interface StatusDelegateGrantEvidenceV1 {
  readonly formatVersion: 1;
  readonly evidenceId: string;
  readonly authenticated: boolean;
  readonly status: "active" | "revoked";
  readonly controllerDid: string;
  readonly delegateDid: string;
  readonly delegateMethodId: string;
  readonly delegateKeyFingerprint: Sha256Digest;
  readonly relationship: "capabilityInvocation";
  readonly namespace: string;
  readonly registryId: string;
  readonly deployment: string;
  readonly authorityGeneration: number;
  readonly scopes: readonly ("revoke" | "attest")[];
  readonly notBefore: number;
  readonly expiresAt: number;
  readonly grantDigest: Sha256Digest;
}

export interface StatusDelegateGrantEvidenceRequestV1 {
  readonly binding: StatusRegistryAuthorizationRequestV1["binding"];
  readonly authorityGeneration: number;
  readonly operation: "revoke";
  readonly controllerDid: string;
  readonly operator: StatusRegistryOperatorV1;
  readonly acceptedAt: number;
}

export interface StatusDelegateGrantEvidenceProviderV1 {
  resolve(
    request: StatusDelegateGrantEvidenceRequestV1,
  ): Promise<StatusDelegateGrantEvidenceV1 | null | undefined>;
}

export const computeStatusAuthorityPolicyDigestV1 = (
  policy: AuthorityEvidencePolicyV1,
): StatusSha256DigestV1 => computeStatusRecordDigestV1(policy);

export const bindStatusAuthorityEvidenceV1 = (
  request: StatusRegistryAuthorizationRequestV1,
  policy: AuthorityEvidencePolicyV1,
  context: Omit<AuthorityVerificationContextV1, "requestDigest">,
  trustedTimeEvidence: TrustedTimeEvidenceV1 | null = null,
): StatusRegistryAuthorizationRequestV1 => {
  const authorityPolicyDigest = computeStatusAuthorityPolicyDigestV1(policy);
  const boundRequest: StatusRegistryAuthorizationRequestV1 = {
    ...request,
    authorityPolicyDigest,
    authorityEvidence: null,
  };
  const requestDigest = computeStatusRegistryAuthorizationDigestV1(boundRequest);
  return {
    ...boundRequest,
    authorityEvidence: {
      policy,
      context: { ...context, requestDigest: requestDigest as Sha256Digest },
      signature: null,
      trustedTimeEvidence,
    } satisfies StatusAuthorityEvidenceInputV1,
  };
};

export const attachStatusAuthoritySignatureV1 = (
  request: StatusRegistryAuthorizationRequestV1,
  signature: StatusAuthoritySignatureV1,
): StatusRegistryAuthorizationRequestV1 => {
  const evidence = evidenceInput(request.authorityEvidence);
  if (evidence === null) {
    throw new TypeError("status authority evidence must be bound before attaching a signature");
  }
  const payloadDigest = computeStatusRegistryAuthorizationDigestV1(request);
  if (
    signature.formatVersion !== 1 ||
    signature.payloadDigest !== payloadDigest ||
    signature.signature.length === 0 ||
    signature.signer.did !== request.operator.did ||
    signature.signer.methodId !== request.operator.methodId ||
    signature.signer.keyFingerprint !== request.operator.keyFingerprint ||
    signature.signer.relationship !== request.operator.relationship
  ) {
    throw new TypeError("status authorization signature does not match the bound request");
  }
  return {
    ...request,
    authorityEvidence: { ...evidence, signature },
  };
};

const policyBinding = (
  policy: AuthorityEvidencePolicyV1,
): StatusAuthorityPolicyBindingV1 => ({
  formatVersion: policy.formatVersion,
  profile: policy.profile,
  did: policy.did,
  trust: policy.trust,
  providers: policy.providers,
});

const evidenceInput = (value: unknown): StatusAuthorityEvidenceInputV1 | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const candidate = value as Partial<StatusAuthorityEvidenceInputV1>;
  return candidate.policy === undefined || candidate.context === undefined
    ? null
    : {
        ...candidate,
        signature: candidate.signature ?? null,
        trustedTimeEvidence: candidate.trustedTimeEvidence ?? null,
      } as StatusAuthorityEvidenceInputV1;
};

const decision = (
  status: "valid" | "invalid" | "indeterminate",
  reasonCodes: readonly string[],
  transcriptDigest: StatusSha256DigestV1,
  delegateGrantDigest: StatusSha256DigestV1 | null = null,
) => ({
  status,
  accepted: status === "valid",
  reasonCodes,
  transcriptDigest,
  delegateGrantDigest,
});

const grantReasons = (input: {
  readonly grant: StatusDelegateGrantEvidenceV1;
  readonly request: StatusRegistryAuthorizationRequestV1;
  readonly controllerDid: string;
  readonly acceptedAt: number;
}): readonly string[] => {
  const { grant, request, controllerDid, acceptedAt } = input;
  const reasons: string[] = [];
  if (!grant.authenticated) reasons.push("DELEGATE_GRANT_UNAUTHENTICATED");
  if (grant.status !== "active") reasons.push("DELEGATE_GRANT_REVOKED");
  if (grant.controllerDid !== controllerDid) reasons.push("DELEGATE_GRANT_CONTROLLER_MISMATCH");
  if (grant.delegateDid !== request.operator.did) reasons.push("DELEGATE_DID_MISMATCH");
  if (grant.delegateMethodId !== request.operator.methodId) reasons.push("DELEGATE_METHOD_MISMATCH");
  if (grant.delegateKeyFingerprint !== request.operator.keyFingerprint) reasons.push("DELEGATE_KEY_MISMATCH");
  if (grant.relationship !== "capabilityInvocation") reasons.push("DELEGATE_RELATIONSHIP_MISMATCH");
  if (grant.namespace !== request.binding.namespace) reasons.push("DELEGATE_NAMESPACE_MISMATCH");
  if (grant.registryId !== request.binding.registryId) reasons.push("DELEGATE_REGISTRY_MISMATCH");
  if (grant.deployment !== request.binding.deployment) reasons.push("DELEGATE_DEPLOYMENT_MISMATCH");
  if (grant.authorityGeneration !== request.authorityGeneration) reasons.push("DELEGATE_GENERATION_MISMATCH");
  if (!grant.scopes.includes("revoke")) reasons.push("DELEGATE_SCOPE_MISMATCH");
  if (
    !Number.isSafeInteger(grant.notBefore) ||
    !Number.isSafeInteger(grant.expiresAt) ||
    grant.notBefore < 0 ||
    grant.expiresAt < grant.notBefore
  ) {
    reasons.push("DELEGATE_GRANT_TIME_INVALID");
  } else {
    if (acceptedAt < grant.notBefore) reasons.push("DELEGATE_NOT_YET_VALID");
    if (acceptedAt > grant.expiresAt) reasons.push("DELEGATE_EXPIRED");
  }
  return reasons;
};

export const createStatusRegistryAuthorityGateV1 = (input: {
  readonly controllerDid: string;
  readonly policy: StatusAuthorityPolicyBindingV1;
  readonly didProvider: DidMethodEvidenceProviderV1;
  readonly trustProvider: TrustAuthorizationEvidenceProviderV1;
  readonly signatureVerifier: StatusAuthoritySignatureVerifierV1;
  readonly delegateGrantProvider: StatusDelegateGrantEvidenceProviderV1;
  readonly trustedTimeVerifier: StatusTrustedTimeVerifierV1;
}): StatusRegistryAuthorizationGateV1 => ({
  authorize: async ({ request, authorizationDigest, currentState }) => {
    const evidence = evidenceInput(request.authorityEvidence);
    if (evidence === null) {
      return decision("indeterminate", ["AUTHORITY_EVIDENCE_UNAVAILABLE"], authorizationDigest);
    }
    if (computeStatusAuthorityPolicyDigestV1(evidence.policy) !== request.authorityPolicyDigest) {
      return decision("invalid", ["AUTHORITY_POLICY_DIGEST_MISMATCH"], authorizationDigest);
    }
    if (
      computeStatusRecordDigestV1(policyBinding(evidence.policy)) !==
      computeStatusRecordDigestV1(input.policy)
    ) {
      return decision("invalid", ["UNACCEPTED_AUTHORITY_POLICY"], authorizationDigest);
    }
    if (evidence.policy.did.network !== request.binding.network) {
      return decision("invalid", ["AUTHORITY_NETWORK_MISMATCH"], authorizationDigest);
    }
    if (evidence.context.requestDigest !== authorizationDigest) {
      return decision("invalid", ["AUTHORIZATION_TRANSCRIPT_MISMATCH"], authorizationDigest);
    }
    let trustedTime: TrustedTimeVerificationResultV1;
    try {
      trustedTime = await input.trustedTimeVerifier.verify({
        request,
        authorizationDigest,
        evidence: evidence.trustedTimeEvidence,
      });
    } catch {
      return decision("indeterminate", ["AUTHORITY_TIME_UNAVAILABLE"], authorizationDigest);
    }
    if (
      trustedTime.status !== "valid" ||
      !trustedTime.accepted ||
      !trustedTime.authoritative ||
      !Number.isSafeInteger(trustedTime.trustedTime) ||
      trustedTime.trustedTime === null ||
      trustedTime.trustedTime < 0
    ) {
      const unavailable = trustedTime.status === "indeterminate";
      return decision(
        unavailable ? "indeterminate" : "invalid",
        [unavailable ? "AUTHORITY_TIME_UNAVAILABLE" : "AUTHORITY_TIME_INVALID", ...trustedTime.reasonCodes],
        authorizationDigest,
      );
    }
    const acceptedAt = trustedTime.trustedTime;
    const acceptTrustedTime = async (
      accepted: ReturnType<typeof decision>,
    ): Promise<ReturnType<typeof decision>> => {
      if (trustedTime.checkpoint !== null) {
        if (input.trustedTimeVerifier.commit === undefined) {
          return decision(
            "indeterminate",
            ["AUTHORITY_TIME_CHECKPOINT_UNAVAILABLE"],
            authorizationDigest,
          );
        }
        try {
          await input.trustedTimeVerifier.commit(trustedTime.checkpoint);
        } catch {
          return decision(
            "indeterminate",
            ["AUTHORITY_TIME_CHECKPOINT_UNAVAILABLE"],
            authorizationDigest,
          );
        }
      }
      return accepted;
    };
    if (request.issuedAt > acceptedAt) {
      return decision("invalid", ["AUTHORIZATION_NOT_YET_VALID"], authorizationDigest);
    }
    if (request.expiresAt < acceptedAt || request.expiresAt < request.issuedAt) {
      return decision("invalid", ["AUTHORIZATION_EXPIRED"], authorizationDigest);
    }

    const verified = await verifyAuthorityEvidenceV1({
      policy: evidence.policy,
      context: evidence.context,
      didProvider: input.didProvider,
      trustProvider: input.trustProvider,
    });
    if (!verified.accepted) {
      const unavailable = verified.reasonCodes.some((reason) => reason.endsWith("_EVIDENCE_UNAVAILABLE"));
      return decision(
        unavailable ? "indeterminate" : "invalid",
        [unavailable ? "AUTHORITY_EVIDENCE_UNAVAILABLE" : "AUTHORITY_EVIDENCE_INVALID", ...verified.reasonCodes],
        verified.transcriptDigest,
      );
    }

    const statusActor = evidence.policy.actors.find((actor) => actor.role === "status");
    if (
      statusActor === undefined ||
      statusActor.did !== request.operator.did ||
      statusActor.methodId !== request.operator.methodId ||
      statusActor.keyFingerprint !== request.operator.keyFingerprint ||
      statusActor.relationship !== "capabilityInvocation"
    ) {
      return decision("invalid", ["STATUS_OPERATOR_EVIDENCE_MISMATCH"], verified.transcriptDigest);
    }

    const signature = evidence.signature;
    if (signature === null) {
      return decision("invalid", ["AUTHORIZATION_SIGNATURE_MISSING"], verified.transcriptDigest);
    }
    if (
      signature.formatVersion !== 1 ||
      signature.payloadDigest !== authorizationDigest ||
      signature.signature.length === 0 ||
      signature.signer.did !== request.operator.did ||
      signature.signer.methodId !== request.operator.methodId ||
      signature.signer.keyFingerprint !== request.operator.keyFingerprint ||
      signature.signer.relationship !== request.operator.relationship
    ) {
      return decision("invalid", ["AUTHORIZATION_SIGNATURE_INVALID"], verified.transcriptDigest);
    }
    let signatureValid: boolean;
    try {
      signatureValid = await input.signatureVerifier.verify({
        domain: "midnight:vc:status-authorization:v1",
        payloadDigest: authorizationDigest,
        signer: request.operator,
        signature: signature.signature,
      });
    } catch {
      return decision("indeterminate", ["AUTHORIZATION_SIGNATURE_UNAVAILABLE"], verified.transcriptDigest);
    }
    if (!signatureValid) {
      return decision("invalid", ["AUTHORIZATION_SIGNATURE_INVALID"], verified.transcriptDigest);
    }

    if (request.operation === "initialize") {
      return request.operator.did === input.controllerDid
        ? acceptTrustedTime(decision("valid", [], verified.transcriptDigest))
        : decision("invalid", ["INITIAL_CONTROLLER_MISMATCH"], verified.transcriptDigest);
    }
    if (currentState.controllerDid === request.operator.did) {
      return acceptTrustedTime(decision("valid", [], verified.transcriptDigest));
    }
    if (currentState.controllerDid === null) {
      return decision("invalid", ["CONTROLLER_STATE_UNAVAILABLE"], verified.transcriptDigest);
    }

    let grant: StatusDelegateGrantEvidenceV1 | null;
    try {
      grant = await input.delegateGrantProvider.resolve({
        binding: request.binding,
        authorityGeneration: request.authorityGeneration,
        operation: "revoke",
        controllerDid: currentState.controllerDid,
        operator: request.operator,
        acceptedAt,
      }) ?? null;
    } catch {
      grant = null;
    }
    if (grant === null) {
      return decision("indeterminate", ["DELEGATE_GRANT_EVIDENCE_UNAVAILABLE"], verified.transcriptDigest);
    }
    const reasons = grantReasons({ grant, request, controllerDid: currentState.controllerDid, acceptedAt });
    if (reasons.length > 0) {
      return decision("invalid", reasons, verified.transcriptDigest, grant.grantDigest);
    }
    return acceptTrustedTime(
      decision("valid", [], verified.transcriptDigest, grant.grantDigest),
    );
  },
});

export interface StatusAuthoritySignatureV1 {
  readonly formatVersion: 1;
  readonly signer: StatusRegistryOperatorV1;
  readonly payloadDigest: StatusSha256DigestV1;
  readonly signature: Uint8Array;
}

export interface StatusAuthoritySignerV1 {
  sign(input: {
    readonly domain: "midnight:vc:status-authorization:v1";
    readonly payloadDigest: StatusSha256DigestV1;
    readonly signer: StatusRegistryOperatorV1;
  }): Promise<StatusAuthoritySignatureV1>;
}

export interface StatusAuthoritySignatureVerifierV1 {
  verify(input: {
    readonly domain: "midnight:vc:status-authorization:v1";
    readonly payloadDigest: StatusSha256DigestV1;
    readonly signer: StatusRegistryOperatorV1;
    readonly signature: Uint8Array;
  }): Promise<boolean>;
}

export const signStatusAuthorizationV1 = async (
  request: StatusRegistryAuthorizationRequestV1,
  signer: StatusAuthoritySignerV1,
): Promise<StatusAuthoritySignatureV1> => {
  const payloadDigest = computeStatusRegistryAuthorizationDigestV1(request);
  const signed = await signer.sign({
    domain: "midnight:vc:status-authorization:v1",
    payloadDigest,
    signer: request.operator,
  });
  if (
    signed.payloadDigest !== payloadDigest ||
    signed.signature.length === 0 ||
    signed.signer.did !== request.operator.did ||
    signed.signer.methodId !== request.operator.methodId ||
    signed.signer.keyFingerprint !== request.operator.keyFingerprint
  ) {
    throw new TypeError("status authorization signer returned a mismatched signature binding");
  }
  return signed;
};
