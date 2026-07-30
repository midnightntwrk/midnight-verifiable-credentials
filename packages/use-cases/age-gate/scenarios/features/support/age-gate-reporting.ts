import type { AgeGateStepInsightPayload } from "./age-gate-step-insight.js";
import type { AgeGateScenarioResult } from "./age-gate-scenario.js";
import type { HiddenHolderScenarioResult } from "./hidden-holder-scenario.js";

export type AgeGateScenarioNarrative = Omit<
  AgeGateStepInsightPayload,
  "dto"
> & {
  readonly taskName: string;
  readonly interactionName: string;
  readonly insightTitle: string;
};

export type AgeGateScenarioNarrativeKey =
  | "birthCredentialHappyPath"
  | "hiddenHolderRevocationAwareHappyPath"
  | "hiddenHolderLiveStatusHappyPath"
  | "hiddenHolderWrongRegistryRejectedPath"
  | "hiddenHolderWrongRevokedRootRejectedPath"
  | "hiddenHolderStaleSnapshotRejectedPath"
  | "hiddenHolderExpiredAuthorityAttestationRejectedPath"
  | "hiddenHolderWrongAuthorityRejectedPath"
  | "hiddenHolderUnsupportedAuthorityModeRejectedPath"
  | "hiddenHolderRevokedCredentialRejectedPath"
  | "hiddenHolderLiveStatusRevokedRejectedPath";

export const AGE_GATE_SCENARIO_NARRATIVE_KEYS = [
  "birthCredentialHappyPath",
  "hiddenHolderRevocationAwareHappyPath",
  "hiddenHolderLiveStatusHappyPath",
  "hiddenHolderWrongRegistryRejectedPath",
  "hiddenHolderWrongRevokedRootRejectedPath",
  "hiddenHolderStaleSnapshotRejectedPath",
  "hiddenHolderExpiredAuthorityAttestationRejectedPath",
  "hiddenHolderWrongAuthorityRejectedPath",
  "hiddenHolderUnsupportedAuthorityModeRejectedPath",
  "hiddenHolderRevokedCredentialRejectedPath",
  "hiddenHolderLiveStatusRevokedRejectedPath",
] as const satisfies readonly AgeGateScenarioNarrativeKey[];

export const AGE_GATE_SCENARIO_NARRATIVES = {
  birthCredentialHappyPath: {
    taskName: "#actor runs the birth credential age-gate happy path",
    interactionName:
      "#actor executes the age-gate scenario against the VC simulator",
    insightTitle: "Age-gate happy-path step insight",
    request:
      "Issue a DID-bound birth credential, present an age predicate, and claim the age-gate capability.",
    response:
      "The simulator accepts the credential, verifies one presentation, and consumes one access capability.",
    checks: [
      "One credential is issued.",
      "One presentation is verified.",
      "The verified credential root matches the expected birth credential body root.",
    ],
  },
  hiddenHolderRevocationAwareHappyPath: {
    taskName: "#actor runs the hidden-holder revocation-aware happy path",
    interactionName:
      "#actor executes the hidden-holder scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder revoked-set happy-path step insight",
    request:
      "Issue a hidden-holder birth credential and verify it against a verifier-supplied revoked-set snapshot.",
    response:
      "The revocation-aware simulator accepts the presentation and consumes one access capability.",
    checks: [
      "The status registry id used by the verifier matches the fixture registry.",
      "The verifier-supplied snapshot is fresh enough for the request.",
      "No failure code is recorded on the happy path.",
    ],
  },
  hiddenHolderLiveStatusHappyPath: {
    taskName:
      "#actor runs the hidden-holder same-contract live-status happy path",
    interactionName:
      "#actor executes the hidden-holder same-contract live-status scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder live-status happy-path step insight",
    request:
      "Verify a hidden-holder age-gate presentation against the same contract's live local status registry.",
    response:
      "The simulator accepts the live-status proof and consumes one access capability.",
    checks: [
      "The live status registry is initialized before verification.",
      "The verified registry id matches the fixture registry.",
      "No revoked handle is present for the credential.",
    ],
  },
  hiddenHolderWrongRegistryRejectedPath: {
    taskName: "#actor runs the hidden-holder wrong-registry rejection path",
    interactionName:
      "#actor executes the hidden-holder wrong-registry scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder wrong-registry rejection step insight",
    request:
      "Submit a revoked-set witness whose registry id diverges from the verifier request.",
    response:
      "The simulator rejects the presentation with a status-request mismatch.",
    checks: [
      "The status registry id is part of the verifier-bound request.",
      "A witness for another registry cannot satisfy the request.",
      "The result is a hard VC/VP rejection, not a business denial.",
    ],
  },
  hiddenHolderWrongRevokedRootRejectedPath: {
    taskName: "#actor runs the hidden-holder wrong-root rejection path",
    interactionName:
      "#actor executes the hidden-holder wrong-root scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder wrong-root rejection step insight",
    request:
      "Submit a revoked-set witness whose revoked root diverges from the verifier snapshot.",
    response:
      "The simulator rejects the presentation with a status-request mismatch.",
    checks: [
      "The revoked root is request-bound.",
      "A witness for another root cannot satisfy the request.",
      "The failure code stays stable for report consumers.",
    ],
  },
  hiddenHolderStaleSnapshotRejectedPath: {
    taskName: "#actor runs the hidden-holder stale-snapshot rejection path",
    interactionName:
      "#actor executes the hidden-holder stale-snapshot scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder stale-snapshot rejection step insight",
    request:
      "Submit a verifier-supplied status snapshot whose version is older than the verifier request accepts.",
    response:
      "The simulator rejects the presentation before capability issuance.",
    checks: [
      "The registry version is verifier-bound.",
      "Stale snapshots fail closed.",
      "The canonical failure code is statusRequestMismatch.",
    ],
  },
  hiddenHolderExpiredAuthorityAttestationRejectedPath: {
    taskName:
      "#actor runs the hidden-holder expired-attestation rejection path",
    interactionName:
      "#actor executes the hidden-holder expired-attestation scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder expired-attestation rejection step insight",
    request:
      "Submit an authority-attested status proof whose attestation exceeds the verifier max-age policy.",
    response:
      "The simulator rejects the presentation as too old for the verifier freshness policy.",
    checks: [
      "The verifier policy defines a maximum status-attestation age.",
      "Expired authority attestations fail closed.",
      "The canonical failure code is attestationTooOld.",
    ],
  },
  hiddenHolderWrongAuthorityRejectedPath: {
    taskName: "#actor runs the hidden-holder wrong-authority rejection path",
    interactionName:
      "#actor executes the hidden-holder wrong-authority scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder wrong-authority rejection step insight",
    request:
      "Submit an authority-attested status proof signed by a different authority than the verifier trusts.",
    response:
      "The simulator rejects the presentation with an authority identity mismatch.",
    checks: [
      "The authority key is verifier-bound.",
      "A valid signature from the wrong authority is not enough.",
      "The canonical failure code is authorityMismatch.",
    ],
  },
  hiddenHolderUnsupportedAuthorityModeRejectedPath: {
    taskName:
      "#actor runs the hidden-holder unsupported authority-mode rejection path",
    interactionName:
      "#actor executes the hidden-holder unsupported authority-mode scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder unsupported-mode rejection step insight",
    request:
      "Submit an authority-attested proof when the verifier request expects another status proof mode.",
    response:
      "The simulator rejects the presentation because the verifier did not opt in to that proof mode.",
    checks: [
      "Status proof mode is part of the verifier policy.",
      "Unsupported proof modes fail closed.",
      "The canonical failure code is unsupportedStatusProofMode.",
    ],
  },
  hiddenHolderRevokedCredentialRejectedPath: {
    taskName: "#actor runs the hidden-holder revoked-credential rejection path",
    interactionName:
      "#actor executes the hidden-holder revoked-credential scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder revoked-credential rejection step insight",
    request:
      "Build a hidden-holder credential whose status handle is already in the revoked set before proof assembly.",
    response:
      "The simulator rejects the flow before assembling a presentation proof.",
    checks: [
      "The revoked handle is present in the status snapshot.",
      "Revocation is a hard credential invalidity.",
      "The canonical failure code is revoked.",
    ],
  },
  hiddenHolderLiveStatusRevokedRejectedPath: {
    taskName:
      "#actor runs the hidden-holder same-contract live-status revoked rejection path",
    interactionName:
      "#actor executes the hidden-holder same-contract live-status revoked scenario against the revocation demo simulator",
    insightTitle: "Hidden-holder live-status revoked rejection step insight",
    request:
      "Verify a hidden-holder presentation after the same contract's live local registry revoked its handle.",
    response:
      "The simulator rejects the presentation against live status before capability consumption.",
    checks: [
      "The live status registry contains the credential handle.",
      "Same-contract live-status checks fail closed.",
      "The canonical failure code is revoked.",
    ],
  },
} as const satisfies Record<
  AgeGateScenarioNarrativeKey,
  AgeGateScenarioNarrative
>;

const bytesEqual = (left: Uint8Array, right: Uint8Array): boolean =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

export const summarizeAgeGateResult = (result: AgeGateScenarioResult) => ({
  approved: result.approved,
  claimDecision: result.claimDecision,
  issuedCredentialCount: result.issuedCredentialCount,
  verifiedPresentationCount: result.verifiedPresentationCount,
  consumedAccessCapabilityCount: result.consumedAccessCapabilityCount,
  credentialRootMatches: bytesEqual(
    result.lastVerifiedCredentialRoot,
    result.expectedCredentialRoot,
  ),
  lastVerifiedCredentialRoot: result.lastVerifiedCredentialRoot,
  expectedCredentialRoot: result.expectedCredentialRoot,
  verifierChallengeHash: result.lastVerifiedRequestChallenge,
});

export const summarizeHiddenHolderResult = (
  result: HiddenHolderScenarioResult,
) => ({
  approved: result.approved,
  claimDecision: result.claimDecision,
  verificationMode: result.verificationMode,
  issuedCredentialCount: result.issuedCredentialCount,
  verifiedPresentationCount: result.verifiedPresentationCount,
  consumedAccessCapabilityCount: result.consumedAccessCapabilityCount,
  statusRegistryMatches: bytesEqual(
    result.lastVerifiedStatusRegistryId,
    result.expectedStatusRegistryId,
  ),
  lastVerifiedStatusRegistryId: result.lastVerifiedStatusRegistryId,
  expectedStatusRegistryId: result.expectedStatusRegistryId,
  failureMessage: result.failureMessage,
  failureCode: result.failureCode,
});

export const buildAgeGateScenarioInsight = (
  narrative: AgeGateScenarioNarrative,
  result: AgeGateScenarioResult,
): AgeGateStepInsightPayload => ({
  request: narrative.request,
  response: narrative.response,
  checks: narrative.checks,
  dto: summarizeAgeGateResult(result),
});

export const buildHiddenHolderScenarioInsight = (
  narrative: AgeGateScenarioNarrative,
  result: HiddenHolderScenarioResult,
): AgeGateStepInsightPayload => ({
  request: narrative.request,
  response: narrative.response,
  checks: narrative.checks,
  dto: summarizeHiddenHolderResult(result),
});
